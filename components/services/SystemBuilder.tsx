"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { FormStatus } from "@/components/forms/FormStatus";
import { trackEvent } from "@/lib/tracking/grid";

/** "Build your system" — the owner ticks the pains they live with; each pain
 *  drops the matching service in as a glowing floor of a three.js tower, and
 *  a personal roadmap (+ lead form → /api/plan) assembles beside it.
 *  Service indices follow messages → services.items / builder.services. */

// Which services (by index) each pain in builder.pains calls for.
const PAIN_SERVICES: number[][] = [[0], [0, 4], [0, 4], [2], [2, 4], [1], [3], [4]];
// Floor order from the ground up: SOP is the foundation, the owner's brand the roof.
const TOWER_ORDER = [2, 4, 0, 3, 1];
const DEFAULT_PAINS = [4]; // "the shop slows down when the owner is away" — the brand promise
const ZALO_URL = "https://zalo.me/0769918685";
const FLOOR_H = 0.64;

export function SystemBuilder() {
  const t = useTranslations("builder");
  const pains = t.raw("pains") as string[];
  const services = t.raw("services") as { name: string; floor: string; deliver: string[] }[];

  const [picked, setPicked] = useState<boolean[]>(() => pains.map((_, i) => DEFAULT_PAINS.includes(i)));
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  // Services in tower order, each with the pains that triggered it.
  const plan = useMemo(
    () =>
      TOWER_ORDER.map((s) => ({
        s,
        why: pains.filter((_, p) => picked[p] && PAIN_SERVICES[p].includes(s)),
      })).filter((x) => x.why.length > 0),
    [picked, pains],
  );

  // Read by the render loop: service index → floor slot (-1 = not in the tower).
  const slotsRef = useRef<number[]>([-1, -1, -1, -1, -1]);
  useEffect(() => {
    const slots = [-1, -1, -1, -1, -1];
    plan.forEach((x, floor) => (slots[x.s] = floor));
    slotsRef.current = slots;
  }, [plan]);

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const labelRefs = useRef<(HTMLDivElement | null)[]>([]);

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
        const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 60);
        camera.position.set(6.3, 5.2, 7.7);
        camera.lookAt(0, 2.05, 0);
        // Labels sit to the screen-right of each floor, whatever the tower's spin.
        const camRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

        scene.add(new THREE.AmbientLight(0xbfd2ff, 0.55));
        const key = new THREE.DirectionalLight(0xffffff, 1.3);
        key.position.set(4, 8, 5);
        scene.add(key);
        const glow = new THREE.PointLight(0x6ea6f7, 0, 9, 1.6);
        scene.add(glow);

        const world = new THREE.Group();
        // Nudge the tower screen-left to leave room for its floor labels.
        world.position.copy(camRight).multiplyScalar(-1);
        scene.add(world);

        // Ground: a dotted disc the tower stands on.
        const groundPts: number[] = [];
        for (let ring = 1; ring <= 9; ring++) {
          const rad = ring * 0.36;
          const n = Math.round(rad * 22);
          for (let k = 0; k < n; k++) {
            const a = (k / n) * Math.PI * 2;
            groundPts.push(Math.cos(a) * rad, 0, Math.sin(a) * rad);
          }
        }
        const groundGeo = new THREE.BufferGeometry();
        groundGeo.setAttribute("position", new THREE.Float32BufferAttribute(groundPts, 3));
        const groundMat = new THREE.PointsMaterial({
          color: 0x6ea6f7,
          size: 0.035,
          transparent: true,
          opacity: 0.45,
        });
        world.add(new THREE.Points(groundGeo, groundMat));

        // One slab per service; slightly tapered so the stack reads as a tower.
        const slabGeo = new THREE.BoxGeometry(2, 0.36, 2);
        const edgeGeo = new THREE.EdgesGeometry(slabGeo);
        const slabs = TOWER_ORDER.map((_, i) => {
          const body = new THREE.Mesh(
            slabGeo,
            new THREE.MeshStandardMaterial({
              color: 0x131d33,
              metalness: 0.35,
              roughness: 0.35,
              emissive: 0x4285f4,
              emissiveIntensity: 0,
              transparent: true,
              opacity: 0.15,
            }),
          );
          const edges = new THREE.LineSegments(
            edgeGeo,
            new THREE.LineBasicMaterial({ color: 0x6ea6f7, transparent: true, opacity: 0.25 }),
          );
          const g = new THREE.Group();
          g.add(body, edges);
          // Parked spot on an outer orbit while not selected.
          const a = (i / TOWER_ORDER.length) * Math.PI * 2 + 0.4;
          g.userData = { parkA: a, on: 0 };
          g.position.set(Math.cos(a) * 3.7, 1.3, Math.sin(a) * 3.7);
          g.scale.setScalar(0.5);
          world.add(g);
          return { g, body, edges };
        });

        // Motes rising through the built height of the tower.
        const MOTES = 260;
        const motePos = new Float32Array(MOTES * 3);
        const moteSeed = new Float32Array(MOTES * 3);
        for (let i = 0; i < MOTES; i++) {
          moteSeed[i * 3] = Math.random() * Math.PI * 2;
          moteSeed[i * 3 + 1] = Math.random();
          moteSeed[i * 3 + 2] = 1.45 + Math.random() * 0.35;
        }
        const moteGeo = new THREE.BufferGeometry();
        moteGeo.setAttribute("position", new THREE.BufferAttribute(motePos, 3));
        const moteMat = new THREE.PointsMaterial({
          color: 0x8fb6f9,
          size: 0.05,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        world.add(new THREE.Points(moteGeo, moteMat));

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

        const tmp = new THREE.Vector3();
        let height = 0;
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = now / 1000;
          const slots = slotsRef.current;
          const built = slots.filter((s) => s >= 0).length;
          const k = reduce ? 1 : 0.08;

          slabs.forEach(({ g, body, edges }, i) => {
            const slot = slots[i];
            const on = slot >= 0;
            const u = g.userData as { parkA: number; on: number };
            u.on += ((on ? 1 : 0) - u.on) * k;
            const a = u.parkA + (reduce ? 0 : time * 0.15);
            const tx = on ? 0 : Math.cos(a) * 3.7;
            const tz = on ? 0 : Math.sin(a) * 3.7;
            const ty = on ? 0.22 + slot * FLOOR_H : 1.3 + Math.sin(time * 1.2 + i) * 0.15;
            g.position.x += (tx - g.position.x) * k;
            g.position.y += (ty - g.position.y) * k;
            g.position.z += (tz - g.position.z) * k;
            const taper = on ? 1 - slot * 0.07 : 0.5;
            g.scale.setScalar(g.scale.x + (taper - g.scale.x) * k);
            // Parked slabs spin; a selected one unwinds (≤ 1 turn) as it drops in.
            if (on) g.rotation.y += -g.rotation.y * k;
            else g.rotation.y = reduce ? 0 : (time * 0.4 + i) % (Math.PI * 2);
            const m = body.material as InstanceType<typeof THREE.MeshStandardMaterial>;
            m.opacity = 0.15 + u.on * 0.7;
            m.emissiveIntensity = u.on * (0.22 + 0.08 * Math.sin(time * 2 + i));
            (edges.material as InstanceType<typeof THREE.LineBasicMaterial>).opacity = 0.25 + u.on * 0.7;

            // Floor label beside the slab (selected floors only).
            const label = labelRefs.current[i];
            if (label) {
              g.getWorldPosition(tmp).addScaledVector(camRight, 1.5 * g.scale.x);
              tmp.project(camera);
              const x = (tmp.x * 0.5 + 0.5) * host.clientWidth;
              const y = (-tmp.y * 0.5 + 0.5) * host.clientHeight;
              label.style.transform = `translate(${x}px, ${y}px) translate(8px, -50%)`;
              label.style.opacity = String(Math.max(0, u.on * 1.4 - 0.4));
            }
          });

          height += (built * FLOOR_H - height) * k;
          glow.position.set(0, height + 0.6, 0);
          glow.intensity = built ? 6 : 0;
          for (let i = 0; i < MOTES; i++) {
            const a = moteSeed[i * 3] + time * 0.35;
            const f = (moteSeed[i * 3 + 1] + time * 0.12) % 1;
            const r = moteSeed[i * 3 + 2];
            motePos[i * 3] = Math.cos(a) * r;
            motePos[i * 3 + 1] = f * (height + 0.4);
            motePos[i * 3 + 2] = Math.sin(a) * r;
          }
          moteGeo.attributes.position.needsUpdate = true;
          moteMat.opacity = built ? 0.85 : 0;

          if (!reduce) world.rotation.y = Math.sin(time * 0.18) * 0.35;
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          [groundGeo, slabGeo, edgeGeo, moteGeo].forEach((g) => g.dispose());
          slabs.forEach(({ body, edges }) => {
            (body.material as InstanceType<typeof THREE.Material>).dispose();
            (edges.material as InstanceType<typeof THREE.Material>).dispose();
          });
          groundMat.dispose();
          moteMat.dispose();
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

  function toggle(i: number) {
    setPicked((prev) => {
      const next = prev.map((v, j) => (j === i ? !v : v));
      trackEvent("builder_pain", { pain: i + 1, on: next[i] });
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          pains: pains.filter((_, i) => picked[i]),
          services: plan.map((x) => services[x.s].name),
        }),
      });
      setStatus(r.ok ? "ok" : "err");
      trackEvent("form_submit", { form: "system_builder", ok: r.ok, floors: plan.length });
    } catch {
      setStatus("err");
    }
  }

  return (
    <section ref={sectionRef} id="dung-he-thong" className="relative overflow-hidden bg-ink pb-20 pt-28 text-white sm:pb-24 sm:pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(55%_45%_at_75%_40%,rgba(110,166,247,0.12),transparent_70%)]"
      />
      <Container className="relative grid gap-10 lg:grid-cols-2 lg:gap-x-14">
        <div className="flex flex-col gap-4 lg:col-start-1">
          <p className="eyebrow-pill" data-tone="dark">{t("eyebrow")}</p>
          <h1 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-[44px]">
            {t("heading")}
          </h1>
          <p className="max-w-xl text-white/80 sm:text-lg">{t("sub")}</p>
        </div>

        <div className="flex flex-wrap gap-2.5 lg:col-start-1" role="group" aria-label={t("painsLabel")}>
          {pains.map((pain, i) => (
            <button
              key={pain}
              type="button"
              aria-pressed={picked[i]}
              onClick={() => toggle(i)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-left text-sm font-medium transition-all ${
                picked[i]
                  ? "border-brand-400 bg-brand-400 text-ink shadow-lg shadow-brand-500/20"
                  : "border-white/15 bg-white/[0.03] text-white/80 hover:border-white/40 hover:text-white"
              }`}
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                  picked[i] ? "border-ink bg-ink text-brand-400" : "border-white/40"
                }`}
              >
                {picked[i] ? <Check size={11} strokeWidth={3} aria-hidden /> : null}
              </span>
              {pain}
            </button>
          ))}
        </div>

        {/* 3D tower — sticky beside the plan on desktop, between chips and plan on mobile. */}
        <div className="lg:col-start-2 lg:row-span-4 lg:row-start-1">
          <div className="relative aspect-[4/3.4] w-full overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(70%_60%_at_50%_70%,rgba(66,133,244,0.14),transparent_75%)] lg:sticky lg:top-24 lg:aspect-[4/4.4]">
            <div ref={canvasHost} aria-hidden className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
            <div aria-hidden className="pointer-events-none absolute inset-0">
              {services.map((sv, i) => (
                <div
                  key={sv.name}
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-brand-400/30 bg-ink/70 px-2.5 py-1 text-[11px] font-semibold text-brand-400 opacity-0 backdrop-blur sm:text-xs"
                >
                  {sv.floor}
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute left-5 top-5 flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">
                {t("towerLabel")}
              </span>
              <span className="font-display text-4xl font-extrabold text-white">
                {plan.length}
                <span className="text-xl text-white/40"> / {services.length} {t("floors")}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:col-start-1" aria-live="polite">
          <p className="font-display text-xl font-semibold">
            {plan.length ? t("planHeading", { n: plan.length }) : t("planEmpty")}
          </p>
          <ol className="flex flex-col gap-3">
            {plan.map((x, floor) => (
              <li
                key={x.s}
                className="flex animate-[fadeUp_.45s_ease] gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/15 font-display text-sm font-bold text-brand-400">
                  {floor + 1}
                </span>
                <div className="flex flex-col gap-1.5">
                  <p className="font-semibold text-white">{services[x.s].name}</p>
                  <p className="text-xs text-white/50">
                    {t("because")} {x.why.join(" · ")}
                  </p>
                  <ul className="mt-1 flex flex-col gap-1 text-sm text-white/75">
                    {services[x.s].deliver.map((d) => (
                      <li key={d} className="flex gap-2">
                        <Check size={15} className="mt-0.5 shrink-0 text-leaf-400" aria-hidden />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-start-1">
          {status === "ok" ? (
            <FormStatus type="success" title={t("okTitle")} body={t("okBody")} />
          ) : (
            <form
              onSubmit={onSubmit}
              className="flex flex-col gap-3 rounded-2xl border border-brand-400/25 bg-brand-500/[0.06] p-5"
            >
              <p className="font-display text-lg font-semibold">{t("ctaHeading")}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  name="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  placeholder={t("namePh")}
                  aria-label={t("namePh")}
                  className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-brand-400"
                />
                <input
                  name="phone"
                  required
                  type="tel"
                  inputMode="tel"
                  pattern="[0-9+\s.\-()]{8,30}"
                  autoComplete="tel"
                  placeholder={t("phonePh")}
                  aria-label={t("phonePh")}
                  className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-brand-400"
                />
              </div>
              <button
                type="submit"
                disabled={status === "sending" || plan.length === 0}
                className="min-h-12 rounded-full bg-brand-500 btn-gradient px-6 text-[15px] font-bold text-ink transition-colors hover:bg-brand-400 disabled:opacity-50"
              >
                {status === "sending" ? t("sending") : t("submit")}
              </button>
              {status === "err" ? <FormStatus type="error" title={t("errTitle")} body={t("errBody")} /> : null}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm text-white/55">
                <span>{t("note")}</span>
                <a
                  href={ZALO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackEvent("builder_cta", { channel: "zalo", floors: plan.length })}
                  className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-white"
                >
                  <MessageCircle size={16} aria-hidden />
                  {t("zalo")}
                </a>
              </div>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
