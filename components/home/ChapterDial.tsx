"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Clock, MessageCircle, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/** Homepage chapter dial. The homepage is ~23,000px on a phone (≈28 screens):
 *  this floating three.js orb shows where the visitor is (a bead per chapter,
 *  a gold arc for what they have read, the ring turns as they scroll) and opens
 *  a sheet to jump straight to any chapter, with minutes left and one Zalo CTA.
 *  Chapter anchors live on the homepage (app/[locale]/page.tsx); copy:
 *  messages → chapters.items, same order as CHAPTERS. */

const CHAPTERS = [
  { id: "top", min: 1 },
  { id: "den-tan-tiem", min: 1 },
  { id: "tinh-gio", min: 1 },
  { id: "loi-hua", min: 2 },
  { id: "bang-chung", min: 1 },
  { id: "hoa-don-vat", min: 2 },
  { id: "nguoi-dong-hanh", min: 2 },
  { id: "quy-trinh", min: 2 },
] as const;
const N = CHAPTERS.length;
const TOTAL_MIN = CHAPTERS.reduce((s, c) => s + c.min, 0);
const DIAL = 64; // css px

type Item = { t: string; d: string };

function chapterTop(id: string) {
  if (id === "top") return 0;
  const el = document.getElementById(id);
  return el ? el.getBoundingClientRect().top + window.scrollY : Infinity;
}

