"use client";

import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { CalendarCheck, Check, Mail, MapPin, MessageCircle, Phone, PlayCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { YoutubeIcon } from "@/components/icons/YoutubeIcon";
import { Link } from "@/i18n/navigation";
import { COMPANY, companyAddressLine } from "@/lib/company";
import {
  CHANNEL_KEYS,
  CHANNEL_MAP,
  VIDEO_TOPICS,
  videoSource,
  type ChannelKey,
  type ChannelVideo,
} from "@/lib/channels";
import { trackEvent } from "@/lib/tracking/grid";

/** "Kênh của Trí Đức" — every way to reach the founder as planets on tilted
 *  orbits around his portrait (three.js). Signals stream from each channel
 *  into the centre; picking one swings it to the front and opens its panel:
 *  video player (Sanity videos or the curated shorts), fanpage, Zalo QR with
 *  ready-made first lines, phone, and real behind-the-scenes photos (from the
 *  owner's Drive, public/behind/). Copy lives in messages → channels. */

type ChannelIcon = ComponentType<{ size?: number; className?: string; style?: CSSProperties; "aria-hidden"?: boolean }>;
const ICONS: Record<ChannelKey, ChannelIcon> = {
  video: YoutubeIcon,
  facebook: FacebookIcon,
  zalo: MessageCircle,
  phone: Phone,
  visit: CalendarCheck,
};
const PHOTOS = ["khang-vu", "xuong", "gam-xe", "san", "ban-tron", "studio"] as const;
const SIGNALS = 34; // particles streaming from each channel into the core
const FRONT = Math.PI / 2; // orbit angle that faces the camera

function orbitOf(k: number) {
  return { r: 1.3 + k * 0.27, tilt: k * 0.32 - 0.62, phase: (k * Math.PI * 2) / CHANNEL_KEYS.length };
}

export function ChannelOrbit({ videos, id = "kenh" }: { videos: ChannelVideo[]; id?: string }) {
  const t = useTranslations("channels");
  const [active, setActive] = useState<ChannelKey>("video");
  const sectionRef = useRef<HTMLElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const nodeBtns = useRef<(HTMLButtonElement | null)[]>([]);
  const activeRef = useRef(-1); // -1 = nobody picked yet → free orbit

  const pick = (key: ChannelKey, via: "orbit" | "tab") => {
    setActive(key);
    activeRef.current = CHANNEL_KEYS.indexOf(key);
    trackEvent("channel_pick", { channel: key, via });
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
        const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
        camera.position.set(0, 0, 7.4);
        const system = new THREE.Group();
        system.rotation.x = 1.08; // look down onto the orbital plane
        scene.add(system);
        const ratio = renderer.getPixelRatio();
        const K = CHANNEL_KEYS.length;
        const colors = CHANNEL_KEYS.map((k) => new THREE.Color(CHANNEL_MAP[k].color));

        // One glow shader for core, nodes and signals (per-point colour/size/alpha).
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
              gl_PointSize = aSize * uScale * (7.4 / -mv.z);
              gl_Position = projectionMatrix * mv;
            }`,
          fragmentShader: /* glsl */ `
            varying float vA; varying vec3 vC;
            void main() {
              float d = length(gl_PointCoord - 0.5);
              float core = smoothstep(0.14, 0.0, d);
              float halo = pow(smoothstep(0.5, 0.0, d), 2.4);
              gl_FragColor = vec4(vC * (0.75 + core), (halo * 0.85 + core) * vA);
            }`,
        });
        const pointCloud = (n: number) => {
          const geo = new THREE.BufferGeometry();
          const p = new Float32Array(n * 3), a = new Float32Array(n), s = new Float32Array(n), c = new Float32Array(n * 3);
          geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
          geo.setAttribute("aAlpha", new THREE.BufferAttribute(a, 1));
          geo.setAttribute("aSize", new THREE.BufferAttribute(s, 1));
          geo.setAttribute("aColor", new THREE.BufferAttribute(c, 3));
          return { geo, p, a, s, c, flag: () => Object.values(geo.attributes).forEach((x) => (x.needsUpdate = true)) };
        };

        // ── Background dust (scene space, not tilted).
        const dust = pointCloud(500);
        for (let i = 0; i < 500; i++) {
          const r1 = Math.sin(i * 12.9898) * 43758.5453, r2 = Math.sin(i * 78.233) * 12345.678, r3 = Math.sin(i * 39.425) * 9876.54;
          dust.p.set([(r1 - Math.floor(r1) - 0.5) * 12, (r2 - Math.floor(r2) - 0.5) * 9, -2 - (r3 - Math.floor(r3)) * 3], i * 3);
          dust.a[i] = 0.18 + (r3 - Math.floor(r3)) * 0.25;
          dust.s[i] = 3;
          dust.c.set([0.6, 0.72, 0.96], i * 3);
        }
        dust.flag();
        scene.add(new THREE.Points(dust.geo, glowMat));

        // ── Orbit rings.
        const rings = CHANNEL_KEYS.map((_, k) => {
          const { r, tilt } = orbitOf(k);
          const pts: number[] = [];
          for (let s = 0; s < 160; s++) {
            const a = (s / 160) * Math.PI * 2;
            pts.push(Math.cos(a) * r, 0, Math.sin(a) * r);
          }
          const geo = new THREE.BufferGeometry();
          geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
          const mat = new THREE.LineBasicMaterial({ color: colors[k], transparent: true, opacity: 0.16 });
          const line = new THREE.LineLoop(geo, mat);
          line.rotation.z = tilt;
          system.add(line);
          return { line, mat };
        });

        // ── Core glow (behind the founder portrait) + channel nodes + signals.
        const core = pointCloud(2);
        core.c.set([1, 0.8, 0.45, 0.45, 0.6, 1], 0);
        system.add(new THREE.Points(core.geo, glowMat));
        const nodes = pointCloud(K);
        CHANNEL_KEYS.forEach((_, k) => nodes.c.set([colors[k].r, colors[k].g, colors[k].b], k * 3));
        system.add(new THREE.Points(nodes.geo, glowMat));
        const sig = pointCloud(K * SIGNALS);
        for (let k = 0; k < K; k++)
          for (let i = 0; i < SIGNALS; i++) sig.c.set([colors[k].r, colors[k].g, colors[k].b], (k * SIGNALS + i) * 3);
        system.add(new THREE.Points(sig.geo, glowMat));

        const nodePos = CHANNEL_KEYS.map(() => new THREE.Vector3());
        const tiltQ = CHANNEL_KEYS.map((_, k) => new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), orbitOf(k).tilt));
        const lit = new Float32Array(K).fill(0);

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

        const pointer = { x: 0, y: 0 };
        const onMove = (e: PointerEvent) => {
          const r = host.getBoundingClientRect();
          pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
          pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        };
        host.addEventListener("pointermove", onMove);

        // spin = shared orbital phase; picking a channel eases it so that
        // channel sits at the front, then holds there.
        let spin = 0;
        let last = performance.now();
        const v = new THREE.Vector3();
        const ctrl = new THREE.Vector3();
        let raf = 0;
        const frame = (now: number) => {
          raf = requestAnimationFrame(frame);
          if (!visible) return;
          const dt = Math.min(0.05, (now - last) / 1000);
          last = now;
          const time = reduce ? 0 : now / 1000;
          const act = activeRef.current;

          if (act < 0) {
            if (!reduce) spin += dt * 0.16;
          } else {
            const target = FRONT - orbitOf(act).phase;
            let d = (target - spin) % (Math.PI * 2);
            if (d > Math.PI) d -= Math.PI * 2;
            if (d < -Math.PI) d += Math.PI * 2;
            spin += reduce ? d : d * Math.min(1, dt * 3.2);
          }
          if (!reduce) {
            system.rotation.y += (pointer.x * 0.18 - system.rotation.y) * 0.05;
            system.rotation.x += (1.08 + pointer.y * 0.1 - system.rotation.x) * 0.05;
          }

          const pulse = reduce ? 1 : 1 + Math.sin(time * 2.2) * 0.06;
          core.s[0] = 150 * pulse;
          core.a[0] = 0.55;
          core.s[1] = 260;
          core.a[1] = 0.22;
          core.flag();

          const w = host.clientWidth, h = host.clientHeight;
          for (let k = 0; k < K; k++) {
            const { r, phase } = orbitOf(k);
            const a = phase + spin;
            nodePos[k].set(Math.cos(a) * r, 0, Math.sin(a) * r).applyQuaternion(tiltQ[k]);
            nodes.p.set([nodePos[k].x, nodePos[k].y, nodePos[k].z], k * 3);
            lit[k] += ((k === act ? 1 : 0) - lit[k]) * Math.min(1, dt * 5);
            nodes.s[k] = 46 + lit[k] * 34 + (reduce ? 0 : Math.sin(time * 3 + k) * 3);
            nodes.a[k] = 0.75 + lit[k] * 0.25;
            rings[k].mat.opacity = 0.14 + lit[k] * 0.4;

            // Signals: node → core along a gentle arc, brighter for the picked channel.
            ctrl.copy(nodePos[k]).multiplyScalar(0.5).add(new THREE.Vector3(0, 0.55, 0));
            for (let i = 0; i < SIGNALS; i++) {
              const j = k * SIGNALS + i;
              const u = reduce ? i / SIGNALS : (time * (0.16 + lit[k] * 0.22) + i / SIGNALS) % 1;
              const m = 1 - u;
              v.copy(nodePos[k]).multiplyScalar(m * m).addScaledVector(ctrl, 2 * m * u);
              sig.p.set([v.x, v.y, v.z], j * 3);
              sig.a[j] = Math.sin(u * Math.PI) * (act < 0 ? 0.45 : 0.16 + lit[k] * 0.8);
              sig.s[j] = 9 + lit[k] * 7;
            }

            const el = nodeBtns.current[k];
            if (el) {
              v.copy(nodePos[k]);
              system.localToWorld(v);
              const depth = v.z;
              v.project(camera);
              const back = depth < 0;
              el.style.transform = `translate(${(v.x * 0.5 + 0.5) * w}px, ${(-v.y * 0.5 + 0.5) * h}px) translate(-50%, -50%) scale(${back ? 0.86 : 1})`;
              el.style.opacity = back && k !== act ? "0.55" : "1";
              el.style.zIndex = back ? "1" : "3";
            }
          }
          nodes.flag();
          sig.flag();
          renderer.render(scene, camera);
        };
        raf = requestAnimationFrame(frame);

        cleanup = () => {
          cancelAnimationFrame(raf);
          ro.disconnect();
          vis.disconnect();
          host.removeEventListener("pointermove", onMove);
          [dust, core, nodes, sig].forEach((x) => x.geo.dispose());
          rings.forEach(({ line, mat }) => {
            line.geometry.dispose();
            mat.dispose();
          });
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
    <section ref={sectionRef} id={id} className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_40%,rgba(66,133,244,0.18),transparent_60%)]"
      />
      <Container className="relative grid gap-10 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} sub={t("sub")} tone="dark" />

          <div className="relative mx-auto aspect-square w-full max-w-[520px] select-none">
            <div ref={hostRef} className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/founder/tang-tri-duc.png"
              alt=""
              className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full object-cover object-top ring-2 ring-gold-400/80 shadow-[0_0_40px_rgba(240,192,105,0.45)] sm:h-28 sm:w-28"
            />
            {CHANNEL_KEYS.map((key, k) => {
              const Icon = ICONS[key];
              const on = key === active;
              return (
                <button
                  key={key}
                  ref={(el) => {
                    nodeBtns.current[k] = el;
                  }}
                  type="button"
                  tabIndex={-1}
                  aria-hidden
                  onClick={() => pick(key, "orbit")}
                  className={`absolute left-0 top-0 flex items-center gap-1.5 rounded-full py-1 pl-1 pr-3 text-xs font-semibold backdrop-blur transition-[background-color,box-shadow] sm:text-sm ${
                    on ? "bg-white text-ink shadow-lg" : "bg-ink/70 text-white ring-1 ring-white/15 hover:bg-ink"
                  }`}
                  style={{ transform: "translate(-200px,-200px)" }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-ink"
                    style={{ backgroundColor: CHANNEL_MAP[key].color }}
                  >
                    <Icon size={15} aria-hidden />
                  </span>
                  {t(`items.${key}.label`)}
                </button>
              );
            })}
          </div>

          <div role="tablist" aria-label={t("tablist")} className="grid grid-cols-5 gap-2">
            {CHANNEL_KEYS.map((key) => {
              const Icon = ICONS[key];
              const on = key === active;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  id={`${id}-tab-${key}`}
                  aria-selected={on}
                  aria-controls={`${id}-panel`}
                  onClick={() => pick(key, "tab")}
                  className={`flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-xs font-semibold transition-colors ${
                    on ? "bg-white text-ink" : "bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
                  }`}
                >
                  <Icon size={18} aria-hidden style={{ color: on ? undefined : CHANNEL_MAP[key].color }} />
                  {t(`items.${key}.label`)}
                </button>
              );
            })}
          </div>
        </div>

        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
          className="flex flex-col gap-5 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-7 lg:sticky lg:top-24"
        >
          <PanelHeader channel={active} title={t(`items.${active}.title`)} note={t(`items.${active}.note`)} />
          {active === "video" && <VideoPanel videos={videos} />}
          {active === "facebook" && <FacebookPanel />}
          {active === "zalo" && <ZaloPanel />}
          {active === "phone" && <PhonePanel onZalo={() => pick("zalo", "tab")} />}
          {active === "visit" && <VisitPanel />}
        </div>
      </Container>
    </section>
  );
}

function PanelHeader({ channel, title, note }: { channel: ChannelKey; title: string; note: string }) {
  const Icon = ICONS[channel];
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink"
        style={{ backgroundColor: CHANNEL_MAP[channel].color }}
      >
        <Icon size={20} aria-hidden />
      </span>
      <div>
        <h3 className="font-display text-xl font-bold leading-tight sm:text-2xl">{title}</h3>
        <p className="mt-1 text-sm text-white/65">{note}</p>
      </div>
    </div>
  );
}

const outbound = (channel: ChannelKey) => () => trackEvent("channel_out", { channel });

function VideoPanel({ videos }: { videos: ChannelVideo[] }) {
  const t = useTranslations("channels");
  const topics = useMemo(() => VIDEO_TOPICS.filter((tp) => videos.some((v) => v.topic === tp)), [videos]);
  const [topic, setTopic] = useState<string>("all");
  const list = topic === "all" ? videos : videos.filter((v) => v.topic === topic);
  const [currentId, setCurrentId] = useState(videos[0]?.id);
  const [playing, setPlaying] = useState(false);
  const current = list.find((v) => v.id === currentId) ?? list[0];

  const choose = (v: ChannelVideo) => {
    setCurrentId(v.id);
    setPlaying(true);
    trackEvent("video_play", { id: v.id, from: "list" });
  };

  return (
    <div className="flex flex-col gap-4">
      {topics.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {["all", ...topics].map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => {
                setTopic(tp);
                setPlaying(false);
                const first = tp === "all" ? videos[0] : videos.find((v) => v.topic === tp);
                if (first) setCurrentId(first.id);
              }}
              className={`rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                topic === tp ? "bg-gold-400 text-ink" : "bg-white/5 text-white/80 ring-1 ring-white/10 hover:bg-white/10"
              }`}
            >
              {t(`topics.${tp}`)}
            </button>
          ))}
        </div>
      )}

      {current && (
        <div className={`grid gap-4 ${current.vertical ? "sm:grid-cols-[minmax(0,260px)_1fr]" : ""}`}>
          <VideoPlayer
            key={current.id}
            video={current}
            playing={playing}
            onPlay={() => {
              setPlaying(true);
              trackEvent("video_play", { id: current.id, from: "player" });
            }}
          />
          <ul aria-label={t("playlist")} className="flex max-h-[440px] flex-col gap-1.5 overflow-y-auto pr-1">
            {list.map((v) => {
              const src = videoSource(v);
              const on = v.id === current.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => choose(v)}
                    className={`flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors ${
                      on ? "bg-white/12 ring-1 ring-gold-400/60" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="relative h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/10">
                      {src?.kind === "youtube" && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={`https://i.ytimg.com/vi/${src.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug">{v.title}</span>
                      {v.views && <span className="text-xs text-white/50">{t("views", { n: v.views })}</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3 border-t border-white/10 pt-4">
        <a
          href={COMPANY.youtube}
          target="_blank"
          rel="noopener noreferrer"
          onClick={outbound("video")}
          className="inline-flex items-center gap-2 rounded-full bg-[#ff4d4d] px-4 py-2.5 text-sm font-bold text-white hover:brightness-110"
        >
          <YoutubeIcon size={18} aria-hidden /> {t("youtubeChannel")}
        </a>
        <a
          href={`${COMPANY.youtube}?sub_confirmation=1`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={outbound("video")}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/25 hover:bg-white/10"
        >
          {t("youtubeSubscribe")}
        </a>
      </div>
    </div>
  );
}

function VideoPlayer({ video, playing, onPlay }: { video: ChannelVideo; playing: boolean; onPlay: () => void }) {
  const t = useTranslations("channels");
  const src = videoSource(video);
  const frame = `relative w-full overflow-hidden rounded-xl bg-black ring-1 ring-white/10 ${
    video.vertical ? "mx-auto aspect-[9/16] max-w-[260px]" : "aspect-video"
  }`;
  if (!src) return null;

  if (playing) {
    const iframe =
      src.kind === "youtube"
        ? `https://www.youtube-nocookie.com/embed/${src.id}?autoplay=1&playsinline=1&rel=0`
        : src.kind === "facebook"
          ? `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(src.url)}&show_text=false&autoplay=true`
          : null;
    return (
      <div className={frame}>
        {iframe ? (
          <iframe
            src={iframe}
            title={video.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
        ) : (
          <video src={src.kind === "file" ? src.url : undefined} controls autoPlay playsInline className="absolute inset-0 h-full w-full object-contain" />
        )}
      </div>
    );
  }

  return (
    <button type="button" onClick={onPlay} aria-label={`${t("play")}: ${video.title}`} className={`${frame} group`}>
      {src.kind === "youtube" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`https://i.ytimg.com/vi/${src.id}/hqdefault.jpg`} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
      )}
      {src.kind === "file" && <video src={src.url} preload="metadata" muted playsInline className="absolute inset-0 h-full w-full object-cover" />}
      {src.kind === "facebook" && (
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1b3c7a] to-ink">
          <FacebookIcon size={48} className="text-white/40" />
        </span>
      )}
      <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
      <PlayCircle size={60} strokeWidth={1.4} aria-hidden className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg transition-transform group-hover:scale-110" />
      <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-bold leading-snug">{video.title}</span>
    </button>
  );
}

