"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { trackEvent } from "@/lib/tracking/grid";

/** "Living proof" — each real case study result is drawn as a particle field
 *  in three.js. Every particle is one unit of the metric, so the jump from
 *  "before" to "after" is something the visitor *sees* grow, not a number they
 *  skim. Copy lives in messages → proof.cases, same order as CASES. */
type Shape = "galaxy" | "bars" | "orbits";
const CASES: { slug: string; shape: Shape; from: number; to: number }[] = [
  // Khang Vũ: 292 → 20,000+ Facebook views in 2 months
  { slug: "khang-vu-auto-care", shape: "galaxy", from: 292, to: 20000 },
  // Apex Autocare: +289% Facebook views (1 → 3.89×)
  { slug: "apex-autocare", shape: "bars", from: 100, to: 389 },
  // AP ecosystem: 1 car care centre → 5 brands
  { slug: "johnny-loc-nguyen-he-sinh-thai-ap", shape: "orbits", from: 1, to: 5 },
];

const COUNT = 2400;
const ZALO_URL = "https://zalo.me/0769918685";
const AUTO_MS = 7000;

/** Deterministic pseudo-random so every visit draws the same composition. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

function buildShape(shape: Shape, groups: number): Float32Array {
  const r = rng(shape === "galaxy" ? 7 : shape === "bars" ? 13 : 29 + groups);
  const out = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    let x = 0, y = 0, z = 0;
    if (shape === "galaxy") {
      // Spiral galaxy: 3 arms, denser near the core.
      const t = Math.pow(r(), 0.7);
      const arm = (i % 3) * ((Math.PI * 2) / 3);
      const a = arm + t * 5.2 + (r() - 0.5) * 0.5;
      const rad = 0.15 + t * 2.6;
      x = Math.cos(a) * rad + (r() - 0.5) * 0.25;
      z = Math.sin(a) * rad + (r() - 0.5) * 0.25;
      y = (r() - 0.5) * 0.35 * (1 - t);
    } else if (shape === "bars") {
      // Eight rising columns — a growth chart made of light.
      const col = i % 8;
      const h = 0.35 + Math.pow((col + 1) / 8, 1.6) * 3.3;
      x = (col - 3.5) * 0.62 + (r() - 0.5) * 0.36;
      z = (r() - 0.5) * 0.36;
      y = -1.7 + r() * h;
    } else {
      // N brand clusters orbiting a shared core.
      const g = i % groups;
      const a = groups === 1 ? 0 : (g / groups) * Math.PI * 2;
      const ring = groups === 1 ? 0 : 1.75;
      const cx = Math.cos(a) * ring, cz = Math.sin(a) * ring;
      const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1);
      const rad = (groups === 1 ? 0.9 : 0.55) * Math.cbrt(r());
      x = cx + rad * Math.sin(v) * Math.cos(u);
      y = rad * Math.cos(v) * 0.9;
      z = cz + rad * Math.sin(v) * Math.sin(u);
    }
    out[i * 3] = x;
    out[i * 3 + 1] = y;
    out[i * 3 + 2] = z;
  }
  return out;
}

export function ProofEngine() {
  const t = useTranslations("proof");
  const copy = t.raw("cases") as {
    tag: string;
    client: string;
    before: string;
    after: string;
    metric: string;
    story: string;
  }[];

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  // Read by the render loop, which lives outside React.
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Auto-advance through cases until the visitor picks one.
  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % CASES.length), AUTO_MS);
    return () => window.clearInterval(id);
  }, [pinned]);

  // three.js is loaded only when the section approaches the viewport.
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
        if (disposed) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 50);
        camera.position.set(0, 3.2, 6.6);
        camera.lookAt(0, 0, 0);

        // Shape per case; "orbits" starts collapsed to 1 cluster then splits.
        const shapes = CASES.map((c) => buildShape(c.shape, c.shape === "orbits" ? c.to : 0));
        const orbitsBefore = buildShape("orbits", 1);

        const pos = new Float32Array(shapes[0]);
        const alpha = new Float32Array(COUNT);
        const tint = new Float32Array(COUNT);
        const order = new Float32Array(COUNT);
        const r = rng(3);
        for (let i = 0; i < COUNT; i++) {
          order[i] = r();
          tint[i] = r();
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
        geo.setAttribute("aTint", new THREE.BufferAttribute(tint, 1));

        const mat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uSize: { value: 130 * renderer.getPixelRatio() } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aTint;
            uniform float uSize; varying float vA; varying float vT;
            void main() {
              vA = aAlpha; vT = aTint;
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              gl_PointSize = uSize * (0.35 + aTint * 0.4) / -mv.z;
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying float vT;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float glow = smoothstep(0.5, 0.0, d);
              vec3 gold = vec3(0.43, 0.65, 0.97);
              vec3 blue = vec3(0.43, 0.65, 0.97);
              vec3 c = mix(blue, gold, smoothstep(0.35, 0.9, vT));
              gl_FragColor = vec4(c * 1.15, pow(glow, 1.6) * vA);
            }`,
        });
        const points = new THREE.Points(geo, mat);
        scene.add(points);

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        // Per-case timeline: hold "before" briefly, then grow to "after".
        let current = -1;
        let caseStart = 0;
        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const idx = activeRef.current;
          if (idx !== current) {
            current = idx;
            caseStart = now;
          }
          const c = CASES[idx];
          const el = (now - caseStart) / 1000;
          const grow = reduce ? 1 : Math.min(1, Math.max(0, (el - 0.9) / 2.2));
          const eased = 1 - Math.pow(1 - grow, 3);
          const ratio = c.from / c.to;
          const reveal = ratio + (1 - ratio) * eased;
          const target = c.shape === "orbits" && eased < 0.5 ? orbitsBefore : shapes[idx];
          const k = reduce ? 1 : 0.055;
          for (let i = 0; i < COUNT; i++) {
            const j = i * 3;
            pos[j] += (target[j] - pos[j]) * k;
            pos[j + 1] += (target[j + 1] - pos[j + 1]) * k;
            pos[j + 2] += (target[j + 2] - pos[j + 2]) * k;
            const on = c.shape === "orbits" ? 1 : order[i] < reveal ? 1 : 0.03;
            alpha[i] += (on - alpha[i]) * 0.08;
          }
          geo.attributes.position.needsUpdate = true;
          geo.attributes.aAlpha.needsUpdate = true;
          if (!reduce) points.rotation.y = now * 0.00012;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          geo.dispose();
          mat.dispose();
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

  const pick = (i: number) => {
    setPinned(true);
    setActive(i);
    trackEvent("proof_case", { case: CASES[i].slug });
  };

  const c = copy[active];

  return (
    <section
      ref={sectionRef}
      id="bang-chung"
      className="relative overflow-hidden bg-ink py-20 text-white sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_30%_50%,rgba(66,133,244,0.18),transparent_70%)]"
      />
      <Container className="relative grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
        <div className="relative aspect-[4/3] w-full lg:aspect-square">
          <div ref={canvasHost} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] tracking-wide text-white/55 backdrop-blur">
            {t("legend")}
          </div>
        </div>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              {t("eyebrow")}
            </p>
            <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">
              {t("heading")}
            </h2>
          </div>

          <div role="tablist" aria-label={t("eyebrow")} className="flex flex-wrap gap-2">
            {copy.map((item, i) => (
              <button
                key={CASES[i].slug}
                role="tab"
                aria-selected={i === active}
                onClick={() => pick(i)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  i === active
                    ? "border-brand-400 bg-brand-400 text-ink"
                    : "border-white/15 text-white/80 hover:border-white/40 hover:text-white"
                }`}
              >
                {item.client}
              </button>
            ))}
          </div>

          <div key={active} className="flex animate-[fadeUp_.5s_ease] flex-col gap-4" role="tabpanel">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">{c.tag}</p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
              <span className="whitespace-nowrap font-display text-2xl font-semibold text-white/40 line-through decoration-white/25 sm:text-3xl">
                {c.before}
              </span>
              <ArrowRight className="mb-2 h-6 w-6 text-leaf-400" aria-hidden />
              <span className="whitespace-nowrap font-display text-4xl font-extrabold leading-none text-leaf-400 sm:text-5xl xl:text-6xl">
                {c.after}
              </span>
            </div>
            <p className="text-sm text-white/55">{c.metric}</p>
            <p className="max-w-md leading-relaxed text-white/80">{c.story}</p>
            <Link
              href={{ pathname: "/case-studies/[slug]", params: { slug: CASES[active].slug } }}
              className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-white"
            >
              {t("readCase")} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="font-display text-lg font-semibold">{t("ctaHeading")}</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("proof_cta", { channel: "zalo" })}
                className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
              </a>
              <Link
                href="/booking"
                onClick={() => trackEvent("proof_cta", { channel: "booking" })}
                className="inline-flex items-center rounded-full border border-white/20 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/50"
              >
                {t("ctaBook")}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