export function ChapterDial() {
  const t = useTranslations("chapters");
  const items = t.raw("items") as Item[];

  const [shown, setShown] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [seen, setSeen] = useState(1); // highest chapter index reached + 1
  const state = useRef({ active: 0, progress: 0, seen: 1 });
  const canvasHost = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Scroll → active chapter, page progress, visibility.
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const y = window.scrollY;
      const vh = window.innerHeight;
      const probe = y + vh * 0.4;
      let a = 0;
      CHAPTERS.forEach((c, i) => {
        if (chapterTop(c.id) <= probe) a = i;
      });
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      state.current.active = a;
      state.current.progress = Math.min(1, y / max);
      state.current.seen = Math.max(state.current.seen, a + 1);
      setActive(a);
      setSeen(state.current.seen);
      setShown(y > vh * 0.6);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // The orb: beads on a tilted ring, gold progress arc, glowing core.
  useEffect(() => {
    const host = canvasHost.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};
    (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(DIAL, DIAL, false);
      host.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camera.position.set(0, 0, 4.4);
      const ring = new THREE.Group();
      ring.rotation.x = 1.05;
      scene.add(ring);

      const R = 1.05;
      const angleOf = (i: number) => (i / N) * Math.PI * 2;
      const circle = (from: number, to: number, steps: number) => {
        const pts: InstanceType<typeof THREE.Vector3>[] = [];
        for (let k = 0; k <= steps; k++) {
          const a = from + ((to - from) * k) / steps;
          pts.push(new THREE.Vector3(Math.sin(a) * R, 0, Math.cos(a) * R));
        }
        return pts;
      };
      const trackGeo = new THREE.BufferGeometry().setFromPoints(circle(0, Math.PI * 2, 96));
      const trackMat = new THREE.LineBasicMaterial({ color: 0x8aa6dc, transparent: true, opacity: 0.35 });
      ring.add(new THREE.Line(trackGeo, trackMat));

      const ARC_STEPS = 96;
      const arcGeo = new THREE.BufferGeometry().setFromPoints(circle(0, Math.PI * 2, ARC_STEPS));
      const arcMat = new THREE.LineBasicMaterial({ color: 0x45d17f, transparent: true, opacity: 0.95 });
      ring.add(new THREE.Line(arcGeo, arcMat));

      // Glow sprites: N beads + core.
      const pos = new Float32Array((N + 1) * 3);
      const col = new Float32Array((N + 1) * 3);
      const size = new Float32Array(N + 1);
      for (let i = 0; i < N; i++) {
        const a = angleOf(i);
        pos.set([Math.sin(a) * R, 0, Math.cos(a) * R], i * 3);
      }
      const glowGeo = new THREE.BufferGeometry();
      glowGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      glowGeo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
      glowGeo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
      const glowMat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uScale: { value: renderer.getPixelRatio() } },
        vertexShader: /* glsl */ `
          attribute vec3 aColor; attribute float aSize; uniform float uScale; varying vec3 vC;
          void main() {
            vC = aColor;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = aSize * uScale * (4.4 / -mv.z);
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: /* glsl */ `
          varying vec3 vC;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float g = smoothstep(0.5, 0.0, d);
            gl_FragColor = vec4(vC, pow(g, 1.5));
          }`,
      });
      ring.add(new THREE.Points(glowGeo, glowMat));

      const gold = [0.27, 0.82, 0.5]; // chapters already read = green
      const dim = [0.43, 0.65, 0.97];
      let spin = 0;
      let arc = 0;
      let raf = 0;
      const t0 = performance.now();
      const frame = (now: number) => {
        raf = requestAnimationFrame(frame);
        if (document.hidden) return;
        const time = (now - t0) / 1000;
        const { active: act, progress, seen: sn } = state.current;
        // Turn the ring so the active bead faces the viewer.
        const target = -angleOf(act);
        let diff = target - spin;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        spin += reduce ? diff : diff * 0.08;
        ring.rotation.y = spin + (reduce ? 0 : Math.sin(time * 0.6) * 0.06);

        arc += (progress - arc) * (reduce ? 1 : 0.12);
        arcGeo.setDrawRange(0, Math.max(0, Math.round(arc * ARC_STEPS) + 1));

        for (let i = 0; i < N; i++) {
          const on = i === act;
          const c = i < sn ? gold : dim;
          col.set(c, i * 3);
          size[i] = on ? 30 + (reduce ? 0 : Math.sin(time * 3) * 4) : i < sn ? 16 : 12;
        }
        pos.set([0, 0, 0], N * 3);
        col.set([0.43, 0.65, 0.97], N * 3);
        size[N] = 34 + (reduce ? 0 : Math.sin(time * 1.8) * 5);
        glowGeo.attributes.aColor.needsUpdate = true;
        glowGeo.attributes.aSize.needsUpdate = true;
        renderer.render(scene, camera);
      };
      raf = requestAnimationFrame(frame);
      cleanup = () => {
        cancelAnimationFrame(raf);
        [trackGeo, arcGeo, glowGeo].forEach((g) => g.dispose());
        [trackMat, arcMat, glowMat].forEach((m) => m.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();
    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    sheetRef.current?.querySelector<HTMLElement>("[data-current]")?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const jump = (i: number) => {
    const id = CHAPTERS[i].id;
    const y = id === "top" ? 0 : chapterTop(id) - 64;
    setOpen(false);
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
    trackEvent("chapter_jump", { to: id, from: CHAPTERS[active].id });
  };

  const left = Math.max(1, CHAPTERS.slice(active).reduce((s, c) => s + c.min, 0));

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={t("open", { n: active + 1, total: N, title: items[active].t })}
        onClick={() => {
          setOpen(true);
          trackEvent("chapter_open", { at: CHAPTERS[active].id });
        }}
        className={`fixed right-3 z-40 flex items-center gap-2 rounded-full border border-brand-400/40 bg-ink/85 py-1 pl-1 pr-3.5 text-left text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-500 bottom-[calc(58px+env(safe-area-inset-bottom))] min-[900px]:bottom-6 min-[900px]:right-6 ${
          shown && !open ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <div ref={canvasHost} aria-hidden className="h-14 w-14 shrink-0 [&>canvas]:h-full [&>canvas]:w-full" />
        <span className="flex flex-col leading-tight">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-400">
            {t("label", { n: active + 1, total: N })}
          </span>
          <span className="max-w-[9.5rem] truncate text-[13px] font-semibold">{items[active].t}</span>
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[60] flex items-end justify-center min-[900px]:items-center" role="presentation">
          <button
            type="button"
            aria-label={t("close")}
            onClick={close}
            className="absolute inset-0 bg-ink/60 backdrop-blur-sm"
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="chapter-sheet-title"
            className="relative flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink text-white shadow-2xl min-[900px]:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 pb-4 pt-5">
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">{t("eyebrow")}</p>
                <h2 id="chapter-sheet-title" className="font-serif text-xl font-bold">
                  {t("heading")}
                </h2>
                <p className="flex items-center gap-1.5 text-xs text-white/60">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  {t("left", { min: left, total: TOTAL_MIN })}
                </p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t("close")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 hover:text-white"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </div>

            <ol className="flex flex-col overflow-y-auto px-3 py-3" role="list">
              {items.map((it, i) => {
                const current = i === active;
                const done = i < seen && !current;
                return (
                  <li key={CHAPTERS[i].id}>
                    <button
                      type="button"
                      data-current={current ? "" : undefined}
                      aria-current={current ? "step" : undefined}
                      onClick={() => jump(i)}
                      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors ${
                        current ? "bg-brand-500/[0.12] ring-1 ring-brand-400/50" : "hover:bg-white/[0.05]"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          current ? "bg-brand-400 text-ink" : done ? "bg-leaf-500/20 text-leaf-400" : "bg-white/10 text-white/60"
                        }`}
                      >
                        {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className={`text-sm font-semibold ${current ? "text-brand-400" : "text-white"}`}>{it.t}</span>
                        <span className="truncate text-xs text-white/55">{it.d}</span>
                      </span>
                      <span className="shrink-0 text-[11px] text-white/40">{t("min", { min: CHAPTERS[i].min })}</span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="flex flex-col gap-2 border-t border-white/10 px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-4">
              <p className="text-xs text-white/60">{t("ctaLead")}</p>
              <div className="flex gap-2">
                <a
                  href={COMPANY.zalo}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("chapter_cta", { channel: "zalo", at: CHAPTERS[active].id })}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-brand-400 px-4 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
                </a>
                <Link
                  href="/check"
                  onClick={() => trackEvent("chapter_cta", { channel: "check", at: CHAPTERS[active].id })}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-white/25 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/60"
                >
                  {t("ctaCheck")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
