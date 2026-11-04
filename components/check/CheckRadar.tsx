"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AXIS_KEYS, LEVELS } from "@/lib/shopCheck";

/** The 5-axis shop-health radar (three.js), shared by the landing page
 *  (components/check/ShopCheck.tsx) and the end of every Kiến thức article
 *  (components/check/RadarPrompt.tsx). A lifted pentagon plate morphs to the
 *  answers (-1 = unanswered, 0..3); `weakest` turns red, `focus` pulses one
 *  axis gold. Labels are HTML pinned to the axis tips each frame. */

const R = 1.55;
// First axis on top, so the bottom stays clear for overlays.
const ANGLE = (k: number) => Math.PI / 2 - (k * Math.PI * 2) / AXIS_KEYS.length;

export type RadarLabel = { text: string; tone: "idle" | "done" | "weak" | "focus" };

const TONE: Record<RadarLabel["tone"], string> = {
  idle: "bg-white/10 text-white/70 ring-1 ring-white/15",
  done: "bg-gold-400 text-ink",
  weak: "bg-[#ff6b59] text-white",
  focus: "bg-white text-ink shadow-lg",
};

export function CheckRadar({
  values,
  weakest = -1,
  focus = -1,
  labels,
  className = "",
  children,
}: {
  values: number[];
  weakest?: number;
  focus?: number;
  labels?: RadarLabel[];
  className?: string;
  children?: ReactNode;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const state = useRef({ values, weakest, focus });

  useEffect(() => {
    state.current = { values, weakest, focus };
  }, [values, weakest, focus]);

  useEffect(() => {
    const box = boxRef.current;
    const host = hostRef.current;
    if (!box || !host) return;
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

        const outline = (r: number, color: number, opacity: number) => {
          const pts: number[] = [];
          for (let k = 0; k < K; k++) pts.push(Math.cos(ANGLE(k)) * r, Math.sin(ANGLE(k)) * r, 0);
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
          radar.add(new THREE.LineLoop(geo, mat));
          return { geo, mat };
        };
        // Grid rings per level + gold target ring + spokes.
        const statics = [1, 2].map((l) => outline((R * l) / (LEVELS - 1), 0x7fa2ef, 0.14));
        statics.push(outline(R, 0xf0c069, 0.55));
        const spokePts: number[] = [];
        for (let k = 0; k < K; k++) spokePts.push(0, 0, 0, Math.cos(ANGLE(k)) * R, Math.sin(ANGLE(k)) * R, 0);
        const spokeGeo = new THREE.BufferGeometry();
        spokeGeo.setAttribute("position", new THREE.Float32BufferAttribute(spokePts, 3));
        const spokeMat = new THREE.LineBasicMaterial({ color: 0x7fa2ef, transparent: true, opacity: 0.18 });
        radar.add(new THREE.LineSegments(spokeGeo, spokeMat));

        // The live shape: a lifted plate (top + bottom outline, side edges, fill).
        const lift = 0.28;
        const shapeTop = new Float32Array(K * 3), shapeBot = new Float32Array(K * 3);
        const loop = (arr: Float32Array, color: number, opacity: number) => {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
          const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity });
          radar.add(new THREE.LineLoop(geo, mat));
          return { geo, mat };
        };
        const top = loop(shapeTop, 0x8fb6f9, 0.95);
        const bot = loop(shapeBot, 0x4285f4, 0.35);
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

        // Glow points: vertices + signals running around the outline + a focus spoke.
        const SIG = 60, FOCUS = 18;
        const n = K + SIG + FOCUS;
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
        vis.observe(box);

        const pointer = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        box.addEventListener("pointermove", onMove);

        const v = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = reduce ? 0 : now / 1000;
          const { values: vals, weakest: weak, focus: foc } = state.current;

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
          // Focus spoke: gold sparks climbing the asked axis.
          for (let i = 0; i < FOCUS; i++) {
            const j = K + SIG + i;
            if (foc < 0) {
              ga[j] = 0;
              continue;
            }
            const u = ((i / FOCUS) + (reduce ? 0 : time * 0.35)) % 1;
            gp.set([Math.cos(ANGLE(foc)) * R * u, Math.sin(ANGLE(foc)) * R * u, lift * 0.5], j * 3);
            gc.set([1, 0.8, 0.45], j * 3);
            gs[j] = 9;
            ga[j] = Math.sin(u * Math.PI) * 0.9;
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
          box.removeEventListener("pointermove", onMove);
          [...statics, top, bot].forEach(({ geo, mat }) => {
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
    io.observe(box);
    return () => {
      disposed = true;
      io.disconnect();
      cleanup();
    };
  }, []);

  return (
    <div ref={boxRef} className={`relative select-none ${className}`}>
      <div ref={hostRef} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
      {labels?.map((l, i) => (
        <span
          key={i}
          ref={(el) => {
            labelRefs.current[i] = el;
          }}
          className={`pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold opacity-0 ${TONE[l.tone]}`}
        >
          {l.text}
        </span>
      ))}
      {children}
    </div>
  );
}
