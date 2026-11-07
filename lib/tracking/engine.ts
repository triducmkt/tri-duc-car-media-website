/**
 * Browser-side behaviour recorder. Runs only after the visitor accepts the
 * consent banner (components/analytics/Tracker.tsx).
 *
 * Three layers of data, all batched and sent to /api/track every 60 s and
 * when the tab is hidden/closed (sendBeacon):
 *  1. events  — page_view, click, cta_click, rage_click, scroll_depth, form_start,
 *               form_submit, survey_answer, copy, visibility, js_error, page_end…
 *  2. sensors — one per 1 cm cell (see lib/tracking/grid.ts): hover ms, pointer
 *               moves and clicks that happened inside that centimetre.
 *  3. rows    — "attention": ms each 1 cm horizontal band spent inside the viewport.
 * The server adds IP, geo and user-agent; the browser never sees those.
 *
 * Never recorded: what people type into fields, passwords, page content.
 */
import { CM_PX, cellOf, layoutBucket, TRACK_EVENT, type LayoutBucket } from "./grid";

type Primitive = string | number | boolean;
type TrackedEvent = { type: string; ts: number } & Record<string, Primitive>;
type Sensor = { hover: number; moves: number; clicks: number };

const ENDPOINT = "/api/track";
const FLUSH_MS = 60_000; // each flush = 1 Worker request (Cloudflare Free: 100k/day, hq/lesson.md ERR-WEB-009)
const IDLE_MS = 30_000; // no input for this long → time stops counting as "active"
const HOVER_GAP_CAP = 2_000; // pointer resting > 2 s in one cell counts as at most 2 s per sample
const SESSION_TIMEOUT = 30 * 60_000;
const RAGE_WINDOW = 800;

function uid() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function storageGet(store: Storage, key: string) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}
function storageSet(store: Storage, key: string, value: string) {
  try {
    store.setItem(key, value);
  } catch {
    /* private mode — ids just won't persist */
  }
}

function visitorId() {
  let id = storageGet(localStorage, "td_vid");
  if (!id) {
    id = uid();
    storageSet(localStorage, "td_vid", id);
  }
  return id;
}

function sessionId() {
  const now = Date.now();
  const last = Number(storageGet(localStorage, "td_sid_at") || 0);
  let id = storageGet(localStorage, "td_sid");
  const isNew = !id || now - last > SESSION_TIMEOUT;
  if (isNew) id = uid();
  storageSet(localStorage, "td_sid", id!);
  storageSet(localStorage, "td_sid_at", String(now));
  return { id: id!, isNew };
}

function describe(target: EventTarget | null) {
  const node = target as HTMLElement | null;
  const el = node?.closest?.("a,button,[role=button],input,select,textarea,label,summary,img") as HTMLElement | null;
  if (!el) {
    // Click on plain content: keep the element tag, and its text only when it is a leaf (no huge section dumps).
    const leafText = node && node.childElementCount === 0 ? (node.textContent || "").trim().replace(/s+/g, " ").slice(0, 80) : "";
    return { tag: node?.tagName?.toLowerCase() ?? "", text: leafText, href: "", elId: node?.id ?? "" };
  }
  const isField = /^(input|select|textarea)$/i.test(el.tagName);
  const raw = isField
    ? el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.getAttribute("name") || ""
    : el.getAttribute("aria-label") || el.getAttribute("alt") || el.textContent || "";
  return {
    tag: el.tagName.toLowerCase(),
    text: raw.trim().replace(/\s+/g, " ").slice(0, 80),
    href: el.getAttribute("href") || "",
    elId: el.id || "",
  };
}

function ctaKind(href: string) {
  if (href.startsWith("tel:")) return "call";
  if (href.includes("zalo.me")) return "zalo";
  if (href.startsWith("mailto:")) return "email";
  if (/dat-lich|booking/.test(href)) return "booking";
  if (/lien-he|contact/.test(href)) return "contact";
  return "";
}

export class TrackerEngine {
  private vid = visitorId();
  private sid = "";
  private seq = 0;
  private pvId = "";
  private path = "";
  private layout: LayoutBucket = "desktop";
  private pageStart = 0;
  private activeMs = 0;
  private lastActivity = Date.now();
  private maxScroll = 0;
  private depthMarks = new Set<number>();
  private pageClicks = 0;
  private pageMoves = 0;
  private formsStarted = new Set<string>();
  private prevPath = "";
  private ended = false;

  private events: TrackedEvent[] = [];
  private sensors = new Map<string, Sensor>();
  private rows = new Map<number, number>();
  private env: Record<string, Primitive> | null = null;

  private curCell = "";
  private lastSampleAt = 0;
  private pointer = { x: -1, y: -1 }; // client coords
  private raf = 0;
  private recentClicks: { cell: string; at: number }[] = [];
  private timers: number[] = [];
  private off: (() => void)[] = [];

