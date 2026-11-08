"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { trackEvent } from "@/lib/tracking/grid";

/** "Where we work" — a three.js dot map of Vietnam with a glowing pin for each
 *  real client location (from the case studies), light arcs from the HCMC hub,
 *  and a list that stays in sync with the pins. Copy: messages → caseMap.places
 *  (same order as PLACES). */

// Mainland dots: Natural Earth 1:50m Vietnam rasterised on a 0.13° grid (run-length
// "start,end" pairs of column indices per row, rows from LAT0 northwards).
const LON0 = 102, LAT0 = 8.3, STEP = 0.13;
const DOT_ROWS =
  ";;;22,24;22,25;22,26;22,26;22,28;22,31;22,32;22,31,34,34;23,35;23,34;24,35;23,36;15,15,20,35;15,15,19,36;20,38,40,42;23,44;24,46;24,24,26,29,32,46;33,49;31,50;30,52;30,53;30,54;31,55;34,55;34,55;38,55;40,55;43,55;43,56;43,55;43,57;43,57;43,56;43,56;43,56;43,56;44,55;43,55;43,55;42,56;42,55;42,55;42,55;42,54;43,54;43,54;43,54;43,53;43,53;44,53;44,52;43,51;41,50;41,49;40,49;42,48;41,48;40,46;38,44;36,36,38,44;36,42;35,41;35,40;35,39;34,38;33,37;31,36;31,35;29,34;29,34;28,34;28,33;27,32;25,31;24,30;24,29;24,29;21,28;20,27;18,28;16,28;15,29;16,29;16,29;21,29;22,30;23,32;23,33;21,34;20,35;19,35;20,35;12,13,19,36;9,15,17,37,42,42;8,40;7,42;7,41;7,44;8,45;8,40;5,38;4,37;4,35;3,35;2,35;2,34;3,6,9,14,16,35;4,4,10,10,16,17,19,36;22,32,34,35;22,28;22,27;24,26;;";
// Hoàng Sa and Trường Sa archipelagos (approximate island positions, lon/lat).
const HOANG_SA: [number, number][] = [
  [112.33, 16.83], [111.6, 16.53], [111.2, 15.78], [112.73, 16.67], [111.5, 17.1],
  [111.71, 16.45], [111.59, 16.46], [112.27, 16.98], [111.77, 16.05],
];
const TRUONG_SA: [number, number][] = [
  [111.92, 8.65], [114.33, 11.43], [114.36, 10.18], [114.33, 9.88], [114.48, 10.38],
  [112.25, 8.85], [114.28, 11.05], [112.92, 7.89], [113.7, 8.97], [111.67, 8.67],
  [114.37, 10.38], [112.6, 8.83], [113.3, 8.2], [114.0, 11.2], [113.0, 9.6],
];

// Real client locations; index 0 is the hub every arc starts from.
const PLACES = [
  { lon: 106.7, lat: 10.78, slug: "ap-car-care", side: "left" },
  { lon: 106.65, lat: 10.98, slug: "khang-vu-auto-care", side: "right" },
  { lon: 105.08, lat: 10.01, slug: "apex-autocare", side: "left" },
  { lon: 106.07, lat: 21.18, slug: "hoc-vien-detailing-viet-nam", side: "left" },
  { lon: 108.21, lat: 16.05, slug: "johnny-loc-nguyen-he-sinh-thai-ap", side: "left", planned: true },
] as const;

const S = 0.22;
const K = Math.cos((16 * Math.PI) / 180);
const proj = (lon: number, lat: number): [number, number] => [(lon - 108.3) * K * S, (lat - 15.95) * S];
const AUTO_MS = 4500;
const ZALO_URL = "https://zalo.me/0769918685";

