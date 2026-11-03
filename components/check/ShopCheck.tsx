"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, MessageCircle, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { ATTRIBUTION_KEYS, AXIS_KEYS, CHECK_AXES, LEVELS, checkScore, weakestAxis, type CheckAxis } from "@/lib/shopCheck";
import { trackEvent } from "@/lib/tracking/grid";

/** Ads landing hero: "Kiểm tra cơ sở 60 giây". A three.js pentagon radar
 *  (5 axes of a service shop) morphs live as the visitor answers; the result
 *  names the weakest axis, the first fix and a matching real case, then a
 *  2-field form posts to /api/check with the ad attribution (utm_*, gclid,
 *  ?nganh=) and pushes `generate_lead` to dataLayer for Google Ads later. */

const R = 1.55; // radar radius at the top level
// First axis on top, so the bottom stays clear for the score.
const ANGLE = (k: number) => Math.PI / 2 - (k * Math.PI * 2) / AXIS_KEYS.length;
const STORE = "td-check-attribution";

type Values = Partial<Record<CheckAxis, number>>;

export function ShopCheck({ variant }: { variant?: string }) {
  const t = useTranslations("check");
  const [values, setValues] = useState<Values>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sceneState = useRef({ values: new Array(AXIS_KEYS.length).fill(-1), weakest: -1 });

  const done = step >= AXIS_KEYS.length;
  const score = checkScore(values);
  const weakest = weakestAxis(values);
  const heading = t.has(`heading.${variant}`) ? t(`heading.${variant}`) : t("heading.default");

  // Ad attribution: first landing wins for the session.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fresh: Record<string, string> = {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = params.get(k);
      if (v) fresh[k] = v.slice(0, 200);
    }
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      if (!Object.keys(stored).length && Object.keys(fresh).length) sessionStorage.setItem(STORE, JSON.stringify(fresh));
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once from the URL on mount
    setAttribution(Object.keys(stored).length ? stored : fresh);
    trackEvent("check_view", { variant: variant ?? "default", source: fresh.utm_source ?? "" });
  }, [variant]);

  useEffect(() => {
    sceneState.current.values = AXIS_KEYS.map((k) => values[k] ?? -1);
    sceneState.current.weakest = done ? AXIS_KEYS.indexOf(weakest) : -1;
  }, [values, done, weakest]);

  const answer = (axis: CheckAxis, level: number) => {
    const next = { ...values, [axis]: level };
    setValues(next);
    setStep((s) => s + 1);
    trackEvent("check_answer", { axis, level });
    if (AXIS_KEYS.every((k) => next[k] !== undefined)) {
      trackEvent("check_complete", { score: checkScore(next), weakest: weakestAxis(next) });
    }
  };

  const restart = () => {
    setValues({});
    setStep(0);
    setStatus("idle");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          score,
          weakest: t(`axes.${weakest}.label`),
          answers: AXIS_KEYS.map((k) => `${t(`axes.${k}.label`)}: ${(t.raw(`axes.${k}.o`) as string[])[values[k] ?? 0]}`),
          attribution,
          page: window.location.pathname + window.location.search,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      trackEvent("check_lead", { score, weakest });
      // Google Ads / GTM conversion hook (no-op until a tag is installed).
      const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
      w.dataLayer?.push({ event: "generate_lead", form: "shop_check", score, weakest });
      w.gtag?.("event", "generate_lead", { form: "shop_check", value: 1 });
    } catch {
      setStatus("error");
    }
  };

  useEffect(() => {
    const section = sectionRef.current;
    const host = hostRef.current;
    if (!section || !host) return;
    let disposed = false;
    let cleanup = () => {};

    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const THREE = await import("three");
        if (disposed) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const K = AXIS_KEYS.length;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        camera.position.set(0, 0, 5.6);
        const radar = new THREE.Group();
        radar.rotation.x = -0.55;
        scene.add(radar);
        const ratio = renderer.getPixelRatio();

        const outline = (r: number, z: number, color: number, opacity: number) => {
          const pts: number[] = [];
          for (let k = 0; k < K; k++) pts.push(Math.cos(ANGLE(k)) * r, Math.sin(ANGLE(k)) * r, z);
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
          const line = new THREE.LineLoop(geo, mat);
          radar.add(line);
          return { geo, mat };
        };
        // Grid rings per level + gold target ring + spokes.
        const statics = [1, 2, 3].map((l) => outline((R * l) / (LEVELS - 1), 0, 0x7fa2ef, l === 3 ? 0 : 0.14));
        const target = outline(R, 0, 0xf0c069, 0.55);
        const spokePts: number[] = [];
        for (let k = 0; k < K; k++) spokePts.push(0, 0, 0, Math.cos(ANGLE(k)) * R, Math.sin(ANGLE(k)) * R, 0);
        const spokeGeo = new THREE.BufferGeometry();
        spokeGeo.setAttribute("position", new THREE.Float32BufferAttribute(spokePts, 3));
        const spokeMat = new THREE.LineBasicMaterial({ color: 0x7fa2ef, transparent: true, opacity: 0.18 });
        radar.add(new THREE.LineSegments(spokeGeo, spokeMat));

        // The live shape: a lifted plate (top + bottom outline, side edges, fill).
        const shapeTop = new Float32Array(K * 3), shapeBot = new Float32Array(K * 3);
        const mkLoop = (arr: Float32Array, color: number, opacity: number) => {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
          radar.add(new THREE.LineLoop(geo, mat));
          return { geo, mat };
        };
        const top = mkLoop(shapeTop, 0x8fb6f9, 0.95);
        const bot = mkLoop(shapeBot, 0x4285f4, 0.35);
        const sides = new Float32Array(K * 6);
        const sideGeo = new THREE.BufferGeometry();
        sideGeo.setAttribute("position", new THREE.BufferAttribute(sides, 3));
        const sideMat = new THREE.LineBasicMaterial({ color: 0x4285f4, transparent: true, opacity: 0.4 });
        radar.add(new THREE.LineSegments(sideGeo, sideMat));
        const fill = new Float32Array(K * 9);
        const fillGeo = new THREE.BufferGeometry();
        fillGeo.setAttribute("position", new THREE.BufferAttribute(fill, 3));
        const fillMat = new THREE.MeshBasicMaterial({ color: 0x4285f4, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
        radar.add(new THREE.Mesh(fillGeo, fillMat));

        // Glow points: vertices + signals running around the outline.
        const SIG = 60;
        const n = K + SIG;
        const gp = new Float32Array(n * 3), ga = new Float32Array(n), gs = new Float32Array(n), gc = new Float32Array(n * 3);
        const glowGeo = new THREE.BufferGeometry();
        glowGeo.setAttribute("position", new THREE.BufferAttribute(gp, 3));
        glowGeo.setAttribute("aAlpha", new THREE.BufferAttribute(ga, 1));
        glowGeo.setAttribute("aSize", new THREE.BufferAttribute(gs, 1));
        glowGeo.setAttribute("aColor", new THREE.BufferAttribute(gc, 3));
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uScale: { value: ratio } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aSize; attribute vec3 aColor;
            uniform float uScale; varying float vA; varying vec3 vC;
            void main() {
              vA = aAlpha; vC = aColor;
              gl_PointSize = aSize * uScale;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying vec3 vC;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float core = smoothstep(0.15, 0.0, d);
              float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
              gl_FragColor = vec4(vC * (0.75 + core), (halo * 0.8 + core) * vA);
            }`,
        });
        radar.add(new THREE.Points(glowGeo, glowMat));

        const eased = new Float32Array(K).fill(0.06);
        const lift = 0.28;

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.position.z = camera.aspect < 1 ? 5.6 / Math.max(camera.aspect, 0.7) : 5.6;
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        const pointer = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        host.addEventListener("pointermove", onMove);

        const v = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          const { values: vals, weakest: weak } = sceneState.current;

          if (!reduce) {
            radar.rotation.z = Math.sin(time * 0.25) * 0.12;
            radar.rotation.y += (pointer.x * 0.35 - radar.rotation.y) * 0.05;
            radar.rotation.x += (-0.55 + pointer.y * 0.2 - radar.rotation.x) * 0.05;
          }

          for (let k = 0; k < K; k++) {
            const answered = vals[k] >= 0;
            const goal = answered ? Math.max(0.1, vals[k] / (LEVELS - 1)) : 0.06 + (reduce ? 0 : (Math.sin(time * 2 + k) + 1) * 0.02);
            eased[k] += (goal - eased[k]) * (reduce ? 1 : 0.08);
            const x = Math.cos(ANGLE(k)) * R * eased[k], y = Math.sin(ANGLE(k)) * R * eased[k];
            shapeTop.set([x, y, lift], k * 3);
            shapeBot.set([x, y, 0], k * 3);
            sides.set([x, y, 0, x, y, lift], k * 6);
            const k2 = (k + 1) % K;
            const x2 = Math.cos(ANGLE(k2)) * R * eased[k2], y2 = Math.sin(ANGLE(k2)) * R * eased[k2];
            fill.set([0, 0, lift, x, y, lift, x2, y2, lift], k * 9);
            const isWeak = k === weak;
            gp.set([x, y, lift], k * 3);
            gc.set(isWeak ? [1, 0.42, 0.35] : answered ? [0.95, 0.8, 0.5] : [0.55, 0.68, 1], k * 3);
            gs[k] = (isWeak ? 34 : 20) + (reduce ? 0 : Math.sin(time * 3 + k) * 3) + (isWeak && !reduce ? Math.sin(time * 6) * 6 : 0);
            ga[k] = answered ? 1 : 0.5;

            const el = labelRefs.current[k];
            if (el) {
              v.set(Math.cos(ANGLE(k)) * R * 1.2, Math.sin(ANGLE(k)) * R * 1.2, 0);
              radar.localToWorld(v);
              v.project(camera);
              el.style.transform = `translate(${(v.x * 0.5 + 0.5) * host.clientWidth}px, ${(-v.y * 0.5 + 0.5) * host.clientHeight}px) translate(-50%, -50%)`;
              el.style.opacity = "1";
            }
          }
          // Signals travelling around the live outline.
          for (let i = 0; i < SIG; i++) {
            const u = ((i / SIG) + (reduce ? 0 : time * 0.06)) % 1;
            const seg = u * K, k = Math.floor(seg) % K, f = seg - Math.floor(seg), k2 = (k + 1) % K;
            gp.set([shapeTop[k * 3] + (shapeTop[k2 * 3] - shapeTop[k * 3]) * f, shapeTop[k * 3 + 1] + (shapeTop[k2 * 3 + 1] - shapeTop[k * 3 + 1]) * f, lift], (K + i) * 3);
            gc.set([0.75, 0.85, 1], (K + i) * 3);
            gs[K + i] = 7;
            ga[K + i] = 0.55;
          }
          fillMat.color.setHex(weak >= 0 ? 0xf0c069 : 0x4285f4);
          fillMat.opacity = weak >= 0 ? 0.16 : 0.22;
          [top.geo, bot.geo, sideGeo, fillGeo, glowGeo].forEach((g) => Object.values(g.attributes).forEach((a) => (a.needsUpdate = true)));
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.removeEventListener("pointermove", onMove);
          [...statics, target, top, bot].forEach(({ geo, mat }) => {
            geo.dispose();
            mat.dispose();
          });
          [spokeGeo, sideGeo, fillGeo, glowGeo].forEach((g) => g.dispose());
          [spokeMat, sideMat, fillMat, glowMat].forEach((m) => m.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  const axis = AXIS_KEYS[Math.min(step, AXIS_KEYS.length - 1)];
  const options = t.raw(`axes.${axis}.o`) as string[];
  const caseSlug = CHECK_AXES[weakest].caseSlug;

  return (
    <section ref={sectionRef} id="kiem-tra" className="relative overflow-hidden bg-ink pb-16 pt-24 text-white sm:pb-24 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_35%,rgba(66,133,244,0.2),transparent_60%)]" />
      <Container className="relative grid gap-5 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-4 sm:gap-5">
          <span className="text-sm font-bold uppercase tracking-[0.14em] text-brand-300">{t("eyebrow")}</span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{heading}</h1>
          <p className="hidden max-w-xl text-lg text-white/70 sm:block">{t("sub")}</p>
          <p className="flex items-center gap-2 text-sm font-semibold text-gold-400">
            <ShieldCheck size={16} aria-hidden /> {t("free")}
          </p>
          <div className="relative mx-auto aspect-[16/11] w-full max-w-[520px] select-none sm:aspect-[4/3]">
            <div ref={hostRef} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
            {AXIS_KEYS.map((k, i) => (
              <span
                key={k}
                ref={(el) => {
                  labelRefs.current[i] = el;
                }}
                className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold opacity-0 ${
                  done && k === weakest ? "bg-[#ff6b59] text-white" : values[k] !== undefined ? "bg-gold-400 text-ink" : "bg-white/10 text-white/70 ring-1 ring-white/15"
                }`}
              >
                {t(`axes.${k}.label`)}
              </span>
            ))}
            {done && (
              <div className="pointer-events-none absolute right-0 top-0 flex flex-col items-end">
                <span className="font-display text-4xl font-bold tabular-nums text-gold-400 sm:text-5xl">{score}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">{t("score")} /100</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur sm:p-7">
          {!done ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-white/55">
                <span>{t("step", { n: step + 1 })}</span>
                <span className="flex gap-1.5" aria-hidden>
                  {AXIS_KEYS.map((k, i) => (
                    <span key={k} className={`h-1.5 w-7 rounded-full ${i < step ? "bg-gold-400" : i === step ? "bg-white/60" : "bg-white/15"}`} />
                  ))}
                </span>
              </div>
              <h2 className="font-display text-2xl font-bold leading-snug">{t(`axes.${axis}.q`)}</h2>
              <div className="flex flex-col gap-2.5">
                {options.map((o, level) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => answer(axis, level)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                      values[axis] === level ? "bg-gold-400 text-ink" : "bg-white/5 ring-1 ring-white/12 hover:bg-white/10 hover:ring-gold-400/50"
                    }`}
                  >
                    <span className="flex gap-0.5" aria-hidden>
                      {Array.from({ length: LEVELS - 1 }, (_, b) => (
                        <span key={b} className={`h-3.5 w-1.5 rounded-sm ${b < level ? "bg-gold-400" : "bg-white/20"}`} />
                      ))}
                    </span>
                    <span className="flex-1">{o}</span>
                    <ArrowRight size={18} aria-hidden className="shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                  <ArrowLeft size={15} aria-hidden /> {t("back")}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 rounded-xl bg-[#ff6b59]/10 p-4 ring-1 ring-[#ff6b59]/40">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff9b8e]">{t("weakest")}</p>
                <p className="font-display text-2xl font-bold">{t(`axes.${weakest}.label`)}</p>
                <p className="text-sm text-white/75">
                  <span className="font-semibold text-white">{t("nextStep")}:</span> {t(`fix.${weakest}`)}
                </p>
              </div>
              <Link
                href={{ pathname: "/case-studies/[slug]", params: { slug: caseSlug } }}
                onClick={() => trackEvent("check_case", { slug: caseSlug })}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10 hover:bg-white/10"
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{t("proofLabel")}</span>
                  <span className="font-semibold">{t(`proof.${weakest}`)}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-300">
                  {t("seeCase")} <ArrowRight size={15} aria-hidden />
                </span>
              </Link>

              {status === "done" ? (
                <p role="status" className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-3 text-sm font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
                  <Check size={18} aria-hidden /> {t("done")}
                </p>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <div>
                    <h2 className="font-display text-xl font-bold">{t("leadTitle")}</h2>
                    <p className="mt-1 text-sm text-white/65">{t("leadBody")}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="name" required maxLength={120} autoComplete="name" placeholder={t("name")} aria-label={t("name")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-400" />
                    <input name="phone" required inputMode="tel" pattern="[0-9+\s.\-()]{8,30}" autoComplete="tel" placeholder={t("phone")} aria-label={t("phone")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-gold-400" />
                  </div>
                  <button type="submit" disabled={status === "sending"} className="rounded-full bg-gold-400 px-5 py-3.5 text-base font-bold text-ink transition-colors hover:bg-gold-500 disabled:opacity-60">
                    {status === "sending" ? t("sending") : t("submit")}
                  </button>
                  {status === "error" && <p role="alert" className="text-sm text-red-300">{t("error")}</p>}
                </form>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm font-semibold">
                <a href={COMPANY.zalo} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("check_cta", { to: "zalo" })} className="inline-flex items-center gap-1.5 text-[#35b6ff] hover:text-white">
                  <MessageCircle size={16} aria-hidden /> {t("orZalo")}
                </a>
                <a href={`tel:${COMPANY.phone}`} onClick={() => trackEvent("check_cta", { to: "call" })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
                  <Phone size={16} aria-hidden /> {t("orCall", { phone: COMPANY.phoneDisplay })}
                </a>
                <Link href="/booking" onClick={() => trackEvent("check_cta", { to: "booking" })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
                  <CalendarCheck size={16} aria-hidden /> {t("orBook")}
                </Link>
                <button type="button" onClick={restart} className="ml-auto inline-flex items-center gap-1.5 text-white/50 hover:text-white">
                  <RotateCcw size={14} aria-hidden /> {t("restart")}
                </button>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
