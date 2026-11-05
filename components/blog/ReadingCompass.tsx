"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, CheckCircle2, Clock, Loader2, MessageCircle, Send } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { trackEvent } from "@/lib/tracking/grid";

/** Knowledge-page hero: a three.js constellation where every star is a real
 *  article (clustered by category). The owner picks what is wearing them out,
 *  a gold reading path lights up through 3 stars, and the box underneath turns
 *  that path into a lead for the founder (/api/reading).
 *  Copy: messages → blog.compass (pains in the same order as PATHS). */

export type CompassPost = { slug: string; title: string; category?: string; minutes: number };

// Reading path per pain, in reading order (slugs of blogPost documents).
const PATHS = [
  ["he-thong-van-hanh-khi-chu-vang-mat", "chuan-hoa-van-hanh-co-so-dich-vu", "mo-chi-nhanh-thu-hai-khi-nao"],
  ["quang-cao-khong-ra-don-nguyen-nhan", "marketing-dung-du-deu-xuong-xe-spa-gym", "chuan-hoa-kenh-online-ap-car-care"],
  ["he-thong-marketing-cho-chu-co-so", "nhan-su-content-lam-gi", "chuan-hoa-van-hanh-co-so-dich-vu"],
  ["bay-tu-doanh-chu-co-so-dich-vu", "ap-luc-nguoi-lam-chu-doanh-nghiep", "he-thong-van-hanh-khi-chu-vang-mat"],
];

// Cluster centre per category (constellation layout, scene units).
const CLUSTERS: Record<string, [number, number]> = {
  "van-hanh": [-0.95, 0.35],
  "he-thong": [0.85, 0.7],
  "noi-dung": [0.95, -0.55],
  "khach-hang": [-0.2, -0.85],
  "thuong-hieu": [-0.1, 1.0],
};
const AUTO_MS = 6500;
const ZALO_URL = "https://zalo.me/0769918685";

/** Deterministic pseudo-random in [0,1) from a string. */
function hash(s: string, salt = 0) {
  let h = 2166136261 ^ salt;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

/** Star positions: posts of one category spread on a small ring round its centre. */
function layout(posts: CompassPost[]) {
  const byCat: Record<string, number> = {};
  const counts: Record<string, number> = {};
  posts.forEach((p) => (counts[p.category ?? "van-hanh"] = (counts[p.category ?? "van-hanh"] ?? 0) + 1));
  return posts.map((p) => {
    const cat = p.category && CLUSTERS[p.category] ? p.category : "van-hanh";
    const k = (byCat[cat] = (byCat[cat] ?? -1) + 1);
    const n = counts[cat] ?? 1;
    const [cx, cy] = CLUSTERS[cat];
    const a = (k / n) * Math.PI * 2 + hash(cat) * 6.28;
    const r = n === 1 ? 0 : 0.32 + hash(p.slug) * 0.16;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.85, (hash(p.slug, 7) - 0.5) * 0.5] as [number, number, number];
  });
}