  start(path: string) {
    const on = <K extends keyof WindowEventMap>(type: K, fn: (e: WindowEventMap[K]) => void, opts?: AddEventListenerOptions) => {
      window.addEventListener(type, fn as EventListener, opts);
      this.off.push(() => window.removeEventListener(type, fn as EventListener, opts));
    };
    on("pointermove", (e) => this.onMove(e), { passive: true });
    on("scroll", () => this.onScroll(), { passive: true });
    on("click", (e) => this.onClick(e), { capture: true });
    on("keydown", () => this.touch(), { passive: true });
    on("focusin", (e) => this.onFocus(e));
    on("copy", () => this.onCopy());
    on("error", (e) => this.push({ type: "js_error", message: String(e.message).slice(0, 200), source: `${e.filename}:${e.lineno}` }));
    on("pagehide", () => this.endPage(true));
    on("pageshow", (e) => {
      if (e.persisted) this.startPage(this.path); // restored from back/forward cache
    });
    on(TRACK_EVENT as keyof WindowEventMap, ((e: CustomEvent) => this.push({ type: e.detail.type, ...e.detail.props })) as never);
    const onVis = () => {
      this.push({ type: "visibility", state: document.visibilityState });
      if (document.visibilityState === "hidden") this.flush(true);
    };
    document.addEventListener("visibilitychange", onVis);
    this.off.push(() => document.removeEventListener("visibilitychange", onVis));

    this.timers.push(window.setInterval(() => this.tick(), 1000));
    this.timers.push(window.setInterval(() => this.flush(false), FLUSH_MS));
    this.startPage(path);
  }

  destroy() {
    this.endPage(true);
    this.off.forEach((f) => f());
    this.timers.forEach((t) => clearInterval(t));
    cancelAnimationFrame(this.raf);
  }

  /** Called on first load and on every client-side navigation. */
  startPage(path: string) {
    if (this.pvId && !this.ended && path === this.path) return; // same page re-announced
    if (this.pvId && !this.ended) this.endPage(false);
    this.ended = false;
    const s = sessionId();
    this.sid = s.id;
    this.pvId = uid();
    this.path = path;
    this.pageStart = Date.now();
    this.activeMs = 0;
    this.maxScroll = 0;
    this.depthMarks.clear();
    this.pageClicks = 0;
    this.pageMoves = 0;
    this.formsStarted.clear();
    this.curCell = "";
    this.layout = layoutBucket(window.innerWidth);

    const q = new URLSearchParams(location.search);
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const conn = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
    this.env = {
      vw: window.innerWidth,
      vh: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      sw: screen.width,
      sh: screen.height,
      docW: document.documentElement.scrollWidth,
      docH: document.documentElement.scrollHeight,
      lang: navigator.language,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touch: navigator.maxTouchPoints > 0,
      conn: conn?.effectiveType ?? "",
    };
    this.push({
      type: "page_view",
      title: document.title.slice(0, 120),
      url: location.href.slice(0, 300),
      referrer: (this.prevPath ? location.origin + this.prevPath : document.referrer).slice(0, 300),
      newSession: s.isNew,
      utm_source: q.get("utm_source") ?? "",
      utm_medium: q.get("utm_medium") ?? "",
      utm_campaign: q.get("utm_campaign") ?? "",
      utm_term: q.get("utm_term") ?? "",
      utm_content: q.get("utm_content") ?? "",
      gclid: q.get("gclid") ?? "",
      fbclid: q.get("fbclid") ?? "",
      loadMs: !this.prevPath && nav ? Math.round(nav.loadEventEnd || nav.domContentLoadedEventEnd) : 0,
    });
    this.prevPath = path;
    // Short delay so a client-side navigation has updated document.title.
    window.setTimeout(() => this.flush(false), 600);
  }

  private endPage(beacon: boolean) {
    if (!this.pvId || this.ended) return;
    this.ended = true;
    this.settleHover(performance.now());
    this.push({
      type: "page_end",
      totalMs: Date.now() - this.pageStart,
      activeMs: this.activeMs,
      maxScrollPct: Math.round(this.maxScroll * 100),
      clicks: this.pageClicks,
      moves: this.pageMoves,
    });
    this.flush(beacon);
  }

  private push(e: Omit<TrackedEvent, "ts"> & { type: string }) {
    this.events.push({ ...e, ts: Date.now() } as TrackedEvent);
  }

  private touch() {
    this.lastActivity = Date.now();
    storageSet(localStorage, "td_sid_at", String(this.lastActivity));
  }

  private sensor(key: string) {
    let s = this.sensors.get(key);
    if (!s) this.sensors.set(key, (s = { hover: 0, moves: 0, clicks: 0 }));
    return s;
  }