function FacebookPanel() {
  const t = useTranslations("channels");
  const plugin = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(COMPANY.fanpage)}&tabs=timeline&width=500&height=520&small_header=true&adapt_container_width=true&hide_cta=false`;
  return (
    <div className="flex flex-col gap-4">
      <div className="relative overflow-hidden rounded-xl bg-white">
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 px-6 text-center text-sm text-ink-muted">{t("fanpageFallback")}</p>
        <iframe
          src={plugin}
          title="Fanpage Trí Đức Car Media"
          loading="lazy"
          className="relative h-[520px] w-full"
          allow="encrypted-media"
        />
      </div>
      <a
        href={COMPANY.fanpage}
        target="_blank"
        rel="noopener noreferrer"
        onClick={outbound("facebook")}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#4c8dff] px-5 py-3 text-sm font-bold text-white hover:brightness-110"
      >
        <FacebookIcon size={18} /> {t("fanpageOpen")}
      </a>
    </div>
  );
}

function ZaloPanel() {
  const t = useTranslations("channels");
  const starters = t.raw("starters") as string[];
  const [copied, setCopied] = useState(-1);

  const copyStarter = async (i: number) => {
    try {
      await navigator.clipboard.writeText(starters[i]);
      setCopied(i);
    } catch {
      setCopied(-1);
    }
    trackEvent("zalo_starter", { index: i });
  };

  return (
    <div className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
      <figure className="mx-auto flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/zalo-qr.svg" alt={t("qrAlt")} className="h-44 w-44 rounded-xl bg-white p-2.5" />
        <figcaption className="text-xs text-white/60">{t("qrCaption")}</figcaption>
      </figure>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-white/85">{t("starterTitle")}</p>
        {starters.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => copyStarter(i)}
            className={`flex items-start gap-2 rounded-xl p-3 text-left text-sm leading-snug transition-colors ${
              copied === i ? "bg-[#35b6ff]/15 ring-1 ring-[#35b6ff]/60" : "bg-white/5 ring-1 ring-white/10 hover:bg-white/10"
            }`}
          >
            {copied === i ? <Check size={16} className="mt-0.5 shrink-0 text-[#35b6ff]" aria-hidden /> : <MessageCircle size={16} className="mt-0.5 shrink-0 text-white/50" aria-hidden />}
            <span>“{s}”</span>
          </button>
        ))}
        <p aria-live="polite" className="min-h-5 text-xs font-semibold text-[#35b6ff]">
          {copied >= 0 ? t("copied") : ""}
        </p>
        <a
          href={COMPANY.zalo}
          target="_blank"
          rel="noopener noreferrer"
          onClick={outbound("zalo")}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[#35b6ff] px-5 py-3 text-sm font-bold text-ink hover:brightness-110"
        >
          <MessageCircle size={18} aria-hidden /> {t("zaloOpen")}
        </a>
      </div>
    </div>
  );
}

function PhonePanel({ onZalo }: { onZalo: () => void }) {
  const t = useTranslations("channels");
  return (
    <div className="flex flex-col gap-5">
      <a
        href={`tel:${COMPANY.phone}`}
        onClick={outbound("phone")}
        className="flex items-center gap-4 rounded-2xl bg-gold-400/10 p-5 ring-1 ring-gold-400/40 transition-colors hover:bg-gold-400/15"
      >
        <Phone size={30} className="text-gold-400" aria-hidden />
        <span className="font-display text-3xl font-bold tracking-wide text-gold-400 sm:text-4xl">{COMPANY.phoneDisplay}</span>
      </a>
      <p className="text-sm text-white/70">{t("phoneNote")}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onZalo}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10"
        >
          <MessageCircle size={16} aria-hidden /> {t("phoneToZalo")}
        </button>
        <a
          href={`mailto:${COMPANY.email}`}
          onClick={outbound("phone")}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 ring-white/25 hover:bg-white/10"
        >
          <Mail size={16} aria-hidden /> {t("emailLabel")}: {COMPANY.email}
        </a>
      </div>
    </div>
  );
}

function VisitPanel() {
  const t = useTranslations("channels");
  return (
    <div className="flex flex-col gap-4">
      <ul className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {PHOTOS.map((p) => (
          <li key={p} className="w-40 shrink-0 snap-start sm:w-44">
            <figure className="flex flex-col gap-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/behind/${p}.webp`} alt={t(`photos.${p}`)} loading="lazy" className="aspect-[4/5] w-full rounded-xl object-cover ring-1 ring-white/10" />
              <figcaption className="text-xs leading-snug text-white/65">{t(`photos.${p}`)}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="text-xs text-white/50">{t("visitCaption")}</p>
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/booking"
          onClick={outbound("visit")}
          className="inline-flex items-center gap-2 rounded-full bg-[#7be0b4] px-5 py-3 text-sm font-bold text-ink hover:brightness-110"
        >
          <CalendarCheck size={18} aria-hidden /> {t("book")}
        </Link>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddressLine)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-white/75 underline-offset-4 hover:underline"
        >
          <MapPin size={16} aria-hidden /> {t("office")}: {companyAddressLine}
        </a>
      </div>
    </div>
  );
}
