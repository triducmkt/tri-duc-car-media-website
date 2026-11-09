"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarDays, Check, MapPin, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { COMPANY } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/** "Đến tận tiệm" — the local edge none of the national competitors can claim.
 *  A three.js night map of HCMC: each (former) district is a cluster of city
 *  lights; the owner taps theirs and a light runs from the Trí Đức office
 *  (Tân Phú) to their shop, with an estimated ride time and a Zalo message
 *  written for them. Copy: messages → houseCall. Positions are approximate
 *  district centres — an illustration, not a survey map. */

const OFFICE = { lon: 106.6312, lat: 10.786 }; // 50-50A Lê Thúc Hoạch, P. Phú Thọ Hòa

type District = { id: string; vi: string; en: string; lon: number; lat: number; spread?: number };
const DISTRICTS: District[] = [
  { id: "q1", vi: "Quận 1", en: "District 1", lon: 106.7009, lat: 10.7769 },
  { id: "q3", vi: "Quận 3", en: "District 3", lon: 106.6844, lat: 10.7843 },
  { id: "q4", vi: "Quận 4", en: "District 4", lon: 106.7013, lat: 10.7578, spread: 0.8 },
  { id: "q5", vi: "Quận 5", en: "District 5", lon: 106.6634, lat: 10.754 },
  { id: "q6", vi: "Quận 6", en: "District 6", lon: 106.6352, lat: 10.748 },
  { id: "q7", vi: "Quận 7", en: "District 7", lon: 106.7215, lat: 10.734, spread: 1.4 },
  { id: "q8", vi: "Quận 8", en: "District 8", lon: 106.6286, lat: 10.724, spread: 1.3 },
  { id: "q10", vi: "Quận 10", en: "District 10", lon: 106.6673, lat: 10.7746 },
  { id: "q11", vi: "Quận 11", en: "District 11", lon: 106.643, lat: 10.763 },
  { id: "q12", vi: "Quận 12", en: "District 12", lon: 106.6413, lat: 10.8672, spread: 1.8 },
  { id: "tb", vi: "Tân Bình", en: "Tan Binh", lon: 106.6527, lat: 10.8015, spread: 1.2 },
  { id: "tp", vi: "Tân Phú", en: "Tan Phu", lon: 106.6255, lat: 10.7925 },
  { id: "pn", vi: "Phú Nhuận", en: "Phu Nhuan", lon: 106.6803, lat: 10.7992, spread: 0.8 },
  { id: "bth", vi: "Bình Thạnh", en: "Binh Thanh", lon: 106.7091, lat: 10.8106, spread: 1.2 },
  { id: "gv", vi: "Gò Vấp", en: "Go Vap", lon: 106.6653, lat: 10.8387, spread: 1.4 },
  { id: "bt", vi: "Bình Tân", en: "Binh Tan", lon: 106.6036, lat: 10.7653, spread: 1.5 },
  { id: "td", vi: "TP. Thủ Đức", en: "Thu Duc City", lon: 106.7537, lat: 10.8494, spread: 2.4 },
  { id: "bc", vi: "Bình Chánh", en: "Binh Chanh", lon: 106.594, lat: 10.704, spread: 2 },
  { id: "hm", vi: "Hóc Môn", en: "Hoc Mon", lon: 106.595, lat: 10.889, spread: 1.8 },
  { id: "nb", vi: "Nhà Bè", en: "Nha Be", lon: 106.735, lat: 10.695, spread: 1.6 },
];
/** -1 = outside HCMC (meet over Zalo video). */
const REMOTE = -1;
/** Idle tour until the visitor picks: centre → east → north → south. */
const TOUR = ["q1", "q10", "bth", "q7", "gv", "q3"].map((id) => DISTRICTS.findIndex((d) => d.id === id));
const TOUR_MS = 3600;

const S = 23;
const K = Math.cos((10.79 * Math.PI) / 180);
const proj = (lon: number, lat: number): [number, number] => [(lon - 106.668) * K * S, (lat - 10.792) * S];

