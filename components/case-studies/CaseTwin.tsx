"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, MessageCircle, RotateCcw, X } from "lucide-react";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { TWIN_KEYS, TWIN_QUESTIONS, bestMatch, matchParts, similarity, type TwinAnswers } from "@/lib/caseTwin";
import { trackEvent } from "@/lib/tracking/grid";

/** "Bản sao cơ sở" — closes every case-study page. Two particle towers
 *  (three.js): the case's shop in gold, fully built, and the visitor's shop
 *  in blue, one ring per answered question. Matching rings are bridged by
 *  flowing particles; the % is the weighted match from lib/caseTwin.ts.
 *  If another published case fits better it is suggested, then a 2-field
 *  lead form goes to /api/twin (email "[Dự án] …"). Copy: caseStudies.twin. */

type Other = { slug: string; name: string };
const RINGS = TWIN_KEYS.length;
const PER_RING = 90;
const BRIDGE = 46; // particles per ring bridge
const RING_Y = [0.95, 0.32, -0.32, -0.95];
const RING_R = [0.62, 0.92, 0.92, 0.62];

export function CaseTwin({ slug, client, others }: { slug: string; client: string; others: Other[] }) {
  const t = useTranslations("caseStudies.twin");
  const [answers, setAnswers] = useState<TwinAnswers>({});
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const caseLabel = useRef<HTMLSpanElement>(null);
  const youLabel = useRef<HTMLSpanElement>(null);
  const stateRef = useRef({ built: new Array(RINGS).fill(0), match: new Array(RINGS).fill(0) });

  const answered = TWIN_KEYS.filter((k) => answers[k]).length;
  const pct = similarity(answers, slug);
  const parts = matchParts(answers, slug);
  const best = bestMatch(answers, slug, others.map((o) => o.slug));
  const bestOther = best.slug !== slug && best.pct >= pct + 8 ? others.find((o) => o.slug === best.slug) : undefined;
  const done = step >= RINGS;

  // Feed the scene: which rings exist on the visitor's side, and how well each matches.
  useEffect(() => {
    const m = matchParts(answers, slug);
    TWIN_KEYS.forEach((k, i) => {
      stateRef.current.built[i] = answers[k] ? 1 : 0;
      stateRef.current.match[i] = m[k] ?? 0;
    });
  }, [answers, slug]);

  const choose = (key: (typeof TWIN_KEYS)[number], value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);
    setStep((s) => s + 1);
    trackEvent("twin_answer", { case: slug, q: key, a: value });
    if (TWIN_KEYS.every((k) => next[k])) trackEvent("twin_result", { case: slug, pct: similarity(next, slug) });
  };

  const restart = () => {
    setAnswers({});
    setStep(0);
    setStatus("idle");
  };

  const answerLabels = () => TWIN_KEYS.filter((k) => answers[k]).map((k) => `${t(`labels.${k}`)}: ${t(`questions.${k}.options.${answers[k]}`)}`);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          caseName: client,
          pct,
          bestCase: bestOther?.name,
          answers: answerLabels(),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      trackEvent("twin_lead", { case: slug, pct });
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

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
        const world = new THREE.Group();
        scene.add(world);
        const ratio = renderer.getPixelRatio();

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
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = aSize * uScale * (6.0 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying vec3 vC;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float core = smoothstep(0.15, 0.0, d);
              float halo = pow(smoothstep(0.5, 0.0, d), 2.3);
              gl_FragColor = vec4(vC * (0.75 + core), (halo * 0.8 + core) * vA);
            }`,
        });
        const cloud = (n: number, parent: InstanceType<typeof THREE.Object3D>) => {
          const geo = new THREE.BufferGeometry();
          const p = new Float32Array(n * 3), a = new Float32Array(n), s = new Float32Array(n), c = new Float32Array(n * 3);
          geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
          geo.setAttribute("aAlpha", new THREE.BufferAttribute(a, 1));
          geo.setAttribute("aSize", new THREE.BufferAttribute(s, 1));
          geo.setAttribute("aColor", new THREE.BufferAttribute(c, 3));
          parent.add(new THREE.Points(geo, glowMat));
          return { geo, p, a, s, c, flag: () => Object.values(geo.attributes).forEach((x) => (x.needsUpdate = true)) };
        };
        const rnd = (i: number, k: number) => {
          const x = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453;
          return x - Math.floor(x);
        };

        const GAP = 1.75;
        const towers = [-GAP, GAP].map((x) => {
          const g = new THREE.Group();
          g.position.x = x;
          world.add(g);
          return g;
        });
        const GOLD = [0.43, 0.65, 0.97], BLUE = [0.45, 0.66, 1];

        // Ring target positions (shared shape for both towers).
        const ringPos = new Float32Array(RINGS * PER_RING * 3);
        for (let k = 0; k < RINGS; k++)
          for (let j = 0; j < PER_RING; j++) {
            const a = (j / PER_RING) * Math.PI * 2;
            const wob = (rnd(k * 999 + j, 3) - 0.5) * 0.06;
            ringPos.set([Math.cos(a) * (RING_R[k] + wob), RING_Y[k] + wob, Math.sin(a) * (RING_R[k] + wob)], (k * PER_RING + j) * 3);
          }

        const caseT = cloud(RINGS * PER_RING + 1, towers[0]);
        const youT = cloud(RINGS * PER_RING + 1, towers[1]);
        caseT.p.set(ringPos);
        const N = RINGS * PER_RING;
        for (let i = 0; i < N; i++) {
          caseT.c.set(GOLD, i * 3);
          youT.c.set(BLUE, i * 3);
          caseT.s[i] = youT.s[i] = 7;
          // Visitor particles start scattered around their tower.
          youT.p.set([(rnd(i, 1) - 0.5) * 3, (rnd(i, 2) - 0.5) * 3, (rnd(i, 4) - 0.5) * 3], i * 3);
        }
        caseT.c.set(GOLD, N * 3);
        youT.c.set(BLUE, N * 3);
        caseT.p.set([0, 0, 0], N * 3);
        youT.p.set([0, 0, 0], N * 3);
        const scatter = youT.p.slice();

        // Bridges between matching rings (world space).
        const bridge = cloud(RINGS * BRIDGE, world);
        for (let i = 0; i < RINGS * BRIDGE; i++) bridge.c.set([1, 0.9, 0.7], i * 3);

        const built = new Float32Array(RINGS);
        const match = new Float32Array(RINGS);

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.position.set(0, 0.35, camera.aspect < 1.1 ? 8.4 / Math.max(camera.aspect, 0.7) : 7);
          camera.lookAt(0, 0, 0);
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

        const v = new THREE.Vector3(), from = new THREE.Vector3(), to = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          const ease = reduce ? 1 : 0.06;
          for (let k = 0; k < RINGS; k++) {
            built[k] += (stateRef.current.built[k] - built[k]) * ease;
            match[k] += (stateRef.current.match[k] * stateRef.current.built[k] - match[k]) * ease;
          }

          if (!reduce) {
            towers[0].rotation.y = time * 0.25;
            towers[1].rotation.y = -time * 0.25;
            world.rotation.y += (pointer.x * 0.25 - world.rotation.y) * 0.05;
            world.rotation.x += (pointer.y * 0.12 - world.rotation.x) * 0.05;
          }

          for (let k = 0; k < RINGS; k++)
            for (let j = 0; j < PER_RING; j++) {
              const i = k * PER_RING + j;
              const b = built[k];
              youT.p[i * 3] = scatter[i * 3] + (ringPos[i * 3] - scatter[i * 3]) * b;
              youT.p[i * 3 + 1] = scatter[i * 3 + 1] + (ringPos[i * 3 + 1] - scatter[i * 3 + 1]) * b;
              youT.p[i * 3 + 2] = scatter[i * 3 + 2] + (ringPos[i * 3 + 2] - scatter[i * 3 + 2]) * b;
              youT.a[i] = 0.12 + b * 0.75;
              caseT.a[i] = 0.5 + match[k] * 0.5;
              caseT.s[i] = 6 + match[k] * 4;
              youT.s[i] = 4 + b * 3 + match[k] * 3;
            }
          const total = built.reduce((s, x) => s + x, 0) / RINGS;
          const avg = match.reduce((s, x) => s + x, 0) / RINGS;
          caseT.s[N] = 120 + avg * 80;
          caseT.a[N] = 0.35 + avg * 0.4;
          youT.s[N] = 40 + total * 100;
          youT.a[N] = 0.15 + total * 0.35;
          caseT.flag();
          youT.flag();

          // Bridges: arcs from case ring k to visitor ring k, density ∝ match.
          for (let k = 0; k < RINGS; k++) {
            from.set(-GAP + RING_R[k] * 0.9, RING_Y[k], 0);
            to.set(GAP - RING_R[k] * 0.9, RING_Y[k], 0);
            for (let j = 0; j < BRIDGE; j++) {
              const i = k * BRIDGE + j;
              const u = reduce ? j / BRIDGE : (time * 0.35 + j / BRIDGE + k * 0.13) % 1;
              v.lerpVectors(from, to, u);
              v.y += Math.sin(u * Math.PI) * 0.28;
              v.z += Math.sin(u * Math.PI * 2 + k) * 0.08;
              bridge.p.set([v.x, v.y, v.z], i * 3);
              const on = j / BRIDGE < match[k];
              bridge.a[i] = on ? Math.sin(u * Math.PI) * 0.9 * match[k] : 0;
              bridge.s[i] = 5;
            }
          }
          bridge.flag();

          // Labels under each tower.
          const w = host.clientWidth, h = host.clientHeight;
          [caseLabel.current, youLabel.current].forEach((el, side) => {
            if (!el) return;
            v.set(side ? GAP : -GAP, -1.45, 0);
            world.localToWorld(v);
            v.project(camera);
            el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%, 0)`;
            el.style.opacity = "1";
          });

          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.removeEventListener("pointermove", onMove);
          [caseT, youT, bridge].forEach((x) => x.geo.dispose());
          glowMat.dispose();
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
  }, []);

  const key = TWIN_KEYS[Math.min(step, RINGS - 1)];
  const options = TWIN_QUESTIONS[key].options as readonly string[];

  return (
    <section ref={sectionRef} id="ban-sao" className="relative overflow-hidden bg-ink py-16 text-white sm:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_45%,rgba(110,166,247,0.12),transparent_60%)]" />
      <Container className="relative grid gap-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <span className="text-sm font-bold uppercase tracking-[0.14em] text-brand-300">{t("eyebrow")}</span>
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">{t("heading", { client })}</h2>
            <p className="text-base text-white/65">{t("sub", { client })}</p>
          </div>

          <div className="relative aspect-[16/11] w-full select-none">
            <div ref={hostRef} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
            <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col items-center">
              <span className="font-display text-5xl font-bold tabular-nums text-brand-400 sm:text-6xl">
                {answered ? `${pct}%` : "?"}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {answered ? t("estimate", { n: answered }) : t("match")}
              </span>
            </div>
            <span ref={caseLabel} className="pointer-events-none absolute left-0 top-0 max-w-[45%] truncate rounded-full opacity-0 bg-brand-400 px-3 py-1 text-xs font-bold text-ink">
              {client}
            </span>
            <span ref={youLabel} className="pointer-events-none absolute left-0 top-0 rounded-full bg-brand-500 opacity-0 px-3 py-1 text-xs font-bold text-white">
              {t("youLabel")}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-7">
          {!done ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-white/55">
                <span>{t("step", { n: step + 1 })}</span>
                <span className="flex gap-1.5" aria-hidden>
                  {TWIN_KEYS.map((k, i) => (
                    <span key={k} className={`h-1.5 w-8 rounded-full ${i < step ? "bg-brand-400" : i === step ? "bg-white/60" : "bg-white/15"}`} />
                  ))}
                </span>
              </div>
              <h3 className="font-display text-2xl font-bold leading-snug">{t(`questions.${key}.q`)}</h3>
              <div className="flex flex-col gap-2.5">
                {options.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => choose(key, o)}
                    className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                      answers[key] === o ? "bg-brand-400 text-ink" : "bg-white/5 ring-1 ring-white/12 hover:bg-white/10 hover:ring-brand-400/50"
                    }`}
                  >
                    {t(`questions.${key}.options.${o}`)}
                    <ArrowRight size={18} aria-hidden className="shrink-0 opacity-60" />
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
              <div className="grid gap-3 sm:grid-cols-2">
                {(["same", "diff"] as const).map((group) => {
                  const keys = TWIN_KEYS.filter((k) => (group === "same" ? (parts[k] ?? 0) >= 0.5 : (parts[k] ?? 0) < 0.5));
                  return (
                    <div key={group} className="rounded-xl bg-white/5 p-4 ring-1 ring-white/10">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">{t(group)}</p>
                      <ul className="mt-2 flex flex-col gap-1.5 text-sm">
                        {keys.length === 0 && <li className="text-white/40">—</li>}
                        {keys.map((k) => (
                          <li key={k} className="flex items-center gap-2">
                            {group === "same" ? <Check size={15} className="text-leaf-400" aria-hidden /> : <X size={15} className="text-white/40" aria-hidden />}
                            {t(`labels.${k}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {bestOther && (
                <Link
                  href={{ pathname: "/case-studies/[slug]", params: { slug: bestOther.slug } }}
                  onClick={() => trackEvent("twin_better", { from: slug, to: bestOther.slug })}
                  className="flex items-center justify-between gap-3 rounded-xl bg-brand-500/15 px-4 py-3 text-sm font-semibold ring-1 ring-brand-300/40 hover:bg-brand-500/25"
                >
                  <span>{t("betterTitle", { client: bestOther.name, pct: best.pct })}</span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-brand-300">
                    {t("betterLink")} <ArrowRight size={15} aria-hidden />
                  </span>
                </Link>
              )}

              {status === "done" ? (
                <p role="status" className="flex items-center gap-2 rounded-xl bg-leaf-500/15 px-4 py-3 text-sm font-semibold text-leaf-400 ring-1 ring-leaf-500/30">
                  <Check size={18} aria-hidden /> {t("done")}
                </p>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3">
                  <div>
                    <h3 className="font-display text-xl font-bold">{t("leadTitle", { client })}</h3>
                    <p className="mt-1 text-sm text-white/65">{t("leadBody")}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="name" required maxLength={120} autoComplete="name" placeholder={t("name")} aria-label={t("name")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input name="phone" required inputMode="tel" pattern="[0-9+\s.\-()]{8,30}" autoComplete="tel" placeholder={t("phone")} aria-label={t("phone")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <button type="submit" disabled={status === "sending"} className="rounded-full bg-brand-400 px-5 py-3.5 text-base font-bold text-ink transition-colors hover:bg-brand-500 disabled:opacity-60">
                    {status === "sending" ? t("sending") : t("submit")}
                  </button>
                  {status === "error" && <p role="alert" className="text-sm text-red-300">{t("error")}</p>}
                </form>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm font-semibold">
                <a href={COMPANY.zalo} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent("twin_cta", { to: "zalo" })} className="inline-flex items-center gap-1.5 text-[#6ea6f7] hover:text-white">
                  <MessageCircle size={16} aria-hidden /> {t("zalo")}
                </a>
                <Link href="/booking" onClick={() => trackEvent("twin_cta", { to: "booking" })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
                  <CalendarCheck size={16} aria-hidden /> {t("book")}
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
