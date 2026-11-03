"use client";

import { FormEvent, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Check, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/Container";
import { FormStatus } from "@/components/forms/FormStatus";
import { trackEvent } from "@/lib/tracking/grid";
import { fontStack } from "@/lib/fontStack";

/** Booking as picking a slot: format → day → time → name + Zalo. A three.js
 *  appointment ticket fills in live beside the form and, on submit, flips and
 *  gets stamped. The choice is sent as `preferredTime` to the unchanged
 *  /api/booking endpoint. Copy lives in messages → booking.studio. */

const SLOTS = ["09:00", "10:30", "14:00", "15:30", "19:30"];
const EVENING = "19:30";
const DAYS_AHEAD = 6; // working days shown (Sundays skipped)
const ZALO_URL = "https://zalo.me/0769918685";
const PHONE = "0769918685";

type TicketData = { format: string; stub: string; date: string; time: string; guest: string };
type Copy = {
  brand: string; title: string; format: string; date: string; time: string; guest: string;
  footer: string; stubBottom: string; stamp: string; backLine: string;
};

// Today's date as a stable string; "" during SSR/prerender so the day list is
// only built in the browser (the page is statically generated at build time).
const subscribe = () => () => {};
const todayKey = () => new Date().toDateString();

function drawTicket(ctx: CanvasRenderingContext2D, d: TicketData, c: Copy, font: string, stamped: boolean) {
  const W = 1024, H = 560, CUT = 760;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#18233d");
  bg.addColorStop(1, "#0b1220");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  // Soft gold glow top-left.
  const glow = ctx.createRadialGradient(140, 60, 0, 140, 60, 420);
  glow.addColorStop(0, "rgba(240,192,105,0.18)");
  glow.addColorStop(1, "rgba(240,192,105,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Perforation.
  ctx.strokeStyle = "rgba(240,192,105,0.45)";
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.beginPath();
  ctx.moveTo(CUT, 40);
  ctx.lineTo(CUT, H - 40);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#f0c069";
  ctx.font = `700 24px ${font}`;
  ctx.fillText(c.brand, 52, 72);
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 44px ${font}`;
  ctx.fillText(c.title, 52, 128);

  const field = (label: string, value: string, x: number, y: number, maxW: number) => {
    ctx.fillStyle = "rgba(240,192,105,0.75)";
    ctx.font = `600 19px ${font}`;
    ctx.fillText(label, x, y);
    ctx.fillStyle = value === "—" ? "rgba(255,255,255,0.3)" : "#ffffff";
    ctx.font = `700 36px ${font}`;
    let v = value;
    while (ctx.measureText(v).width > maxW && v.length > 2) v = v.slice(0, -2) + "…";
    ctx.fillText(v, x, y + 46);
  };
  field(c.format, d.format, 52, 210, 330);
  field(c.date, d.date, 420, 210, 310);
  field(c.time, d.time, 52, 340, 330);
  field(c.guest, d.guest, 420, 340, 310);

  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = `500 21px ${font}`;
  ctx.fillText(c.footer, 52, 488);

  // Stub.
  ctx.textAlign = "center";
  ctx.fillStyle = "#f0c069";
  ctx.font = `800 88px ${font}`;
  ctx.fillText(d.stub, (CUT + W) / 2, 250);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `700 22px ${font}`;
  ctx.fillText(c.stubBottom, (CUT + W) / 2, 292);
  // Barcode (deterministic).
  let x = CUT + 42;
  let seed = 7;
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  while (x < W - 42) {
    seed = (seed * 16807) % 2147483647;
    const bw = 2 + (seed % 5);
    ctx.fillRect(x, 380, bw, 92);
    x += bw + 3 + (seed % 4);
  }
  ctx.textAlign = "left";

  if (stamped) {
    ctx.save();
    ctx.translate(590, 300);
    ctx.rotate(-0.26);
    ctx.strokeStyle = "rgba(74,222,128,0.92)";
    ctx.fillStyle = "rgba(74,222,128,0.92)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.roundRect(-150, -58, 300, 116, 18);
    ctx.stroke();
    ctx.font = `900 54px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(c.stamp, 0, 4);
    ctx.restore();
  }
}

function drawBack(ctx: CanvasRenderingContext2D, c: Copy, font: string) {
  const W = 1024, H = 560;
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b1220");
  bg.addColorStop(1, "#1b2747");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.fillStyle = "#f0c069";
  ctx.font = `900 64px ${font}`;
  ctx.fillText(c.brand, W / 2, H / 2);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = `500 28px ${font}`;
  ctx.fillText(c.backLine, W / 2, H / 2 + 56);
}

export function BookingStudio() {
  const t = useTranslations("booking.studio");
  const locale = useLocale();
  const formats = t.raw("formats") as { label: string; detail: string; stub: string }[];
  const copy = t.raw("ticket") as Copy;
  const trust = t.raw("trust") as string[];

  const [format, setFormat] = useState(0);
  const [day, setDay] = useState<number | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [guest, setGuest] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const today = useSyncExternalStore(subscribe, todayKey, () => "");
  const days = useMemo(() => {
    if (!today) return [];
    const out: Date[] = [];
    const d = new Date(today);
    while (out.length < DAYS_AHEAD) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }, [today]);
  const weekday = useMemo(() => new Intl.DateTimeFormat(locale, { weekday: "short" }), [locale]);
  const dm = (d: Date) => `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  const dateLabel = day !== null && days[day] ? `${weekday.format(days[day])} · ${dm(days[day])}` : "";
  const ticket: TicketData = {
    format: formats[format].label,
    stub: formats[format].stub,
    date: dateLabel || "—",
    time: slot ?? "—",
    guest: guest.trim() || "—",
  };

  // three.js hooks, set once the scene exists.
  const redrawRef = useRef<((d: TicketData, stamped: boolean) => void) | null>(null);
  const flipRef = useRef<(() => void) | null>(null);
  const ticketRef = useRef(ticket);
  const stampedRef = useRef(false);
  useEffect(() => {
    ticketRef.current = ticket;
    redrawRef.current?.(ticket, stampedRef.current);
  });

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = canvasHost.current;
    const section = sectionRef.current;
    if (!host || !section) return;
    let disposed = false;
    let cleanup = () => {};

    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const THREE = await import("three");
        await document.fonts?.ready;
        if (disposed) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const font = fontStack("display");

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
        camera.position.set(0, 0, 4.7);

        // Ticket outline: rounded rectangle with perforation notches.
        const w = 3.6, h = (w * 560) / 1024, r = 0.13, n = 0.11, nx = -w / 2 + (w * 760) / 1024;
        const shape = new THREE.Shape();
        shape.moveTo(-w / 2 + r, h / 2);
        shape.lineTo(nx - n, h / 2);
        shape.absarc(nx, h / 2, n, Math.PI, 0, false);
        shape.lineTo(w / 2 - r, h / 2);
        shape.absarc(w / 2 - r, h / 2 - r, r, Math.PI / 2, 0, true);
        shape.lineTo(w / 2, -h / 2 + r);
        shape.absarc(w / 2 - r, -h / 2 + r, r, 0, -Math.PI / 2, true);
        shape.lineTo(nx + n, -h / 2);
        shape.absarc(nx, -h / 2, n, 0, Math.PI, false);
        shape.lineTo(-w / 2 + r, -h / 2);
        shape.absarc(-w / 2 + r, -h / 2 + r, r, -Math.PI / 2, -Math.PI, true);
        shape.lineTo(-w / 2, h / 2 - r);
        shape.absarc(-w / 2 + r, h / 2 - r, r, Math.PI, Math.PI / 2, true);

        const geo = new THREE.ShapeGeometry(shape, 24);
        const p = geo.attributes.position;
        const uv = geo.attributes.uv;
        for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + w / 2) / w, (p.getY(i) + h / 2) / h);

        const makeTex = () => {
          const c = document.createElement("canvas");
          c.width = 1024;
          c.height = 560;
          const tex = new THREE.CanvasTexture(c);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          return { c, ctx: c.getContext("2d")!, tex };
        };
        const front = makeTex();
        const back = makeTex();
        drawBack(back.ctx, copy, font);
        back.tex.needsUpdate = true;

        const card = new THREE.Group();
        const frontMat = new THREE.MeshStandardMaterial({ map: front.tex, roughness: 0.45, metalness: 0.15 });
        const backMat = new THREE.MeshStandardMaterial({ map: back.tex, roughness: 0.45, metalness: 0.15 });
        const frontMesh = new THREE.Mesh(geo, frontMat);
        const backMesh = new THREE.Mesh(geo, backMat);
        backMesh.rotation.y = Math.PI;
        backMesh.position.z = -0.012;
        const edge = new THREE.LineLoop(
          new THREE.BufferGeometry().setFromPoints(shape.getPoints(48)),
          new THREE.LineBasicMaterial({ color: 0xf0c069, transparent: true, opacity: 0.85 }),
        );
        edge.position.z = 0.002;
        card.add(frontMesh, backMesh, edge);
        card.rotation.set(-0.12, -0.28, 0.04);
        scene.add(card);

        scene.add(new THREE.AmbientLight(0xffffff, 1.6));
        const key = new THREE.DirectionalLight(0xffffff, 1.1);
        key.position.set(-3, 4, 6);
        scene.add(key);
        // A sheen that sweeps across the card.
        const sheen = new THREE.PointLight(0xffe2a8, 0, 6, 1.5);
        scene.add(sheen);

        // Motes; a burst throws them outward when the booking is sent.
        const N = 180;
        const mp = new Float32Array(N * 3);
        const mv = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          mp[i * 3] = (Math.random() - 0.5) * 6;
          mp[i * 3 + 1] = (Math.random() - 0.5) * 4;
          mp[i * 3 + 2] = (Math.random() - 0.5) * 2 - 0.5;
        }
        const moteGeo = new THREE.BufferGeometry();
        moteGeo.setAttribute("position", new THREE.BufferAttribute(mp, 3));
        const moteMat = new THREE.PointsMaterial({
          color: 0xf7c46c,
          size: 0.045,
          transparent: true,
          opacity: 0.7,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        scene.add(new THREE.Points(moteGeo, moteMat));

        redrawRef.current = (d, stamped) => {
          drawTicket(front.ctx, d, copy, font, stamped);
          front.tex.needsUpdate = true;
        };
        redrawRef.current(ticketRef.current, stampedRef.current);

        let flipStart = -1;
        flipRef.current = () => {
          flipStart = performance.now();
          for (let i = 0; i < N; i++) {
            const a = Math.random() * Math.PI * 2;
            const s = 0.04 + Math.random() * 0.08;
            mp[i * 3] = (Math.random() - 0.5) * 0.6;
            mp[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
            mv[i * 3] = Math.cos(a) * s;
            mv[i * 3 + 1] = Math.sin(a) * s;
            mv[i * 3 + 2] = (Math.random() - 0.3) * 0.04;
          }
        };

        // Tilt toward the pointer.
        const tilt = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          const b = host.getBoundingClientRect();
          tilt.y = ((e.clientX - b.left) / b.width - 0.5) * 0.7;
          tilt.x = ((e.clientY - b.top) / b.height - 0.5) * 0.5;
        };
        const onLeave = () => {
          tilt.x = 0;
          tilt.y = 0;
        };
        if (!reduce) {
          host.addEventListener("pointermove", onMove);
          host.addEventListener("pointerleave", onLeave);
        }

        const resize = () => {
          const cw = host.clientWidth, ch = host.clientHeight;
          renderer.setSize(cw, ch, false);
          camera.aspect = cw / Math.max(ch, 1);
          // Keep the whole ticket in frame on narrow screens.
          // ~4.7 frames the 3.6-wide ticket at ~80% of a 16:10 box.
          camera.position.z = 4.7 * Math.max(1, 1.6 / camera.aspect);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = now / 1000;
          let spin = 0;
          if (flipStart >= 0) {
            const k = reduce ? 1 : Math.min(1, (now - flipStart) / 1300);
            spin = (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2) * Math.PI * 2;
            if (k >= 1) flipStart = -1;
          }
          const baseY = reduce ? -0.2 : -0.28 + Math.sin(time * 0.6) * 0.12;
          const baseX = reduce ? -0.08 : -0.12 + Math.sin(time * 0.8) * 0.04;
          card.rotation.y += (baseY + tilt.y - card.rotation.y) * 0.08;
          card.rotation.x += (baseX + tilt.x - card.rotation.x) * 0.08;
          card.position.y = reduce ? 0 : Math.sin(time * 1.1) * 0.06;
          // Spin is applied on top of the eased tilt.
          card.rotateY(spin);

          sheen.position.set(Math.sin(time * 0.7) * 3, 1.2, 2.2);
          sheen.intensity = reduce ? 0 : 3.2;

          for (let i = 0; i < N; i++) {
            const j = i * 3;
            mp[j] += mv[j];
            mp[j + 1] += mv[j + 1] + (reduce ? 0 : 0.0025);
            mp[j + 2] += mv[j + 2];
            mv[j] *= 0.965;
            mv[j + 1] *= 0.965;
            mv[j + 2] *= 0.965;
            if (mp[j + 1] > 2.4) mp[j + 1] = -2.4;
          }
          moteGeo.attributes.position.needsUpdate = true;
          renderer.render(scene, camera);
          if (spin) card.rotateY(-spin);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.removeEventListener("pointermove", onMove);
          host.removeEventListener("pointerleave", onLeave);
          redrawRef.current = null;
          flipRef.current = null;
          [geo, moteGeo, edge.geometry].forEach((g) => g.dispose());
          [frontMat, backMat, moteMat, edge.material as InstanceType<typeof THREE.Material>].forEach((m) => m.dispose());
          front.tex.dispose();
          back.tex.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      },
      { rootMargin: "300px 0px" },
    );
    io.observe(section);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
    // Copy is static per locale; the scene is built once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const when = [formats[format].label, dateLabel, slot].filter(Boolean).join(" · ");
    setStatus("sending");
    try {
      const r = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          company: String(form.get("company") ?? ""),
          message: String(form.get("message") ?? ""),
          preferredTime: day !== null && slot ? when : `${when} — ${t("flexible")}`,
        }),
      });
      trackEvent("form_submit", { form: "booking", ok: r.ok, format: format + 1, slot: slot ?? "", picked: day !== null });
      if (!r.ok) throw new Error("request_failed");
      stampedRef.current = true;
      redrawRef.current?.(ticketRef.current, true);
      flipRef.current?.();
      setStatus("ok");
    } catch {
      setStatus("err");
    }
  }

  const chip = (on: boolean) =>
    `rounded-2xl border px-4 py-3 text-left transition-all ${
      on
        ? "border-gold-400 bg-gold-400 text-ink shadow-lg shadow-gold-500/20"
        : "border-white/15 bg-white/[0.03] text-white/85 hover:border-white/40"
    }`;

  return (
    <section ref={sectionRef} id="dat-lich" className="relative overflow-hidden bg-ink pb-20 pt-28 text-white sm:pb-24 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_45%_at_78%_35%,rgba(240,192,105,0.13),transparent_70%)]"
      />
      <Container className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{t("eyebrow")}</p>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-[44px]">{t("heading")}</h1>
          <p className="max-w-xl text-white/70 sm:text-lg">{t("sub")}</p>
        </div>

        {/* Ticket — beside the form on desktop, right under the heading on mobile. */}
        <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <div className="flex flex-col gap-5 lg:sticky lg:top-24">
            <div
              ref={canvasHost}
              aria-hidden
              className="relative aspect-[16/10] w-full touch-pan-y [&>canvas]:h-full [&>canvas]:w-full"
            />
            <ul className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm text-white/70">
              {trust.map((item) => (
                <li key={item} className="inline-flex items-center gap-1.5">
                  <Check size={15} className="text-gold-400" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:col-start-1">
          {status === "ok" ? (
            <div className="flex flex-col gap-4">
              <FormStatus type="success" title={t("okTitle")} body={t("okBody")} />
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center gap-2 rounded-full bg-gold-400 px-5 py-3 text-sm font-bold text-ink hover:bg-gold-500"
              >
                <MessageCircle size={16} aria-hidden /> {t("zaloAfter")}
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-7">
              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 font-display text-lg font-semibold">{t("step1")}</legend>
                <div className="grid grid-cols-3 gap-2.5">
                  {formats.map((f, i) => (
                    <button key={f.label} type="button" aria-pressed={format === i} onClick={() => setFormat(i)} className={chip(format === i)}>
                      <span className="block text-sm font-bold sm:text-base">{f.label}</span>
                      <span className={`block text-xs ${format === i ? "text-ink/70" : "text-white/50"}`}>{f.detail}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 font-display text-lg font-semibold">{t("step2")}</legend>
                <div className="grid min-h-[68px] grid-cols-3 gap-2.5 sm:grid-cols-6">
                  {days.map((d, i) => (
                    <button
                      key={d.toDateString()}
                      type="button"
                      aria-pressed={day === i}
                      onClick={() => {
                        setDay(i);
                        trackEvent("booking_pick", { what: "day", n: i + 1 });
                      }}
                      className={`${chip(day === i)} !px-2 text-center`}
                    >
                      <span className="block text-xs font-semibold uppercase opacity-70">{weekday.format(d)}</span>
                      <span className="block font-display text-lg font-bold">{dm(d)}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 font-display text-lg font-semibold">{t("step3")}</legend>
                <div className="flex flex-wrap gap-2.5">
                  {SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      aria-pressed={slot === s}
                      onClick={() => {
                        setSlot(s);
                        trackEvent("booking_pick", { what: "slot", slot: s });
                      }}
                      className={`${chip(slot === s)} !py-2.5 font-display font-bold`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-white/55">{t("eveningHint", { time: EVENING })}</p>
              </fieldset>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-3 font-display text-lg font-semibold">{t("step4")}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    name="name"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder={t("namePh")}
                    aria-label={t("namePh")}
                    value={guest}
                    onChange={(e) => setGuest(e.target.value)}
                    className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
                  />
                  <input
                    name="phone"
                    required
                    type="tel"
                    inputMode="tel"
                    pattern="[0-9+\s.\-()]{8,30}"
                    autoComplete="tel"
                    placeholder={t("phonePh")}
                    aria-label={t("phonePh")}
                    className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
                  />
                </div>
                <details className="group rounded-xl border border-white/10 px-4 py-3 text-sm text-white/70">
                  <summary className="cursor-pointer font-semibold text-white/80">{t("more")}</summary>
                  <div className="mt-3 flex flex-col gap-3">
                    <input
                      name="company"
                      maxLength={200}
                      autoComplete="organization"
                      placeholder={t("companyPh")}
                      aria-label={t("companyPh")}
                      className="min-h-11 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
                    />
                    <textarea
                      name="message"
                      rows={3}
                      maxLength={2000}
                      placeholder={t("messagePh")}
                      aria-label={t("messagePh")}
                      className="rounded-xl bg-white px-4 py-3 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                </details>
              </fieldset>

              {status === "err" ? <FormStatus type="error" title={t("errTitle")} body={t("errBody")} /> : null}

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="min-h-13 rounded-full bg-gold-500 px-6 py-3.5 text-base font-bold text-ink transition-colors hover:bg-gold-400 disabled:opacity-60"
                >
                  {status === "sending" ? t("sending") : t("submit")}
                </button>
                <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-white/55">
                  <span>{t("confirmNote")}</span>
                  <span className="flex gap-4">
                    <a href={`tel:${PHONE}`} className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-white">
                      <Phone size={15} aria-hidden /> {t("call")}
                    </a>
                    <a
                      href={ZALO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent("booking_cta", { channel: "zalo" })}
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-white"
                    >
                      <MessageCircle size={15} aria-hidden /> Zalo
                    </a>
                  </span>
                </div>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
