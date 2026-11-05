"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck, ChevronDown, MapPin, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/** "Hành trình" — the founder's real milestones as stops on a night road
 *  (three.js). The section is (stops + 1) screens tall with a sticky stage:
 *  scrolling drives the camera along the road, past a glowing post per
 *  milestone, and the card for the nearest stop fades in. The last post is
 *  the visitor's own shop, with the booking / Zalo CTA.
 *  Copy: messages → about.journey (stops in the same order as `stops`). */

export type JourneyStop = {
  /** Case study link (localized route object) or legal records anchor. */
  href?: { pathname: "/case-studies/[slug]"; params: { slug: string } } | { pathname: "/contact"; hash: string };
  image?: string;
};

const SPACING = 7; // road length between two posts
const AHEAD = 7.5; // camera stops this far before the post it is showing

function roadPoint(i: number): [number, number, number] {
  return [Math.sin(i * 1.25) * 2.4, 0, -i * SPACING];
}

export function FounderJourney({ stops }: { stops: JourneyStop[] }) {
  const t = useTranslations("about.journey");
  const copy = t.raw("stops") as { date: string; place: string; title: string; body: string; metric: string }[];
  const total = stops.length + 1; // + "your business"
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const postLabels = useRef<(HTMLSpanElement | null)[]>([]);
  const progressRef = useRef(0);
  const seen = useRef(new Set<number>());

  // Scroll → progress (0..1 across the section) → nearest stop.
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const onScroll = () => {
      const r = section.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      const p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      progressRef.current = p;
      const k = Math.round(p * (total - 1));
      setActive(k);
      if (!seen.current.has(k) && r.top < 0 && r.bottom > 0) {
        seen.current.add(k);
        trackEvent("journey_stop", { stop: k });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

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
        const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 80);
        const ratio = renderer.getPixelRatio();

        // Road centre line through every post, extended behind the start and past the end.
        const ctrl = [-1, ...Array.from({ length: total }, (_, i) => i), total, total + 1].map(
          (i) => new THREE.Vector3(...roadPoint(i)),
        );
        const curve = new THREE.CatmullRomCurve3(ctrl, false, "centripetal");
        const L = curve.getLength();
        // Curve parameter (arc-length u) at each post.
        const postU = Array.from({ length: total }, (_, i) => {
          const target = new THREE.Vector3(...roadPoint(i));
          let best = 0, bestD = Infinity;
          for (let s = 0; s <= 2000; s++) {
            const d = curve.getPointAt(s / 2000).distanceToSquared(target);
            if (d < bestD) {
              bestD = d;
              best = s / 2000;
            }
          }
          return best;
        });

        // One fading glow shader for every point cloud; alpha falls off with distance (fog).
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uScale: { value: ratio } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aSize; attribute vec3 aColor;
            uniform float uScale; varying float vA; varying vec3 vC;
            void main() {
              vec4 mv = modelViewMatrix * vec4(position, 1.0);
              float fog = clamp(1.0 - (-mv.z - 4.0) / 34.0, 0.0, 1.0);
              vA = aAlpha * fog; vC = aColor;
              gl_PointSize = aSize * uScale * (10.0 / max(-mv.z, 0.5));
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying vec3 vC;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float core = smoothstep(0.16, 0.0, d);
              float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
              gl_FragColor = vec4(vC * (0.7 + core), (halo * 0.8 + core) * vA);
            }`,
        });
        const cloud = (n: number) => {
          const geo = new THREE.BufferGeometry();
          const p = new Float32Array(n * 3), a = new Float32Array(n), s = new Float32Array(n), c = new Float32Array(n * 3);
          geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
          geo.setAttribute("aAlpha", new THREE.BufferAttribute(a, 1));
          geo.setAttribute("aSize", new THREE.BufferAttribute(s, 1));
          geo.setAttribute("aColor", new THREE.BufferAttribute(c, 3));
          scene.add(new THREE.Points(geo, glowMat));
          return { geo, p, a, s, c, flag: () => Object.values(geo.attributes).forEach((x) => (x.needsUpdate = true)) };
        };

        const v = new THREE.Vector3(), tan = new THREE.Vector3(), side = new THREE.Vector3();
        const UP = new THREE.Vector3(0, 1, 0);
        const sideAt = (u: number) => {
          curve.getTangentAt(u, tan);
          return side.crossVectors(tan, UP).normalize();
        };

        // Road edges: dotted kerb lights on both sides.
        const EDGE = 420;
        const edges = cloud(EDGE * 2);
        for (let k = 0; k < EDGE; k++) {
          const u = k / (EDGE - 1);
          curve.getPointAt(u, v);
          const sd = sideAt(u);
          for (const [j, dir] of [[0, 1], [1, -1]] as const) {
            const i = k * 2 + j;
            edges.p.set([v.x + sd.x * 1.1 * dir, 0, v.z + sd.z * 1.1 * dir], i * 3);
            edges.a[i] = 0.55;
            edges.s[i] = 6.5;
            edges.c.set([0.45, 0.6, 1], i * 3);
          }
        }
        edges.flag();

        // City lights scattered either side of the road.
        const CITY = 900;
        const city = cloud(CITY);
        for (let i = 0; i < CITY; i++) {
          const h = (x: number) => {
            const s = Math.sin(i * 12.9898 + x * 78.233) * 43758.5453;
            return s - Math.floor(s);
          };
          const u = h(1);
          curve.getPointAt(u, v);
          const sd = sideAt(u);
          const off = (2.4 + h(2) * 9) * (h(3) > 0.5 ? 1 : -1);
          city.p.set([v.x + sd.x * off, h(4) * h(4) * 3.2, v.z + sd.z * off], i * 3);
          city.a[i] = 0.25 + h(5) * 0.45;
          city.s[i] = 2.5 + h(6) * 3;
          const warm = h(7) > 0.62;
          city.c.set(warm ? [0.43, 0.65, 0.97] : [0.55, 0.68, 1], i * 3);
        }
        city.flag();

        // Lane lights travelling down the road (the "work in motion").
        const LANE = 70;
        const lane = cloud(LANE);
        for (let i = 0; i < LANE; i++) lane.c.set([0.43, 0.65, 0.97], i * 3);

        // Posts: a vertical beam + a beacon per milestone; the last one is the visitor's shop.
        const posts = cloud(total * 26);
        const beaconAt = (i: number) => new THREE.Vector3(...roadPoint(i)).add(sideAt(postU[i]).clone().multiplyScalar(-1.9));
        const beacons = Array.from({ length: total }, (_, i) => beaconAt(i));
        const lit = new Float32Array(total);

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.fov = camera.aspect < 0.8 ? 68 : 55;
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
          pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
          pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
        };
        window.addEventListener("pointermove", onMove);

        let camS = progressRef.current * (total - 1); // eased stop position
        const look = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          const targetS = progressRef.current * (total - 1);
          camS += (targetS - camS) * (reduce ? 1 : 0.08);

          // Camera rides the road, AHEAD units before the post it is approaching.
          const k0 = Math.min(total - 2, Math.floor(camS));
          const f = camS - k0;
          const uPost = postU[k0] + (postU[k0 + 1] - postU[k0]) * f;
          const uCam = Math.max(0, uPost - AHEAD / L);
          curve.getPointAt(uCam, v);
          camera.position.set(v.x + pointer.x * 0.35, 1.9 - pointer.y * 0.2, v.z);
          curve.getPointAt(Math.min(1, uPost + 1.5 / L), look);
          const nearest = Math.round(camS);
          look.lerp(beacons[nearest], 0.6).setY(1.5);
          camera.lookAt(look);

          // Posts: beam of points + beacon; the current one glows gold, the last one blue-white.
          const w = host.clientWidth, h = host.clientHeight;
          for (let i = 0; i < total; i++) {
            lit[i] += ((i === nearest ? 1 : 0) - lit[i]) * 0.08;
            const last = i === total - 1;
            const col = last ? [0.7, 0.85, 1] : [0.43, 0.65, 0.97];
            const b = beacons[i];
            for (let j = 0; j < 26; j++) {
              const idx = i * 26 + j;
              const top = j === 25;
              const y = top ? 2.6 : (j / 25) * 2.4;
              posts.p.set([b.x, y, b.z], idx * 3);
              posts.c.set(col, idx * 3);
              const pulse = reduce ? 1 : 1 + Math.sin(time * 2.4 + i) * 0.12;
              posts.a[idx] = top ? 0.75 + lit[i] * 0.25 : 0.28 + lit[i] * 0.45;
              posts.s[idx] = top ? (14 + lit[i] * 18 + (last ? 26 : 0)) * pulse : 4 + lit[i] * 2;
            }
            const el = postLabels.current[i];
            if (el) {
              v.set(b.x, 3.15, b.z).project(camera);
              const front = v.z < 1;
              el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%, -100%)`;
              const near = i >= nearest && i <= nearest + 2;
              el.style.opacity = near && front && Math.abs(v.x) < 1.1 ? String(0.4 + lit[i] * 0.6) : "0";
            }
          }
          posts.flag();

          for (let i = 0; i < LANE; i++) {
            const u = ((i / LANE) + (reduce ? 0 : time * 0.012)) % 1;
            curve.getPointAt(u, v);
            const sd = sideAt(u);
            const laneOff = i % 2 ? 0.45 : -0.45;
            lane.p.set([v.x + sd.x * laneOff, 0.06, v.z + sd.z * laneOff], i * 3);
            lane.a[i] = 0.75;
            lane.s[i] = 4.5;
          }
          lane.flag();

          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          window.removeEventListener("pointermove", onMove);
          [edges, city, lane, posts].forEach((x) => x.geo.dispose());
          glowMat.dispose();
          renderer.dispose();
          renderer.domElement.remove();
        };
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(section);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, [total]);

  const goTo = (k: number) => {
    const section = sectionRef.current;
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY;
    const span = section.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * k) / (total - 1), behavior: "smooth" });
  };

  const isLast = active === total - 1;

  return (
    <section
      ref={sectionRef}
      id="hanh-trinh"
      aria-label={t("eyebrow")}
      className="relative bg-ink text-white"
      style={{ height: `${total * 85 + 15}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={hostRef} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,18,32,0.85),transparent_30%,transparent_60%,rgba(11,18,32,0.9))]" />

        {/* Date labels floating above each post. */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {Array.from({ length: total }, (_, i) => (
            <span
              key={i}
              ref={(el) => {
                postLabels.current[i] = el;
              }}
              className={`absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold opacity-0 ${
                i === total - 1 ? "bg-white text-ink" : "bg-brand-400 text-ink"
              }`}
            >
              {i === total - 1 ? t("next.date") : copy[i]?.date}
            </span>
          ))}
        </div>

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-between px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pb-10">
          <div className="max-w-md">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-brand-300">{t("eyebrow")}</p>
            <h2 className="mt-2 font-display text-2xl font-bold leading-tight sm:text-4xl">{t("heading")}</h2>
            <p className="mt-2 hidden text-sm text-white/65 sm:block">{t("sub")}</p>
          </div>

          <div className="flex items-end justify-between gap-6">
            {/* Stop rail: jump to any stop. */}
            <ol className="hidden flex-col gap-2 lg:flex" aria-label={t("eyebrow")}>
              {Array.from({ length: total }, (_, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={i === active ? "step" : undefined}
                    className={`flex items-center gap-2 text-left text-xs font-semibold transition-colors ${
                      i === active ? "text-white" : "text-white/45 hover:text-white/80"
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ring-2 transition-all ${
                        i === active ? "scale-125 bg-brand-400 ring-brand-400/40" : "bg-white/20 ring-transparent"
                      }`}
                    />
                    {i === total - 1 ? t("next.title") : copy[i]?.date}
                  </button>
                </li>
              ))}
            </ol>

            <div className="relative ml-auto w-full max-w-md">
              {copy.slice(0, stops.length).map((c, i) => (
                <article
                  key={i}
                  aria-hidden={i !== active}
                  className={`flex flex-col gap-3 rounded-2xl bg-ink/80 p-5 ring-1 ring-white/12 backdrop-blur-md transition-all duration-500 sm:p-6 ${
                    i === active ? "visible relative translate-y-0 opacity-100" : "pointer-events-none invisible absolute inset-x-0 bottom-0 translate-y-4 opacity-0"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="rounded-full bg-brand-400 px-2.5 py-1 text-ink">{c.date}</span>
                    <span className="text-white/50">{t("stopLabel", { n: i + 1, total })}</span>
                  </div>
                  <div className="flex gap-4">
                    {stops[i].image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={stops[i].image} alt={c.place} loading="lazy" className="hidden h-24 w-20 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:block" />
                    )}
                    <div className="min-w-0">
                      <h3 className="font-display text-lg font-bold leading-snug sm:text-xl">{c.title}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-white/55">
                        <MapPin size={12} aria-hidden /> {c.place}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-white/75">{c.body}</p>
                    </div>
                  </div>
                  <p className="rounded-xl bg-brand-400/10 px-3 py-2 text-sm font-semibold text-brand-400 ring-1 ring-brand-400/30">{c.metric}</p>
                  {stops[i].href && (
                    <Link
                      href={stops[i].href!}
                      tabIndex={i === active ? 0 : -1}
                      onClick={() => trackEvent("journey_case", { stop: i })}
                      className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-brand-300 hover:text-white"
                    >
                      {"hash" in stops[i].href! ? t("legalLink") : t("caseLink")} <ArrowRight size={15} aria-hidden />
                    </Link>
                  )}
                </article>
              ))}

              <article
                aria-hidden={!isLast}
                className={`flex flex-col gap-4 rounded-2xl bg-white p-5 text-ink shadow-2xl shadow-brand-500/20 transition-all duration-500 sm:p-6 ${
                  isLast ? "visible relative translate-y-0 opacity-100" : "pointer-events-none invisible absolute inset-x-0 bottom-0 translate-y-4 opacity-0"
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                  <span className="rounded-full bg-ink px-2.5 py-1 text-white">{t("next.date")}</span>
                  <span className="text-ink-muted">{t("stopLabel", { n: total, total })}</span>
                </div>
                <h3 className="font-display text-2xl font-bold leading-tight">{t("next.title")}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{t("next.body")}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/booking"
                    tabIndex={isLast ? 0 : -1}
                    onClick={() => trackEvent("journey_cta", { to: "booking" })}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-sm font-bold text-white hover:bg-brand-600"
                  >
                    <CalendarCheck size={18} aria-hidden /> {t("next.book")}
                  </Link>
                  <a
                    href={COMPANY.zalo}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={isLast ? 0 : -1}
                    onClick={() => trackEvent("journey_cta", { to: "zalo" })}
                    className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-ink ring-1 ring-black/15 hover:bg-black/5"
                  >
                    <MessageCircle size={18} aria-hidden /> {t("next.zalo")}
                  </a>
                </div>
              </article>
            </div>
          </div>

          <p
            aria-hidden
            className={`pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1 text-xs text-white/45 transition-opacity lg:bottom-6 ${
              active === 0 ? "opacity-100" : "opacity-0"
            } max-lg:hidden`}
          >
            {t("scroll")} <ChevronDown size={14} className="animate-bounce" />
          </p>
        </div>
      </div>
    </section>
  );
}