export function CaseMap() {
  const t = useTranslations("caseMap");
  const places = t.raw("places") as { city: string; client: string; metric: string }[];

  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);
  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (pinned) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % PLACES.length), AUTO_MS);
    return () => window.clearInterval(id);
  }, [pinned]);

  const focus = (i: number) => {
    setPinned(true);
    setActive(i);
  };
  const pick = (i: number) => {
    focus(i);
    trackEvent("casemap_pick", { place: PLACES[i].slug });
  };

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const pinLabels = useRef<(HTMLButtonElement | null)[]>([]);
  const isleLabels = useRef<(HTMLSpanElement | null)[]>([]);

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
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
        camera.position.set(0, -3.3, 5.1);
        camera.lookAt(0, 0.05, 0);
        const map = new THREE.Group();
        scene.add(map);

        const [hx, hy] = proj(PLACES[0].lon, PLACES[0].lat);

        // ── Dots: mainland + archipelagos; a ripple runs outward from the hub.
        const pts: number[] = [];
        const dist: number[] = [];
        const isle: number[] = [];
        const push = (lon: number, lat: number, island: number) => {
          const [x, y] = proj(lon, lat);
          pts.push(x, y, 0);
          dist.push(Math.hypot(x - hx, y - hy));
          isle.push(island);
        };
        DOT_ROWS.split(";").forEach((row, iy) => {
          if (!row) return;
          const runs = row.split(",").map(Number);
          for (let r = 0; r < runs.length; r += 2)
            for (let ix = runs[r]; ix <= runs[r + 1]; ix++) push(LON0 + ix * STEP, LAT0 + iy * STEP, 0);
        });
        [...HOANG_SA, ...TRUONG_SA].forEach(([lon, lat]) => push(lon, lat, 1));
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        dotGeo.setAttribute("aDist", new THREE.Float32BufferAttribute(dist, 1));
        dotGeo.setAttribute("aIsle", new THREE.Float32BufferAttribute(isle, 1));
        const dotMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          uniforms: { uTime: { value: 0 }, uSize: { value: 2.6 * renderer.getPixelRatio() } },
          vertexShader: /* glsl */ `
            attribute float aDist; attribute float aIsle;
            uniform float uTime; uniform float uSize;
            varying float vGlow; varying float vIsle;
            void main() {
              float w = fract(uTime * 0.16 - aDist * 0.32);
              vGlow = smoothstep(0.0, 0.06, w) * smoothstep(0.22, 0.06, w);
              vIsle = aIsle;
              gl_PointSize = uSize * (1.0 + aIsle * 0.6 + vGlow * 0.6);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vGlow; varying float vIsle;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              if (d > 0.5) discard;
              vec3 base = mix(vec3(0.43, 0.65, 0.97), vec3(0.43, 0.65, 0.97), vIsle * 0.7);
              vec3 c = mix(base, vec3(0.43, 0.65, 0.97), vGlow);
              gl_FragColor = vec4(c, 0.42 + vGlow * 0.5 + vIsle * 0.3);
            }`,
        });
        map.add(new THREE.Points(dotGeo, dotMat));

        // ── Pins: beam, glowing head, pulsing ring; arcs from the hub.
        const gold = 0x6ea6f7;
        const heads = new Float32Array(PLACES.length * 3);
        const headA = new Float32Array(PLACES.length);
        const headS = new Float32Array(PLACES.length);
        const pinXY = PLACES.map((p) => proj(p.lon, p.lat));
        const beams: InstanceType<typeof THREE.Line>[] = [];
        const rings: InstanceType<typeof THREE.Mesh>[] = [];
        const arcs: { line: InstanceType<typeof THREE.Line>; curve: InstanceType<typeof THREE.QuadraticBezierCurve3> }[] = [];
        const ringGeo = new THREE.RingGeometry(0.03, 0.04, 40);
        PLACES.forEach((p, i) => {
          const [x, y] = pinXY[i];
          heads.set([x, y, 0.32], i * 3);
          const beam = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(x, y, 0), new THREE.Vector3(x, y, 0.32)]),
            new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.6 }),
          );
          map.add(beam);
          beams.push(beam);
          const ring = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
          );
          ring.position.set(x, y, 0.002);
          map.add(ring);
          rings.push(ring);
          if (i === 0) return;
          const d = Math.hypot(x - hx, y - hy);
          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(hx, hy, 0),
            new THREE.Vector3((hx + x) / 2, (hy + y) / 2, Math.max(0.12, d * 0.45)),
            new THREE.Vector3(x, y, 0),
          );
          const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(64));
          const mat = "planned" in p
            ? new THREE.LineDashedMaterial({ color: gold, dashSize: 0.04, gapSize: 0.035, transparent: true, opacity: 0.3 })
            : new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.3 });
          const line = new THREE.Line(geo, mat);
          line.computeLineDistances();
          map.add(line);
          arcs.push({ line, curve });
        });
        const headGeo = new THREE.BufferGeometry();
        headGeo.setAttribute("position", new THREE.BufferAttribute(heads, 3));
        headGeo.setAttribute("aAlpha", new THREE.BufferAttribute(headA, 1));
        headGeo.setAttribute("aSize", new THREE.BufferAttribute(headS, 1));
        const glowMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uScale: { value: renderer.getPixelRatio() } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aSize; uniform float uScale; varying float vA;
            void main() {
              vA = aAlpha;
              gl_PointSize = aSize * uScale;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vA;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float g = smoothstep(0.5, 0.0, d);
              gl_FragColor = vec4(vec3(0.43, 0.65, 0.97) * 1.2, pow(g, 1.7) * vA);
            }`,
        });
        map.add(new THREE.Points(headGeo, glowMat));

        // Sparks travelling along each arc.
        const PER = 5;
        const sparks = new Float32Array(arcs.length * PER * 3);
        const sparkA = new Float32Array(arcs.length * PER);
        const sparkS = new Float32Array(arcs.length * PER).fill(9);
        const sparkGeo = new THREE.BufferGeometry();
        sparkGeo.setAttribute("position", new THREE.BufferAttribute(sparks, 3));
        sparkGeo.setAttribute("aAlpha", new THREE.BufferAttribute(sparkA, 1));
        sparkGeo.setAttribute("aSize", new THREE.BufferAttribute(sparkS, 1));
        map.add(new THREE.Points(sparkGeo, glowMat));

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        const v = new THREE.Vector3();
        // Archipelago labels sit just south of each island group.
        const isleAnchors = [proj(112.0, 15.35), proj(113.4, 7.4)];
        const place = (el: HTMLElement | null, x: number, y: number, z: number, side: string) => {
          if (!el) return;
          v.set(x, y, z);
          map.localToWorld(v);
          v.project(camera);
          const sx = (v.x * 0.5 + 0.5) * host.clientWidth;
          const sy = (-v.y * 0.5 + 0.5) * host.clientHeight;
          const shift = side === "left" ? "translate(-100%, -50%) translateX(-10px)" : side === "right" ? "translate(10px, -50%)" : "translate(-50%, -50%)";
          el.style.transform = `translate(${sx}px, ${sy}px) ${shift}`;
        };

        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          const act = activeRef.current;
          dotMat.uniforms.uTime.value = reduce ? 2.5 : time;
          if (!reduce) map.rotation.z = Math.sin(time * 0.15) * 0.06;

          PLACES.forEach((p, i) => {
            const on = i === act;
            headA[i] += ((on ? 1 : 0.7) - headA[i]) * 0.1;
            headS[i] += ((on ? 38 : 22) - headS[i]) * 0.1;
            const f = (time * 0.55 + i * 0.21) % 1;
            rings[i].scale.setScalar(1 + f * (on ? 5 : 3));
            (rings[i].material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (1 - f) * (on ? 0.85 : 0.4);
            (beams[i].material as InstanceType<typeof THREE.LineBasicMaterial>).opacity = on ? 1 : 0.55;
            place(pinLabels.current[i], pinXY[i][0], pinXY[i][1], 0.32, p.side);
          });
          headGeo.attributes.aAlpha.needsUpdate = true;
          headGeo.attributes.aSize.needsUpdate = true;

          arcs.forEach(({ line, curve }, a) => {
            const on = a + 1 === act;
            const m = line.material as InstanceType<typeof THREE.LineBasicMaterial>;
            m.opacity += ((on ? 0.95 : 0.28) - m.opacity) * 0.1;
            for (let k = 0; k < PER; k++) {
              const idx = a * PER + k;
              curve.getPoint((time * 0.22 + k / PER) % 1, v);
              sparks.set([v.x, v.y, v.z], idx * 3);
              sparkA[idx] = reduce ? 0 : on ? 1 : 0.45;
            }
          });
          sparkGeo.attributes.position.needsUpdate = true;
          sparkGeo.attributes.aAlpha.needsUpdate = true;

          isleAnchors.forEach(([x, y], k) => place(isleLabels.current[k], x, y, 0, "center"));
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          [dotGeo, headGeo, sparkGeo, ringGeo].forEach((g) => g.dispose());
          [...beams, ...arcs.map((x) => x.line)].forEach((l) => {
            l.geometry.dispose();
            (l.material as InstanceType<typeof THREE.Material>).dispose();
          });
          rings.forEach((r) => (r.material as InstanceType<typeof THREE.Material>).dispose());
          dotMat.dispose();
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

  return (
    <section ref={sectionRef} id="ban-do" className="relative overflow-hidden bg-ink pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_50%_at_30%_55%,rgba(66,133,244,0.16),transparent_70%)]"
      />
      <Container className="relative grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">{t("eyebrow")}</p>
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-[42px]">{t("heading")}</h1>
          <p className="max-w-xl text-white/70 sm:text-lg">{t("sub")}</p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[640px] lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div ref={canvasHost} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
          <div className="pointer-events-none absolute inset-0">
            {places.map((p, i) => (
              <button
                key={PLACES[i].slug}
                type="button"
                ref={(el) => {
                  pinLabels.current[i] = el;
                }}
                onClick={() => pick(i)}
                className={`pointer-events-auto absolute left-0 top-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold backdrop-blur transition-colors sm:text-xs ${
                  i === active
                    ? "border-brand-400 bg-brand-400 text-ink"
                    : "border-white/15 bg-ink/70 text-white/80 hover:border-brand-400/60"
                }`}
              >
                {p.city}
              </button>
            ))}
            {[t("hoangSa"), t("truongSa")].map((name, k) => (
              <span
                key={name}
                ref={(el) => {
                  isleLabels.current[k] = el;
                }}
                className="absolute left-0 top-0 whitespace-nowrap text-[10px] font-medium text-brand-400/70 sm:text-[11px]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:col-start-2">
          <ol className="flex flex-col gap-2" role="list">
            {places.map((p, i) => (
              <li key={PLACES[i].slug}>
                <div
                  onMouseEnter={() => focus(i)}
                  onFocus={() => focus(i)}
                  className={`flex items-start gap-3 rounded-2xl border p-3.5 transition-all ${
                    i === active ? "border-brand-400/60 bg-brand-500/[0.08]" : "border-white/10 bg-white/[0.02]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      i === active ? "bg-brand-400 text-ink" : "bg-white/10 text-white/70"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="text-sm font-semibold text-white">
                      {p.city}
                      <span className="font-normal text-white/50"> · {p.client}</span>
                      {"planned" in PLACES[i] ? (
                        <span className="ml-2 rounded-full border border-brand-400/40 px-2 py-0.5 text-[10px] font-semibold uppercase text-brand-400">
                          {t("planned")}
                        </span>
                      ) : null}
                    </p>
                    <p className={`text-sm ${i === active ? "text-brand-400" : "text-white/60"}`}>{p.metric}</p>
                  </div>
                  <Link
                    href={{ pathname: "/case-studies/[slug]", params: { slug: PLACES[i].slug } }}
                    onClick={() => trackEvent("casemap_read", { place: PLACES[i].slug })}
                    aria-label={`${t("read")}: ${p.client}`}
                    className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-brand-400 hover:text-brand-400"
                  >
                    <ArrowUpRight size={16} aria-hidden />
                  </Link>
                </div>
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 rounded-2xl border border-brand-400/25 bg-brand-500/[0.06] p-5">
            <p className="font-display text-lg font-semibold">{t("ctaHeading")}</p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/booking"
                onClick={() => trackEvent("casemap_cta", { channel: "booking" })}
                className="inline-flex items-center rounded-full bg-brand-400 px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
              >
                {t("ctaBook")}
              </Link>
              <a
                href={ZALO_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("casemap_cta", { channel: "zalo" })}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