  private cellKey(clientX: number, clientY: number) {
    const { row, col } = cellOf(clientX + window.scrollX, clientY + window.scrollY);
    return { key: `${row},${col}`, row, col };
  }

  /** Credit the time since the last sample to the cell the pointer was in. */
  private settleHover(now: number) {
    if (this.curCell && this.lastSampleAt) {
      this.sensor(this.curCell).hover += Math.min(now - this.lastSampleAt, HOVER_GAP_CAP);
    }
    this.lastSampleAt = now;
  }

  private onMove(e: PointerEvent) {
    this.pointer = { x: e.clientX, y: e.clientY };
    this.touch();
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = 0;
      this.sample();
    });
  }

  private sample() {
    if (this.pointer.x < 0) return;
    const now = performance.now();
    this.settleHover(now);
    const { key } = this.cellKey(this.pointer.x, this.pointer.y);
    this.curCell = key;
    this.sensor(key).moves++;
    this.pageMoves++;
  }

  private onScroll() {
    this.touch();
    const doc = document.documentElement;
    const depth = Math.min(1, (window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight));
    if (depth > this.maxScroll) this.maxScroll = depth;
    for (const mark of [25, 50, 75, 100]) {
      if (depth * 100 >= mark - 0.5 && !this.depthMarks.has(mark)) {
        this.depthMarks.add(mark);
        this.push({ type: "scroll_depth", value: mark });
      }
    }
    // The page moved under a resting pointer → it is now over a different centimetre.
    if (this.pointer.x >= 0 && !this.raf) {
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.sample();
      });
    }
  }

  private onClick(e: MouseEvent) {
    this.touch();
    const { key, row, col } = this.cellKey(e.clientX, e.clientY);
    this.sensor(key).clicks++;
    this.pageClicks++;
    const d = describe(e.target);
    const x = Math.round(e.clientX + window.scrollX);
    const y = Math.round(e.clientY + window.scrollY);
    this.push({ type: "click", x, y, row, col, ...d });

    const kind = ctaKind(d.href);
    if (kind) this.push({ type: "cta_click", kind, text: d.text, href: d.href });
    if (/^https?:\/\//.test(d.href) && !d.href.includes(location.hostname)) {
      this.push({ type: "outbound_click", href: d.href.slice(0, 300) });
    }

    const now = Date.now();
    this.recentClicks = this.recentClicks.filter((c) => now - c.at < RAGE_WINDOW && c.cell === key);
    this.recentClicks.push({ cell: key, at: now });
    if (this.recentClicks.length === 3) this.push({ type: "rage_click", row, col, text: d.text });
  }

  private onFocus(e: FocusEvent) {
    const field = e.target as HTMLElement;
    const form = field.closest?.("form");
    if (!form || !/^(INPUT|SELECT|TEXTAREA)$/.test(field.tagName)) return;
    const formKey =
      form.getAttribute("name") || form.id || form.closest("section[id]")?.id || location.pathname.split("/").pop() || "form";
    if (this.formsStarted.has(formKey)) return;
    this.formsStarted.add(formKey);
    this.push({ type: "form_start", form: formKey, field: field.getAttribute("name") || "" });
  }

  private onCopy() {
    const text = String(window.getSelection() ?? "").trim();
    this.push({ type: "copy", text: text.slice(0, 60), length: text.length });
  }

  private tick() {
    if (document.visibilityState !== "visible") return;
    if (Date.now() - this.lastActivity > IDLE_MS) return;
    this.activeMs += 1000;
    const top = Math.floor(window.scrollY / CM_PX);
    const bottom = Math.floor((window.scrollY + window.innerHeight) / CM_PX);
    for (let r = top; r <= bottom; r++) this.rows.set(r, (this.rows.get(r) ?? 0) + 1000);
  }

  private flush(beacon: boolean) {
    if (!this.events.length && !this.sensors.size && !this.rows.size) return;
    for (const e of this.events) if (e.type === "page_view" && !e.title) e.title = document.title.slice(0, 120);
    const payload = {
      v: 1,
      vid: this.vid,
      sid: this.sid,
      pvId: this.pvId,
      seq: this.seq++,
      path: this.path,
      layout: this.layout,
      env: this.env,
      events: this.events.splice(0, 200),
      sensors: [...this.sensors.entries()].map(([k, s]) => {
        const [row, col] = k.split(",").map(Number);
        return [row, col, Math.round(s.hover), s.moves, s.clicks];
      }),
      rows: [...this.rows.entries()],
    };
    this.env = null;
    this.sensors.clear();
    this.rows.clear();
    const body = JSON.stringify(payload);
    if (beacon && navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
      return;
    }
    fetch(ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(
      () => {},
    );
  }
}
