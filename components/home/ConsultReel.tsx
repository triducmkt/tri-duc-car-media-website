"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trackEvent } from "@/lib/tracking/grid";

/** "A working session with Trí Đức" — a cinematic reel (built from the brand's
 *  AI-generated scene library, see public/video/) of the consultant on site at
 *  a Vietnamese car-care shop, overlaid with a three.js data stream that flows
 *  through the 5 steps in sync with the footage: scattered dust (the owner's
 *  scattered work) is pulled into one ordered line as the session progresses.
 *  Copy lives in messages → reel.steps (5 items, same order as the shots). */

// Reel timing: 5 shots × 4.8 s with 0.8 s dissolves → shot k starts at 4k s.
const SHOT_S = 4;
const STEPS = 5;
// Node k sits at x = NODE_X[k] (% of width) — shared by the canvas and the labels.
const NODE_X = [8, 29, 50, 71, 92];
const NODE_Y = [0.1, -0.05, 0.2, 0.05, 0.42]; // gentle rising trend line
const COUNT = 900;
const ZALO_URL = "https://zalo.me/0769918685";

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  };
}

export function ConsultReel() {
  const t = useTranslations("reel");
  const steps = t.raw("steps") as { title: string; text: string }[];

  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [videoOn, setVideoOn] = useState(false);

  // Lazy-load + play the reel only while it is on screen.
  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const io = new IntersectionObserver(
      (entries) => {
        const on = entries.some((e) => e.isIntersecting);
        if (on) {
          setVideoOn(true);
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(section);
    return () => io.disconnect();
  }, []);

  // Caption follows the footage.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTime = () => setStep(Math.min(STEPS - 1, Math.floor(video.currentTime / SHOT_S)));
    video.addEventListener("timeupdate", onTime);
    return () => video.removeEventListener("timeupdate", onTime);
  }, []);

  // three.js data-stream overlay.
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
        // Orthographic: x spans [-aspect, aspect], y spans [-1, 1].
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        camera.position.z = 5;

        const curve = new THREE.CatmullRomCurve3(
          NODE_Y.map((y) => new THREE.Vector3(0, y, 0)), // x set in layout()
          false,
          "centripetal",
        );
        const SAMPLES = 400;
        const pathPts = new Float32Array((SAMPLES + 1) * 3);
        const pathGeo = new THREE.BufferGeometry();
        pathGeo.setAttribute("position", new THREE.BufferAttribute(pathPts, 3));
        const dimLine = new THREE.Line(
          pathGeo,
          new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.14 }),
        );
        const litGeo = new THREE.BufferGeometry();
        litGeo.setAttribute("position", new THREE.BufferAttribute(pathPts, 3));
        const litLine = new THREE.Line(
          litGeo,
          new THREE.LineBasicMaterial({
            color: 0x6ea6f7,
            transparent: true,
            opacity: 0.75,
            blending: THREE.AdditiveBlending,
          }),
        );
        scene.add(dimLine, litLine);

        // Particles: u = place along the stream, scatter = idle "dust" spot.
        const r = rng(11);
        const u = new Float32Array(COUNT);
        const off = new Float32Array(COUNT);
        const scatter = new Float32Array(COUNT * 2);
        const pos = new Float32Array(COUNT * 3);
        const alpha = new Float32Array(COUNT);
        const size = new Float32Array(COUNT);
        for (let i = 0; i < COUNT; i++) {
          u[i] = r();
          off[i] = (r() - 0.5) * 0.09;
          scatter[i * 2] = r() * 2 - 1; // later × aspect
          scatter[i * 2 + 1] = r() * 1.9 - 0.95;
          size[i] = 0.5 + r();
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
        geo.setAttribute("aAlpha", new THREE.BufferAttribute(alpha, 1));
        geo.setAttribute("aSize", new THREE.BufferAttribute(size, 1));
        const ptMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: { uScale: { value: 7 * renderer.getPixelRatio() } },
          vertexShader: /* glsl */ `
            attribute float aAlpha; attribute float aSize;
            uniform float uScale; varying float vA;
            void main() {
              vA = aAlpha;
              gl_PointSize = uScale * aSize;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vA;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float glow = smoothstep(0.5, 0.0, d);
              gl_FragColor = vec4(vec3(0.43, 0.65, 0.97) * 1.2, pow(glow, 1.8) * vA);
            }`,
        });
        scene.add(new THREE.Points(geo, ptMat));

        // Step nodes.
        const nodePos = new Float32Array(STEPS * 3);
        const nodeAlpha = new Float32Array(STEPS);
        const nodeSize = new Float32Array(STEPS).fill(3.2);
        const nodeGeo = new THREE.BufferGeometry();
        nodeGeo.setAttribute("position", new THREE.BufferAttribute(nodePos, 3));
        nodeGeo.setAttribute("aAlpha", new THREE.BufferAttribute(nodeAlpha, 1));
        nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(nodeSize, 1));
        scene.add(new THREE.Points(nodeGeo, ptMat));

        let aspect = 1;
        const layout = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          aspect = w / Math.max(h, 1);
          camera.left = -aspect;
          camera.right = aspect;
          camera.updateProjectionMatrix();
          curve.points.forEach((p, k) => {
            p.x = (NODE_X[k] / 50 - 1) * aspect;
            nodePos[k * 3] = p.x;
            nodePos[k * 3 + 1] = p.y;
          });
          const v = new THREE.Vector3();
          for (let s = 0; s <= SAMPLES; s++) {
            curve.getPoint(s / SAMPLES, v);
            pathPts.set([v.x, v.y, 0], s * 3);
          }
          pathGeo.attributes.position.needsUpdate = true;
          litGeo.attributes.position.needsUpdate = true;
          nodeGeo.attributes.position.needsUpdate = true;
        };
        layout();
        const ro = new ResizeObserver(layout);
        ro.observe(host);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        const tmp = new THREE.Vector3();
        const tan = new THREE.Vector3();
        let progress = reduce ? 1 : 0;
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const video = videoRef.current;
          // Stream reaches node k when shot k starts; full after the 5th shot begins.
          const target = reduce || !video ? 1 : Math.min(1, video.currentTime / (SHOT_S * (STEPS - 1)));
          // Snap back instantly when the reel loops, otherwise ease.
          progress = target < progress - 0.3 ? target : progress + (target - progress) * 0.08;
          const time = now / 1000;

          litGeo.setDrawRange(0, Math.max(2, Math.round(progress * SAMPLES) + 1));
          for (let k = 0; k < STEPS; k++) {
            const reached = progress >= k / (STEPS - 1) - 0.002;
            const head = reached && progress < (k + 1) / (STEPS - 1);
            nodeAlpha[k] = reached ? (head ? 0.75 + 0.25 * Math.sin(time * 4) : 0.9) : 0.22;
            nodeSize[k] = head ? 4.4 : 3.2;
          }
          nodeGeo.attributes.aAlpha.needsUpdate = true;
          nodeGeo.attributes.aSize.needsUpdate = true;

          for (let i = 0; i < COUNT; i++) {
            const j = i * 3;
            let tx: number, ty: number, a: number;
            if (u[i] < progress) {
              // Captured: flow along the lit part of the stream.
              const along = progress * ((u[i] / Math.max(progress, 0.001) + time * 0.06) % 1);
              curve.getPoint(along, tmp);
              curve.getTangent(along, tan);
              tx = tmp.x - tan.y * off[i];
              ty = tmp.y + tan.x * off[i];
              a = 0.85;
            } else {
              // Dust: slow drift around its scatter spot.
              tx = scatter[i * 2] * aspect + Math.sin(time * 0.3 + i) * 0.03;
              ty = scatter[i * 2 + 1] + Math.cos(time * 0.25 + i * 1.7) * 0.03;
              a = 0.22;
            }
            const k = reduce ? 1 : 0.06;
            pos[j] += (tx - pos[j]) * k;
            pos[j + 1] += (ty - pos[j + 1]) * k;
            alpha[i] += (a - alpha[i]) * 0.06;
          }
          geo.attributes.position.needsUpdate = true;
          geo.attributes.aAlpha.needsUpdate = true;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          [geo, nodeGeo, pathGeo, litGeo].forEach((g) => g.dispose());
          ptMat.dispose();
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

  const jump = (k: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = k * SHOT_S + 0.4;
      video.play().catch(() => {});
    }
    setStep(k);
    trackEvent("reel_step", { step: k + 1 });
  };

  const s = steps[step];

  return (
    <section
      ref={sectionRef}
      id="buoi-lam-viec"
      className="relative isolate overflow-hidden bg-ink text-white"
    >
      <div className="relative h-[min(100svh,860px)] min-h-[600px] w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          poster="/video/consult-reel-poster.jpg"
          muted
          loop
          playsInline
          preload="none"
          aria-hidden
        >
          {videoOn ? (
            <>
              <source src="/video/consult-reel.webm" type="video/webm" />
              <source src="/video/consult-reel.mp4" type="video/mp4" />
            </>
          ) : null}
        </video>

        {/* Legibility scrims: top for the headline, bottom for the stream + captions. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,15,25,0.92)_0%,rgba(11,15,25,0.35)_32%,rgba(11,15,25,0.15)_52%,rgba(11,15,25,0.9)_80%,rgb(11,15,25)_100%)]"
        />

        <div className="relative mx-auto flex h-full w-full max-w-7xl flex-col justify-between px-4 pb-6 pt-24 sm:px-6 sm:pt-28 lg:px-8">
          <div className="flex max-w-2xl flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-400">
              {t("eyebrow")}
            </p>
            <h2 className="font-serif text-[26px] font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t("heading")}
            </h2>
          </div>

          <div className="flex flex-col gap-5">
            <div key={step} className="flex max-w-xl animate-[fadeUp_.5s_ease] flex-col gap-1.5" aria-live="polite">
              <p className="font-display text-sm font-semibold text-brand-400">
                {String(step + 1).padStart(2, "0")} / {String(STEPS).padStart(2, "0")}
              </p>
              <p className="font-serif text-2xl font-bold sm:text-3xl">{s.title}</p>
              <p className="text-white/75 sm:text-lg">{s.text}</p>
            </div>

            {/* Stream + clickable step labels share NODE_X positions. */}
            <div className="relative h-28 sm:h-32">
              <div
                ref={canvasHost}
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 h-20 sm:h-24 [&>canvas]:h-full [&>canvas]:w-full"
              />
              <div role="tablist" aria-label={t("eyebrow")} className="absolute inset-x-0 bottom-0 h-10">
                {steps.map((item, k) => (
                  <button
                    key={item.title}
                    role="tab"
                    aria-selected={k === step}
                    onClick={() => jump(k)}
                    style={{ left: `${NODE_X[k]}%` }}
                    className={`absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors sm:px-3 sm:text-sm ${
                      k === step ? "text-brand-400" : "text-white/55 hover:text-white"
                    }`}
                  >
                    <span className="hidden sm:inline">{item.title}</span>
                    <span className="sm:hidden">{String(k + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("reel_cta", { channel: "zalo" })}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
                </a>
                <Link
                  href="/booking"
                  onClick={() => trackEvent("reel_cta", { channel: "booking" })}
                  className="inline-flex items-center rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white backdrop-blur transition hover:border-white/60"
                >
                  {t("ctaBook")}
                </Link>
              </div>
              <p className="inline-flex items-center gap-1.5 text-[11px] text-white/45">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> {t("aiNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