export function ReadingCompass({ posts, heading, eyebrow }: { posts: CompassPost[]; heading: string; eyebrow: string }) {
  const t = useTranslations("blog.compass");
  const pains = t.raw("pains") as { label: string; note: string }[];
  const categories = useTranslations("blog").raw("categories") as Record<string, string>;

  const bySlug = new Map(posts.map((p, i) => [p.slug, i]));
  const paths = PATHS.map((path) => path.map((s) => bySlug.get(s)).filter((i): i is number => i !== undefined));

  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const [hover, setHover] = useState<number | null>(null);
  const activeRef = useRef(0);
  // posts come from the server, so the paths are fixed for this page.
  const pathsRef = useRef(paths);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % PATHS.length), AUTO_MS);
    return () => window.clearInterval(id);
  }, [pinned]);

  const pick = (i: number) => {
    setPinned(true);
    setActive(i);
    trackEvent("compass_pick", { pain: i });
  };

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const starBtns = useRef<(HTMLAnchorElement | null)[]>([]);
  const clusterLabels = useRef<(HTMLSpanElement | null)[]>([]);
  const usedCats = [...new Set(posts.map((p) => (p.category && CLUSTERS[p.category] ? p.category : "van-hanh")))];

  useEffect(() => {
    const host = canvasHost.current;
    const section = sectionRef.current;
    if (!host || !section || posts.length === 0) return;
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
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
        camera.position.set(0, 0, 4.4);
        const sky = new THREE.Group();
        scene.add(sky);
        const ratio = renderer.getPixelRatio();

        // ── Background dust: faint twinkling points far behind the stars.
        const DUST = 700;
        const dust = new Float32Array(DUST * 3);
        const dustSeed = new Float32Array(DUST);
        for (let i = 0; i < DUST; i++) {
          dust.set([(hash("d" + i) - 0.5) * 7, (hash("d" + i, 3) - 0.5) * 5, -1.2 - hash("d" + i, 5) * 2], i * 3);
          dustSeed[i] = hash("d" + i, 9) * 6.28;
        }
        const dustGeo = new THREE.BufferGeometry();
        dustGeo.setAttribute("position", new THREE.BufferAttribute(dust, 3));
        dustGeo.setAttribute("aSeed", new THREE.BufferAttribute(dustSeed, 1));
        const dustMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uTime: { value: 0 }, uScale: { value: ratio } },
          vertexShader: /* glsl */ `
            attribute float aSeed; uniform float uTime; uniform float uScale; varying float vA;
            void main() {
              vA = 0.25 + 0.25 * sin(uTime * 1.3 + aSeed * 3.0);
              gl_PointSize = 2.0 * uScale;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vA;
            void main() {
              if (length(gl_PointCoord - 0.5) > 0.5) discard;
              gl_FragColor = vec4(0.62, 0.72, 0.95, vA);
            }`,
        });
        sky.add(new THREE.Points(dustGeo, dustMat));

        // ── Article stars + constellation lines inside each category.
        const pos = layout(posts);
        const N = posts.length;
        const starPos = new Float32Array(N * 3);
        const starA = new Float32Array(N).fill(0.7);
        const starS = new Float32Array(N).fill(20);
        const starGold = new Float32Array(N);
        pos.forEach((p, i) => starPos.set(p, i * 3));
        const starGeo = new THREE.BufferGeometry();
        starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
        starGeo.setAttribute("aAlpha", new THREE.BufferAttribute(starA, 1));
        starGeo.setAttribute("aSize", new THREE.BufferAttribute(starS, 1));
        starGeo.setAttribute("aGold", new THREE.BufferAttribute(starGold, 1));
        const starMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uScale: { value: ratio } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aSize; attribute float aGold;
            uniform float uScale; varying float vA; varying float vG;
            void main() {
              vA = aAlpha; vG = aGold;
              gl_PointSize = aSize * uScale;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying float vG;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float core = smoothstep(0.12, 0.0, d);
              float halo = pow(smoothstep(0.5, 0.0, d), 2.2);
              vec3 c = mix(vec3(0.43, 0.65, 0.97), vec3(0.43, 0.65, 0.97), vG);
              gl_FragColor = vec4(c * (0.8 + core), (halo * 0.8 + core) * vA);
            }`,
        });
        sky.add(new THREE.Points(starGeo, starMat));

        const links: number[] = [];
        for (let i = 0; i < N; i++)
          for (let j = i + 1; j < N; j++)
            if ((posts[i].category ?? "") === (posts[j].category ?? "")) links.push(...pos[i], ...pos[j]);
        const linkGeo = new THREE.BufferGeometry();
        linkGeo.setAttribute("position", new THREE.Float32BufferAttribute(links, 3));
        const linkMat = new THREE.LineBasicMaterial({ color: 0x6ea6f7, transparent: true, opacity: 0.16 });
        sky.add(new THREE.LineSegments(linkGeo, linkMat));

        // ── Reading path: a gold curve drawn star to star, with a comet on it.
        const SEG = 120;
        const pathGeo = new THREE.BufferGeometry();
        const pathArr = new Float32Array((SEG + 1) * 3);
        pathGeo.setAttribute("position", new THREE.BufferAttribute(pathArr, 3));
        const pathMat = new THREE.LineBasicMaterial({ color: 0x6ea6f7, transparent: true, opacity: 0.95 });
        const pathLine = new THREE.Line(pathGeo, pathMat);
        sky.add(pathLine);
        let curve: InstanceType<typeof THREE.CatmullRomCurve3> | null = null;
        let shownPath = -1;
        let drawStart = 0;

        const COMET = 14;
        const comet = new Float32Array(COMET * 3);
        const cometA = new Float32Array(COMET);
        const cometS = new Float32Array(COMET);
        const cometGold = new Float32Array(COMET).fill(1);
        for (let k = 0; k < COMET; k++) cometS[k] = 18 - k;
        const cometGeo = new THREE.BufferGeometry();
        cometGeo.setAttribute("position", new THREE.BufferAttribute(comet, 3));
        cometGeo.setAttribute("aAlpha", new THREE.BufferAttribute(cometA, 1));
        cometGeo.setAttribute("aSize", new THREE.BufferAttribute(cometS, 1));
        cometGeo.setAttribute("aGold", new THREE.BufferAttribute(cometGold, 1));
        sky.add(new THREE.Points(cometGeo, starMat));

        const setPath = (k: number, now: number) => {
          shownPath = k;
          drawStart = now;
          const idx = pathsRef.current[k] ?? [];
          if (idx.length < 2) {
            curve = null;
            pathGeo.setDrawRange(0, 0);
            return;
          }
          curve = new THREE.CatmullRomCurve3(idx.map((i) => new THREE.Vector3(...pos[i])), false, "centripetal");
          const v = new THREE.Vector3();
          for (let s = 0; s <= SEG; s++) {
            curve.getPoint(s / SEG, v);
            pathArr.set([v.x, v.y, v.z], s * 3);
          }
          pathGeo.attributes.position.needsUpdate = true;
        };

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          // Keep the whole constellation in frame on narrow screens.
          camera.position.z = camera.aspect < 1 ? 4.4 / Math.max(camera.aspect, 0.6) : 4.4;
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
        host.parentElement?.addEventListener("pointermove", onMove);

        const v = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          if (activeRef.current !== shownPath) setPath(activeRef.current, now);
          const onPath = pathsRef.current[shownPath] ?? [];

          dustMat.uniforms.uTime.value = time;
          if (!reduce) {
            sky.rotation.y += (pointer.x * 0.22 + Math.sin(time * 0.2) * 0.08 - sky.rotation.y) * 0.04;
            sky.rotation.x += (pointer.y * 0.14 - sky.rotation.x) * 0.04;
          }

          for (let i = 0; i < N; i++) {
            const step = onPath.indexOf(i);
            const lit = step >= 0;
            const twinkle = reduce ? 0 : Math.sin(time * 2 + i) * 2;
            starA[i] += ((lit ? 1 : 0.55) - starA[i]) * 0.08;
            starS[i] += ((lit ? 44 : 22) + twinkle - starS[i]) * 0.08;
            starGold[i] += ((lit ? 1 : 0) - starGold[i]) * 0.08;
            const el = starBtns.current[i];
            if (el) {
              v.set(...pos[i]);
              sky.localToWorld(v);
              v.project(camera);
              el.style.transform = `translate(${(v.x * 0.5 + 0.5) * host.clientWidth}px, ${(-v.y * 0.5 + 0.5) * host.clientHeight}px) translate(-50%, -50%)`;
            }
          }
          usedCats.forEach((cat, k) => {
            const el = clusterLabels.current[k];
            if (!el) return;
            const [cx, cy] = CLUSTERS[cat];
            v.set(cx, cy - 0.55, 0);
            sky.localToWorld(v);
            v.project(camera);
            el.style.transform = `translate(${(v.x * 0.5 + 0.5) * host.clientWidth}px, ${(-v.y * 0.5 + 0.5) * host.clientHeight}px) translate(-50%, -50%)`;
          });
          starGeo.attributes.aAlpha.needsUpdate = true;
          starGeo.attributes.aSize.needsUpdate = true;
          starGeo.attributes.aGold.needsUpdate = true;

          // Draw the path in over ~1.4s, then run the comet along it.
          const grow = reduce ? 1 : Math.min(1, (now - drawStart) / 1400);
          pathGeo.setDrawRange(0, curve ? Math.ceil(grow * SEG) + 1 : 0);
          for (let k = 0; k < COMET; k++) {
            if (!curve || reduce) {
              cometA[k] = 0;
              continue;
            }
            const u = grow < 1 ? grow - k * 0.006 : (time * 0.18 - k * 0.006) % 1;
            curve.getPoint(Math.min(1, Math.max(0, u < 0 ? u + 1 : u)), v);
            comet.set([v.x, v.y, v.z], k * 3);
            cometA[k] = (1 - k / COMET) * 0.9;
          }
          cometGeo.attributes.position.needsUpdate = true;
          cometGeo.attributes.aAlpha.needsUpdate = true;

          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.parentElement?.removeEventListener("pointermove", onMove);
          [dustGeo, starGeo, linkGeo, pathGeo, cometGeo].forEach((g) => g.dispose());
          [dustMat, starMat, linkMat, pathMat].forEach((m) => m.dispose());
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
    // posts come from the server and do not change on the client
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const path = paths[active] ?? [];
  const totalMin = path.reduce((s, i) => s + posts[i].minutes, 0);

  // ── Lead form.
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, pain: pains[active]?.label ?? "", posts: path.map((i) => posts[i].title) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setState("done");
      trackEvent("compass_lead", { pain: active });
    } catch {
      setState("error");
    }
  };

  return (
    <section ref={sectionRef} id="la-ban" className="relative overflow-hidden bg-ink pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(40%_50%_at_70%_40%,rgba(110,166,247,0.10),transparent_70%),radial-gradient(45%_55%_at_25%_60%,rgba(66,133,244,0.14),transparent_70%)]"
      />
      <Container className="relative grid gap-10 lg:grid-cols-[1fr_1.15fr] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">{eyebrow}</p>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-[42px]">{heading}</h1>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 font-display text-lg font-semibold text-white sm:text-xl">{t("question")}</legend>
            {pains.map((p, i) => (
              <button
                key={p.label}
                type="button"
                aria-pressed={i === active}
                onClick={() => pick(i)}
                className={`flex items-start gap-3 rounded-2xl border p-4 text-left transition-all ${
                  i === active ? "border-brand-400/70 bg-brand-500/[0.1]" : "border-white/10 bg-white/[0.03] hover:border-white/30"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-1 h-3 w-3 shrink-0 rounded-full ring-4 transition-colors ${
                    i === active ? "bg-brand-400 ring-brand-400/25" : "bg-white/25 ring-transparent"
                  }`}
                />
                <span className="flex flex-col gap-0.5">
                  <span className="font-semibold">{p.label}</span>
                  <span className="text-sm text-white/60">{p.note}</span>
                </span>
              </button>
            ))}
          </fieldset>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[680px] lg:aspect-square">
          <div ref={canvasHost} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
          <div className="pointer-events-none absolute inset-0">
            {usedCats.map((cat, k) => (
              <span
                key={cat}
                ref={(el) => {
                  clusterLabels.current[k] = el;
                }}
                className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35 sm:text-[11px]"
              >
                {categories[cat]}
              </span>
            ))}
            {posts.map((p, i) => {
              const step = path.indexOf(i);
              return (
                <Link
                  key={p.slug}
                  ref={(el) => {
                    starBtns.current[i] = el;
                  }}
                  href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover((h) => (h === i ? null : h))}
                  onFocus={() => setHover(i)}
                  onBlur={() => setHover(null)}
                  onClick={() => trackEvent("compass_read", { slug: p.slug, from: "star" })}
                  aria-label={p.title}
                  className="pointer-events-auto absolute left-0 top-0 flex h-9 w-9 items-center justify-center rounded-full"
                >
                  {step >= 0 ? (
                    <span className="flex h-5 w-5 -translate-y-5 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-ink shadow-lg shadow-brand-500/30">
                      {step + 1}
                    </span>
                  ) : null}
                  {hover === i ? (
                    <span className="absolute left-1/2 top-full w-56 -translate-x-1/2 rounded-xl border border-white/15 bg-ink/90 px-3 py-2 text-center text-xs font-medium leading-snug text-white backdrop-blur">
                      {p.title}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
          <p className="absolute left-0 right-0 top-0 text-center text-xs text-white/40">{t("hint")}</p>
        </div>
      </Container>

      <Container className="relative mt-10 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-xl font-semibold sm:text-2xl">{t("pathTitle")}</h2>
            <p className="flex items-center gap-1.5 text-sm text-brand-400">
              <Clock size={14} aria-hidden /> {t("pathMeta", { n: path.length, m: totalMin })}
            </p>
          </div>
          <ol className="grid gap-3 sm:grid-cols-3" aria-live="polite">
            {path.map((i, k) => (
              <li key={`${active}-${posts[i].slug}`}>
                <Link
                  href={{ pathname: "/blog/[slug]", params: { slug: posts[i].slug } }}
                  onClick={() => trackEvent("compass_read", { slug: posts[i].slug, from: "path" })}
                  className="group flex h-full flex-col gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4 transition-colors hover:border-brand-400/60"
                >
                  <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-white/50">
                    <span className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-ink">{k + 1}</span>
                      {posts[i].category ? categories[posts[i].category!] : null}
                    </span>
                    <ArrowUpRight size={16} aria-hidden className="text-white/40 transition-colors group-hover:text-brand-400" />
                  </span>
                  <span className="text-sm font-semibold leading-snug text-white">{posts[i].title}</span>
                  <span className="mt-auto text-xs text-white/50">{t("minutes", { n: posts[i].minutes })}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-brand-400/30 bg-brand-500/[0.07] p-5">
          <p className="font-display text-lg font-semibold">{t("leadHeading")}</p>
          {state === "done" ? (
            <p className="flex items-start gap-2 text-sm text-white/80" role="status">
              <CheckCircle2 size={18} aria-hidden className="mt-0.5 shrink-0 text-leaf-400" /> {t("leadDone")}
            </p>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3">
              <p className="text-sm text-white/70">{t("leadBody", { pain: pains[active]?.label ?? "" })}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("leadName")}
                  aria-label={t("leadName")}
                  autoComplete="name"
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
                />
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("leadPhone")}
                  aria-label={t("leadPhone")}
                  inputMode="tel"
                  autoComplete="tel"
                  pattern="[0-9+\s.\-()]{8,30}"
                  className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-brand-400 focus:outline-none"
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={state === "sending"}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-2.5 text-sm font-bold text-ink transition hover:bg-brand-500 disabled:opacity-60"
                >
                  {state === "sending" ? <Loader2 size={16} className="animate-spin" aria-hidden /> : <Send size={16} aria-hidden />}
                  {t("leadSubmit")}
                </button>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("compass_cta", { channel: "zalo" })}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/80 hover:text-white"
                >
                  <MessageCircle size={16} aria-hidden /> {t("leadZalo")}
                </a>
              </div>
              {state === "error" ? <p className="text-sm text-red-300">{t("leadError")}</p> : null}
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