function haversineKm(a: { lon: number; lat: number }, b: { lon: number; lat: number }) {
  const r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r;
  const dLon = (b.lon - a.lon) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}
/** Road ≈ 1.35 × straight line; motorbike ≈ 22 km/h in the city off-peak; +4 min parking. */
function ride(d: District) {
  const road = haversineKm(OFFICE, d) * 1.35;
  const min = Math.max(10, Math.round(((road / 22) * 60 + 4) / 5) * 5);
  return { km: Math.max(1, Math.round(road)), min };
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Industry = { label: string; inMsg: string };

export function HouseCallMap() {
  const t = useTranslations("houseCall");
  const locale = useLocale();
  const industries = t.raw("industries") as Industry[];

  const [active, setActive] = useState(TOUR[0]);
  const [picked, setPicked] = useState(false);
  const [industry, setIndustry] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const activeRef = useRef(active);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    if (picked) return;
    let k = 0;
    const id = window.setInterval(() => {
      k = (k + 1) % TOUR.length;
      setActive(TOUR[k]);
    }, TOUR_MS);
    return () => window.clearInterval(id);
  }, [picked]);

  const pick = (i: number, via: "chip" | "map") => {
    setPicked(true);
    setActive(i);
    setCopied(false);
    trackEvent("housecall_pick", { district: i === REMOTE ? "remote" : DISTRICTS[i].id, via });
  };
  const pickRef = useRef(pick);
  useEffect(() => {
    pickRef.current = pick;
  });

  const sectionRef = useRef<HTMLElement>(null);
  const canvasHost = useRef<HTMLDivElement>(null);
  const officeLabel = useRef<HTMLSpanElement>(null);
  const destLabel = useRef<HTMLSpanElement>(null);

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
        const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
        camera.position.set(0, -5.4, 6.4);
        camera.lookAt(0, 0.15, 0);
        const map = new THREE.Group();
        scene.add(map);

        const [ox, oy] = proj(OFFICE.lon, OFFICE.lat);
        const centres = DISTRICTS.map((d) => proj(d.lon, d.lat));

        // ── City lights: a gaussian cluster per district + a faint haze between them.
        const rnd = mulberry32(1989);
        const gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(2 * Math.PI * rnd());
        const pts: number[] = [];
        const dist: number[] = [];
        const dIdx: number[] = [];
        const seed: number[] = [];
        const add = (x: number, y: number, d: number) => {
          pts.push(x, y, 0);
          dist.push(Math.hypot(x - ox, y - oy));
          dIdx.push(d);
          seed.push(rnd());
        };
        DISTRICTS.forEach((d, i) => {
          const [cx, cy] = centres[i];
          const sp = 0.21 * (d.spread ?? 1);
          const n = Math.round(90 * Math.sqrt(d.spread ?? 1));
          for (let k = 0; k < n; k++) add(cx + gauss() * sp, cy + gauss() * sp, i);
        });
        for (let k = 0; k < 1800; k++) {
          const a = rnd() * Math.PI * 2;
          const r = Math.sqrt(rnd()) * 2.7;
          add(Math.cos(a) * r * 1.05 + 0.05, Math.sin(a) * r, -1);
        }
        const dotGeo = new THREE.BufferGeometry();
        dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
        dotGeo.setAttribute("aDist", new THREE.Float32BufferAttribute(dist, 1));
        dotGeo.setAttribute("aD", new THREE.Float32BufferAttribute(dIdx, 1));
        dotGeo.setAttribute("aR", new THREE.Float32BufferAttribute(seed, 1));
        const dotMat = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uReveal: { value: reduce ? 9 : 0 },
            uActive: { value: activeRef.current },
            uSize: { value: 2.7 * renderer.getPixelRatio() },
          },
          vertexShader: /* glsl */ `
            attribute float aDist; attribute float aD; attribute float aR;
            uniform float uTime; uniform float uReveal; uniform float uActive; uniform float uSize;
            varying float vOn; varying float vBg; varying float vA; varying float vGlow;
            void main() {
              float w = fract(uTime * 0.12 - aDist * 0.3);
              vGlow = smoothstep(0.0, 0.05, w) * smoothstep(0.2, 0.05, w);
              vOn = 1.0 - step(0.5, abs(aD - uActive));
              vBg = step(aD, -0.5);
              float twinkle = 0.7 + 0.3 * sin(uTime * 1.6 + aR * 40.0);
              vA = smoothstep(aDist - 0.4, aDist, uReveal) * twinkle;
              gl_PointSize = uSize * (mix(1.0, 0.65, vBg) + vOn * 0.8 + vGlow * 0.4);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }`,
          fragmentShader: /* glsl */ `
            varying float vOn; varying float vBg; varying float vA; varying float vGlow;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              if (d > 0.5) discard;
              float soft = smoothstep(0.5, 0.1, d);
              vec3 cool = vec3(0.43, 0.65, 0.97);
              vec3 c = mix(cool, vec3(0.43, 0.65, 0.97), max(vOn, vGlow * 0.7));
              float a = (mix(0.55, 0.16, vBg) + vOn * 0.45 + vGlow * 0.35) * vA * soft;
              gl_FragColor = vec4(c, a);
            }`,
        });
        map.add(new THREE.Points(dotGeo, dotMat));

        // ── Glow sprites (office head, rider + trail, destination head).
        const gold = 0x6ea6f7;
        const TRAIL = 14;
        const GLOWS = 2 + TRAIL;
        const glowPos = new Float32Array(GLOWS * 3);
        const glowA = new Float32Array(GLOWS);
        const glowS = new Float32Array(GLOWS);
        const glowGeo = new THREE.BufferGeometry();
        glowGeo.setAttribute("position", new THREE.BufferAttribute(glowPos, 3));
        glowGeo.setAttribute("aAlpha", new THREE.BufferAttribute(glowA, 1));
        glowGeo.setAttribute("aSize", new THREE.BufferAttribute(glowS, 1));
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
              gl_FragColor = vec4(vec3(0.43, 0.65, 0.97) * 1.2, pow(g, 1.6) * vA);
            }`,
        });
        map.add(new THREE.Points(glowGeo, glowMat));

        // Office beacon: beam + pulsing rings.
        const BEAM_H = 0.7;
        const beam = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ox, oy, 0), new THREE.Vector3(ox, oy, BEAM_H)]),
          new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.85 }),
        );
        map.add(beam);
        const ringGeo = new THREE.RingGeometry(0.035, 0.045, 48);
        const mkRing = () => {
          const m = new THREE.Mesh(
            ringGeo,
            new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false }),
          );
          map.add(m);
          return m;
        };
        const officeRing = mkRing();
        officeRing.position.set(ox, oy, 0.002);
        const destRing = mkRing();

        // Reach circle: centred on the office, grows to the chosen shop's distance.
        const reachGeo = new THREE.RingGeometry(0.994, 1, 160);
        const reachMat = new THREE.MeshBasicMaterial({ color: gold, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false });
        const reach = new THREE.Mesh(reachGeo, reachMat);
        reach.position.set(ox, oy, 0.001);
        map.add(reach);

        // Route arc office → shop (geometry rewritten when the target changes).
        const ARC_N = 64;
        const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3());
        const arcGeo = new THREE.BufferGeometry();
        arcGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((ARC_N + 1) * 3), 3));
        const arcMat = new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0 });
        const arc = new THREE.Line(arcGeo, arcMat);
        map.add(arc);

        let target = -99;
        let tripStart = 0;
        const v = new THREE.Vector3();
        const setTarget = (i: number, now: number) => {
          target = i;
          tripStart = now;
          if (i < 0) return;
          const [x, y] = centres[i];
          const d = Math.hypot(x - ox, y - oy);
          curve.v0.set(ox, oy, 0.02);
          curve.v1.set((ox + x) / 2, (oy + y) / 2, Math.max(0.18, d * 0.5));
          curve.v2.set(x, y, 0.02);
          const arr = arcGeo.attributes.position.array as Float32Array;
          for (let k = 0; k <= ARC_N; k++) {
            curve.getPoint(k / ARC_N, v);
            arr.set([v.x, v.y, v.z], k * 3);
          }
          arcGeo.attributes.position.needsUpdate = true;
          arcGeo.computeBoundingSphere();
          destRing.position.set(x, y, 0.002);
          arcMat.opacity = 0;
        };

        const resize = () => {
          const w = host.clientWidth, h = host.clientHeight;
          renderer.setSize(w, h, false);
          camera.aspect = w / Math.max(h, 1);
          // Narrow (phone) frames: pull back so the whole city fits.
          camera.position.set(0, -5.4, 6.4).multiplyScalar(camera.aspect < 0.95 ? 1.18 : 1);
          camera.lookAt(0, 0.15, 0);
          camera.updateProjectionMatrix();
        };
        resize();
        const ro = new ResizeObserver(resize);
        ro.observe(host);

        let visible = true;
        const vis = new IntersectionObserver((e) => (visible = e[0].isIntersecting));
        vis.observe(section);

        const toScreen = (x: number, y: number, z: number) => {
          v.set(x, y, z);
          map.localToWorld(v);
          v.project(camera);
          return [(v.x * 0.5 + 0.5) * host.clientWidth, (-v.y * 0.5 + 0.5) * host.clientHeight] as const;
        };
        const placeLabel = (el: HTMLElement | null, x: number, y: number, z: number, alpha = 1) => {
          if (!el) return;
          const [sx, sy] = toScreen(x, y, z);
          el.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%) translateY(-10px)`;
          el.style.opacity = String(alpha);
        };

        // Tap the map: nearest district centre within 44px.
        const onTap = (ev: PointerEvent) => {
          const rect = host.getBoundingClientRect();
          const px = ev.clientX - rect.left, py = ev.clientY - rect.top;
          let best = -1, bestD = 44;
          centres.forEach(([x, y], i) => {
            const [sx, sy] = toScreen(x, y, 0);
            const d = Math.hypot(sx - px, sy - py);
            if (d < bestD) {
              bestD = d;
              best = i;
            }
          });
          if (best >= 0) pickRef.current(best, "map");
        };
        host.addEventListener("pointerup", onTap);

        let raf = 0;
        const t0 = performance.now();
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const time = (now - t0) / 1000;
          const act = activeRef.current;
          if (act !== target) setTarget(act, time);
          dotMat.uniforms.uTime.value = reduce ? 3 : time;
          dotMat.uniforms.uActive.value = act;
          if (!reduce) dotMat.uniforms.uReveal.value = time * 2.2;
          if (!reduce) map.rotation.z = Math.sin(time * 0.12) * 0.05;

          // Office beacon.
          glowPos.set([ox, oy, BEAM_H], 0);
          glowA[0] = 1;
          glowS[0] = 34 + (reduce ? 0 : Math.sin(time * 2.4) * 4);
          const f = reduce ? 0.4 : (time * 0.5) % 1;
          officeRing.scale.setScalar(1 + f * 4);
          (officeRing.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (1 - f) * 0.75;

          const remote = target < 0;
          const trip = remote ? 0 : reduce ? 1 : Math.min(1, (time - tripStart) / 1.8);
          const ease = 1 - Math.pow(1 - trip, 3);
          arcMat.opacity += ((remote ? 0 : 0.75) - arcMat.opacity) * 0.08;
          arcGeo.setDrawRange(0, Math.max(2, Math.round(ease * (ARC_N + 1))));

          // Rider + fading trail along the arc; parks at the shop after arrival.
          for (let k = 0; k < TRAIL; k++) {
            const idx = 1 + k;
            if (remote) {
              glowA[idx] = 0;
              continue;
            }
            const loop = reduce || trip < 1 ? ease : ((time - tripStart - 1.8) * 0.45) % 1;
            const u = Math.max(0, loop - k * 0.012);
            curve.getPoint(u, v);
            glowPos.set([v.x, v.y, v.z], idx * 3);
            glowA[idx] = (1 - k / TRAIL) * (trip < 1 ? 1 : 0.55);
            glowS[idx] = (k === 0 ? 20 : 12) * (1 - k / (TRAIL * 1.4));
          }

          // Destination head + ring.
          const last = GLOWS - 1;
          if (!remote) {
            const [x, y] = centres[target];
            glowPos.set([x, y, 0.06], last * 3);
            glowA[last] += ((trip >= 1 ? 1 : 0.25) - glowA[last]) * 0.1;
            glowS[last] = 30;
            const g = reduce ? 0.4 : (time * 0.7) % 1;
            destRing.scale.setScalar(1 + g * (trip >= 1 ? 5 : 2));
            (destRing.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (1 - g) * (trip >= 1 ? 0.9 : 0.3);
            const want = Math.hypot(x - ox, y - oy) * ease;
            reach.scale.setScalar(Math.max(0.001, reach.scale.x + (want - reach.scale.x) * 0.12));
            reachMat.opacity = 0.25;
            placeLabel(destLabel.current, x, y, 0.08, trip >= 1 ? 1 : 0.35);
          } else {
            glowA[last] = 0;
            (destRing.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = 0;
            reachMat.opacity += (0 - reachMat.opacity) * 0.1;
            if (destLabel.current) destLabel.current.style.opacity = "0";
          }
          glowGeo.attributes.position.needsUpdate = true;
          glowGeo.attributes.aAlpha.needsUpdate = true;
          glowGeo.attributes.aSize.needsUpdate = true;

          placeLabel(officeLabel.current, ox, oy, BEAM_H + 0.05);
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.removeEventListener("pointerup", onTap);
          [dotGeo, glowGeo, ringGeo, reachGeo, arcGeo, beam.geometry].forEach((g) => g.dispose());
          [dotMat, glowMat, reachMat, arcMat, beam.material as InstanceType<typeof THREE.Material>].forEach((m) => m.dispose());
          [officeRing, destRing].forEach((r) => (r.material as InstanceType<typeof THREE.Material>).dispose());
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

  const nameOf = (d: District) => (locale === "en" ? d.en : d.vi);
  const remote = active === REMOTE;
  const d = remote ? null : DISTRICTS[active];
  const r = d ? ride(d) : null;
  const ind = industry === null ? t("defaultIndustry") : industries[industry].inMsg;
  const message = d ? t("msg", { industry: ind, place: nameOf(d) }) : t("msgRemote", { industry: ind });

  const onZalo = () => {
    try {
      navigator.clipboard?.writeText(message).catch(() => {});
    } catch {
      /* clipboard blocked — the message stays visible to copy by hand */
    }
    setCopied(true);
    trackEvent("housecall_cta", {
      channel: "zalo",
      district: d ? d.id : "remote",
      industry: industry === null ? "none" : industry,
      picked,
    });
  };

  return (
    <section ref={sectionRef} id="den-tan-tiem" className="relative overflow-hidden bg-ink pb-20 pt-14 text-white sm:pb-24 sm:pt-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_55%_at_28%_55%,rgba(66,133,244,0.14),transparent_70%),radial-gradient(30%_30%_at_75%_20%,rgba(110,166,247,0.08),transparent_70%)]"
      />
      <Container className="relative grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-12">
        <div className="flex flex-col gap-4 lg:col-start-2 lg:row-start-1">
          <p className="eyebrow-pill" data-tone="dark">{t("eyebrow")}</p>
          <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl lg:text-[40px]">{t("heading")}</h2>
          <p className="max-w-xl text-white/80 sm:text-lg">{t("sub")}</p>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[640px] lg:col-start-1 lg:row-span-2 lg:row-start-1">
          <div
            ref={canvasHost}
            aria-hidden
            className="absolute inset-0 cursor-pointer touch-pan-y [&>canvas]:h-full [&>canvas]:w-full"
          />
          <div className="pointer-events-none absolute inset-0">
            <span
              ref={officeLabel}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full border border-brand-400/60 bg-ink/80 px-2.5 py-1 text-[11px] font-semibold text-brand-400 backdrop-blur sm:text-xs"
            >
              {t("office")}
            </span>
            <span
              ref={destLabel}
              className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-brand-400 px-3 py-1 text-[11px] font-bold text-ink opacity-0 shadow-[0_0_24px_rgba(110,166,247,0.5)] transition-opacity sm:text-xs"
            >
              {d && r ? `${nameOf(d)} · ≈ ${r.min} ${t("minShort")}` : ""}
            </span>
          </div>
          <p className="pointer-events-none absolute inset-x-0 bottom-1 text-center text-[11px] text-white/40">{t("mapNote")}</p>
        </div>

        <div className="flex flex-col gap-5 lg:col-start-2">
          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold text-white/85">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand-400 text-[11px] font-bold text-ink">1</span>
              {t("stepPlace")}
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("stepPlace")}>
              {DISTRICTS.map((x, i) => (
                <button
                  key={x.id}
                  type="button"
                  aria-pressed={picked && i === active}
                  onClick={() => pick(i, "chip")}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    i === active
                      ? picked
                        ? "border-brand-400 bg-brand-400 text-ink"
                        : "border-brand-400/70 text-brand-400"
                      : "border-white/15 text-white/80 hover:border-brand-400/60 hover:text-white"
                  }`}
                >
                  {nameOf(x)}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={remote}
                onClick={() => pick(REMOTE, "chip")}
                className={`rounded-full border border-dashed px-2.5 py-1 text-xs font-medium transition-colors ${
                  remote ? "border-brand-400 bg-brand-400 text-ink" : "border-white/25 text-white/60 hover:border-brand-400/60"
                }`}
              >
                {t("remote")}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <p className="text-sm font-semibold text-white/85">
              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/15 text-[11px] font-bold text-white">2</span>
              {t("stepIndustry")}
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("stepIndustry")}>
              {industries.map((x, i) => (
                <button
                  key={x.label}
                  type="button"
                  aria-pressed={industry === i}
                  onClick={() => {
                    setIndustry(i);
                    setCopied(false);
                    trackEvent("housecall_industry", { industry: i });
                  }}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    industry === i ? "border-white bg-white text-ink" : "border-white/15 text-white/80 hover:border-white/50"
                  }`}
                >
                  {x.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-brand-400/25 bg-brand-500/[0.06] p-5" aria-live="polite">
            {d && r ? (
              <div className="flex items-end gap-4">
                <p className="font-display text-5xl font-bold leading-none text-brand-400 tabular-nums">≈{r.min}</p>
                <div className="flex flex-col pb-0.5">
                  <p className="text-sm font-semibold text-white">{t("minLong")}</p>
                  <p className="text-xs text-white/55">{t("rideNote", { place: nameOf(d), km: r.km })}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 shrink-0 text-brand-400" aria-hidden />
                <p className="text-sm text-white/80">{t("remoteNote")}</p>
              </div>
            )}
            <p className="text-sm text-white/75">{d ? t("promise") : t("promiseRemote")}</p>

            {/* What they'll send — a Zalo-style bubble, written for them. */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-white/45">{t("bubbleLabel")}</p>
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-br-sm bg-[#4285f4] px-4 py-3 text-sm leading-relaxed text-white shadow-lg">
                {message}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={COMPANY.zalo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onZalo}
                className="inline-flex items-center gap-2 rounded-full bg-brand-400 px-5 py-3 text-sm font-bold text-ink transition hover:bg-brand-500"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> {d ? t("ctaZalo") : t("ctaZaloRemote")}
              </a>
              <Link
                href="/booking"
                onClick={() => trackEvent("housecall_cta", { channel: "booking", district: d ? d.id : "remote", picked })}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                <CalendarDays className="h-4 w-4" aria-hidden /> {t("ctaBook")}
              </Link>
            </div>
            <p className="flex items-center gap-1.5 text-xs text-white/50">
              {copied ? <Check className="h-3.5 w-3.5 text-leaf-400" aria-hidden /> : null}
              {copied ? t("copied") : t("copyHint")}
            </p>
          </div>

          <p className="text-xs text-white/45">{t("proof")}</p>
        </div>
      </Container>
    </section>
  );
}
