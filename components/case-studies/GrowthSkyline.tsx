"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDown, MessageCircle } from "lucide-react";
import { COMPANY } from "@/lib/company";
import { CASE_GROWTH } from "@/lib/caseGrowth";
import { trackEvent } from "@/lib/tracking/grid";

/** Case study "growth skyline": one glowing three.js column per month, built
 *  from the real monthly numbers in lib/caseGrowth.ts. Columns rise in turn
 *  when the card scrolls into view, then a light runs across their tops.
 *  Cases without a series render nothing. Copy: messages → growth. */

const GROW_S = 0.55; // seconds per column
/** "T1/2026" → "T1", "Jan 2026" → "Jan" (the years are in the subtitle). */
const shortMonth = (label: string) => label.split(/[/ ]/)[0];
const STAGGER_S = 0.32;

export function GrowthSkyline({ slug, client }: { slug: string; client: string }) {
  const t = useTranslations("growth");
  const locale = useLocale() as "vi" | "en";
  const series = CASE_GROWTH[slug];
  const [metric, setMetric] = useState(0);
  const [played, setPlayed] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const valueLabels = useRef<(HTMLSpanElement | null)[]>([]);
  const monthLabels = useRef<(HTMLSpanElement | null)[]>([]);
  const metricRef = useRef(0);
  const restart = useRef<() => void>(() => {});

  useEffect(() => {
    metricRef.current = metric;
    restart.current();
  }, [metric]);

  const s = series?.[metric];
  const pts = s?.points ?? [];
  const maxPoints = Math.max(0, ...(series ?? []).map((x) => x.points.length));

  useEffect(() => {
    const host = canvasHost.current;
    const card = cardRef.current;
    if (!host || !card || !series) return;
    let disposed = false;
    let cleanup = () => {};

    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const THREE = await import("three");
        if (disposed) return;
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setPlayed(true);
        trackEvent("growth_view", { slug });

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 60);
        const stage = new THREE.Group();
        scene.add(stage);

        // Floor: a soft dot grid.
        const floorPts: number[] = [];
        for (let x = -5; x <= 5; x += 0.25) for (let z = -1.6; z <= 1.6; z += 0.25) floorPts.push(x, 0, z);
        const floorGeo = new THREE.BufferGeometry();
        floorGeo.setAttribute("position", new THREE.Float32BufferAttribute(floorPts, 3));
        const floorMat = new THREE.PointsMaterial({ color: 0x5b7fc4, size: 0.035, transparent: true, opacity: 0.35 });
        stage.add(new THREE.Points(floorGeo, floorMat));

        // Columns: unit boxes scaled in Y; gradient blue base → gold top.
        const boxGeo = new THREE.BoxGeometry(1, 1, 1);
        boxGeo.translate(0, 0.5, 0);
        const colMat = new THREE.ShaderMaterial({
          transparent: true,
          uniforms: { uGlow: { value: 0 } },
          vertexShader: /* glsl */ `
            varying float vY; varying vec3 vN;
            void main() {
              vY = position.y; vN = normalMatrix * normal;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vY; varying vec3 vN;
            void main() {
              vec3 base = vec3(0.16, 0.27, 0.55);
              vec3 top = vec3(0.27, 0.82, 0.5); // growth = brand green
              vec3 c = mix(base, top, smoothstep(0.15, 1.0, vY));
              float rim = 0.55 + 0.45 * abs(normalize(vN).x);
              gl_FragColor = vec4(c * rim, 0.92);
            }`,
        });
        const cols: InstanceType<typeof THREE.Mesh>[] = [];
        for (let i = 0; i < maxPoints; i++) {
          const mesh = new THREE.Mesh(boxGeo, colMat);
          mesh.visible = false;
          stage.add(mesh);
          cols.push(mesh);
        }

        // Glows on column tops + a spark that runs across them.
        const G = maxPoints + 1;
        const gPos = new Float32Array(G * 3);
        const gA = new Float32Array(G);
        const gS = new Float32Array(G);
        const glowGeo = new THREE.BufferGeometry();
        glowGeo.setAttribute("position", new THREE.BufferAttribute(gPos, 3));
        glowGeo.setAttribute("aAlpha", new THREE.BufferAttribute(gA, 1));
        glowGeo.setAttribute("aSize", new THREE.BufferAttribute(gS, 1));
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
              gl_FragColor = vec4(vec3(0.43, 0.65, 0.97) * 1.2, pow(smoothstep(0.5, 0.0, d), 1.6) * vA);
            }`,
        });
        stage.add(new THREE.Points(glowGeo, glowMat));

        // Trend line across the tops (redrawn per metric).
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(maxPoints * 3), 3));
        const lineMat = new THREE.LineBasicMaterial({ color: 0x6ea6f7, transparent: true, opacity: 0 });
        stage.add(new THREE.Line(lineGeo, lineMat));

        const H = 2.4; // tallest column
        let layout: { x: number; h: number }[] = [];
        let span = 4; // world width the camera must fit
        let start = performance.now();
        const build = () => {
          const ser = series[metricRef.current];
          const n = ser.points.length;
          const max = Math.max(...ser.points.map((p) => p.value));
          const gap = Math.min(1.1, 6.4 / n);
          const w = gap * 0.56;
          layout = ser.points.map((p, i) => ({ x: (i - (n - 1) / 2) * gap, h: Math.max(0.03, (p.value / max) * H) }));
          span = (n - 1) * gap + w + 1.2;
          cols.forEach((c, i) => {
            c.visible = i < n;
            if (i < n) {
              c.position.set(layout[i].x, 0, 0);
              c.scale.set(w, 0.0001, w);
            }
          });
          const arr = lineGeo.attributes.position.array as Float32Array;
          layout.forEach((l, i) => arr.set([l.x, l.h + 0.02, 0], i * 3));
          lineGeo.attributes.position.needsUpdate = true;
          lineGeo.setDrawRange(0, n);
          lineGeo.computeBoundingSphere();
          lineMat.opacity = 0;
          start = performance.now();
          frameCamera();
        };
        restart.current = build;

        const frameCamera = () => {
          const w = host.clientWidth, h = host.clientHeight;
          camera.aspect = w / Math.max(h, 1);
          // Back off until the whole row of columns fits the frame width.
          const fitW = span / 2 / (Math.tan((camera.fov * Math.PI) / 360) * camera.aspect);
          camera.position.set(0, 2.0, Math.max(8.4, fitW + 1));
          camera.lookAt(0, 1.05, 0);
          camera.updateProjectionMatrix();
        };
        const resize = () => {
          renderer.setSize(host.clientWidth, host.clientHeight, false);
          frameCamera();
        };
        resize();
        build();
        const ro = new ResizeObserver(resize);
        ro.observe(host);
        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(card);

        const v = new THREE.Vector3();
        const place = (el: HTMLElement | null, x: number, y: number, alpha: number, below = false) => {
          if (!el) return;
          v.set(x, y, 0);
          stage.localToWorld(v);
          v.project(camera);
          const sx = (v.x * 0.5 + 0.5) * host.clientWidth;
          const sy = (-v.y * 0.5 + 0.5) * host.clientHeight;
          el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, ${below ? "8px" : "calc(-100% - 10px)"})`;
          el.style.opacity = String(alpha);
        };

        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const el = (now - start) / 1000;
          const n = layout.length;
          stage.rotation.y = reduce ? -0.18 : -0.18 + Math.sin(now / 4000) * 0.06;
          let allUp = true;
          for (let i = 0; i < maxPoints; i++) {
            if (i >= n) {
              gA[i] = 0;
              place(valueLabels.current[i], 0, 0, 0);
              place(monthLabels.current[i], 0, 0, 0, true);
              continue;
            }
            const p = reduce ? 1 : Math.min(1, Math.max(0, (el - i * STAGGER_S) / GROW_S));
            if (p < 1) allUp = false;
            const e = 1 - Math.pow(1 - p, 3);
            const hh = Math.max(0.0001, layout[i].h * e);
            cols[i].scale.y = hh;
            gPos.set([layout[i].x, hh + 0.02, 0], i * 3);
            gA[i] = p > 0 ? 0.35 + 0.65 * e : 0;
            gS[i] = i === n - 1 ? 46 : 26;
            place(valueLabels.current[i], layout[i].x, hh, p > 0.6 ? 1 : 0);
            place(monthLabels.current[i], layout[i].x, 0, 1, true);
          }
          // Trend line + spark once every column is up.
          lineMat.opacity += ((allUp ? 0.85 : 0) - lineMat.opacity) * 0.08;
          const k = G - 1;
          if (allUp && !reduce && n > 1) {
            const u = ((now / 1000) * 0.35) % 1;
            const f = u * (n - 1);
            const a = Math.floor(f), b = Math.min(n - 1, a + 1), r = f - a;
            gPos.set(
              [layout[a].x + (layout[b].x - layout[a].x) * r, layout[a].h + (layout[b].h - layout[a].h) * r + 0.02, 0],
              k * 3,
            );
            gA[k] = 1;
            gS[k] = 30;
          } else gA[k] = 0;
          glowGeo.attributes.position.needsUpdate = true;
          glowGeo.attributes.aAlpha.needsUpdate = true;
          glowGeo.attributes.aSize.needsUpdate = true;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          restart.current = () => {};
          [floorGeo, boxGeo, glowGeo, lineGeo].forEach((g) => g.dispose());
          [floorMat, colMat, glowMat, lineMat].forEach((mm) => mm.dispose());
          renderer.dispose();
          renderer.domElement.remove();
        };
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    io.observe(card);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
    // series is static per slug
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (!series || !s) return null;

  const fmt = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US");
  const first = pts[0].value;
  const last = pts[pts.length - 1].value;
  const ratio = last / Math.max(1, first);
  const headline =
    s.multiplier && ratio >= 2
      ? t("times", { n: fmt.format(Math.round(ratio)) })
      : t("fromTo", { from: fmt.format(first), to: fmt.format(last) });

  return (
    <div ref={cardRef} className="not-prose relative overflow-hidden rounded-3xl bg-ink p-5 text-white sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_80%,rgba(66,133,244,0.18),transparent_70%)]"
      />
      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-400">{t("eyebrow")}</p>
          <h2 className="font-serif text-2xl font-bold leading-tight sm:text-3xl">
            {s[locale]}: <span className="text-leaf-400">{headline}</span>
          </h2>
          <p className="text-sm text-white/60">
            {t("sub", { client, from: pts[0][locale], to: pts[pts.length - 1][locale] })}
          </p>
        </div>

        {series.length > 1 ? (
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("pick")}>
            {series.map((x, i) => (
              <button
                key={x.key}
                type="button"
                aria-pressed={i === metric}
                onClick={() => {
                  setMetric(i);
                  trackEvent("growth_metric", { slug, metric: x.key });
                }}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                  i === metric ? "border-brand-400 bg-brand-400 text-ink" : "border-white/20 text-white/70 hover:border-brand-400/60"
                }`}
              >
                {x[locale]}
              </button>
            ))}
          </div>
        ) : null}

        <div className="relative aspect-[4/3] w-full sm:aspect-[16/8]">
          <div ref={canvasHost} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {Array.from({ length: maxPoints }, (_, i) => (
              <span key={`v${i}`}>
                <span
                  ref={(el) => {
                    valueLabels.current[i] = el;
                  }}
                  className={`absolute left-0 top-0 whitespace-nowrap font-display font-bold tabular-nums opacity-0 transition-opacity ${
                    i === pts.length - 1 ? "text-base text-leaf-400 sm:text-xl" : "text-[11px] text-white/85 sm:text-sm"
                  }`}
                >
                  {pts[i] ? fmt.format(pts[i].value) : ""}
                </span>
                <span
                  ref={(el) => {
                    monthLabels.current[i] = el;
                  }}
                  className="absolute left-0 top-0 whitespace-nowrap text-[10px] text-white/50 opacity-0 sm:text-xs"
                >
                  {pts[i] ? (pts.length > 5 ? shortMonth(pts[i][locale]) : pts[i][locale]) : ""}
                </span>
              </span>
            ))}
          </div>
          {!played ? <div className="absolute inset-0 grid place-items-center text-xs text-white/40">{t("loading")}</div> : null}
        </div>

        {/* Same numbers as a plain list for screen readers and no-WebGL. */}
        <ol className="sr-only">
          {pts.map((p) => (
            <li key={p.vi}>
              {p[locale]}: {fmt.format(p.value)}
            </li>
          ))}
        </ol>

        <p className="text-xs text-white/50">
          {s.note ? `${s.note[locale]} ` : ""}
          {t("source")}
        </p>

        <div className="flex flex-col gap-3 rounded-2xl border border-brand-400/25 bg-brand-500/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">{t("ctaLead")}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="#ban-sao"
              onClick={() => trackEvent("growth_cta", { slug, channel: "twin" })}
              className="inline-flex items-center gap-1.5 rounded-full bg-brand-400 px-4 py-2.5 text-sm font-bold text-ink transition hover:bg-brand-500"
            >
              <ArrowDown className="h-4 w-4" aria-hidden /> {t("ctaTwin")}
            </a>
            <a
              href={COMPANY.zalo}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("growth_cta", { slug, channel: "zalo" })}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:border-white/60"
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
