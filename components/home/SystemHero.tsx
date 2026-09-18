"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import styles from "./SystemHero.module.css";
import { CAP_LAYOUT, SATELLITE_POS } from "./systemHeroLayout";

type Props = {
  /** Anchor the "Skip, view services" link scrolls to. */
  skipHref?: string;
};

type CapMsg = {
  kicker?: string;
  title: string;
  titleHtml?: string;
  body?: string;
  counter?: string;
};

type Strand = {
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  label: string;
  born: number;
  rel: number;
  sat: number;
  ph: number;
  sp: number;
};

const BRASS: [number, number, number, number] = [214, 163, 74, 1];
const VERM: [number, number, number, number] = [199, 69, 47, 1];
const JADE: [number, number, number, number] = [62, 158, 138, 1];

export default function SystemHero({ skipHref = "#tru-cot" }: Props) {
  const t = useTranslations("systemHero");
  const open = {
    eyebrow: t("open.eyebrow"),
    title: t("open.title"),
    sub: t("open.sub"),
    scrollHint: t("open.scrollHint"),
  };
  const caps = t.raw("caps") as CapMsg[];
  const satelliteLabels = t.raw("satellites") as string[];
  const satellites = SATELLITE_POS.map((pos, i) => ({ ...pos, label: satelliteLabels[i] }));
  const tasks = t.raw("tasks") as string[];
  const core = t.raw("core") as string[];

  const stageRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const openRef = useRef<HTMLDivElement | null>(null);
  const hintRef = useRef<HTMLDivElement | null>(null);
  const cntRef = useRef<HTMLElement | null>(null);
  const capRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const cv = canvasRef.current;
    const stage = stageRef.current;
    if (!cv || !stage) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Canvas's `font` setter can't resolve CSS var() references, so the
    // actual font stacks are read once from the resolved custom properties.
    const rootStyle = getComputedStyle(document.documentElement);
    const sansFamily = rootStyle.getPropertyValue("--td-sans").trim() || '"Be Vietnam Pro", system-ui, sans-serif';

    let W = 0, H = 0, cx = 0, cy = 0, dpr = 1, isMobile = false, f = 900;
    let N = 25;
    let strands: Strand[] = [];
    let raf = 0;

    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const sstep = (a: number, b: number, v: number) => {
      const t2 = clamp((v - a) / (b - a), 0, 1);
      return t2 * t2 * (3 - 2 * t2);
    };
    const lerp = (a: number, b: number, t2: number) => a + (b - a) * t2;
    const mix = (
      c1: [number, number, number, number],
      c2: [number, number, number, number],
      t2: number
    ) =>
      "rgba(" + Math.round(lerp(c1[0], c2[0], t2)) + "," +
      Math.round(lerp(c1[1], c2[1], t2)) + "," +
      Math.round(lerp(c1[2], c2[2], t2)) + "," +
      lerp(c1[3], c2[3], t2).toFixed(3) + ")";

    function buildStrands() {
      strands = [];
      const n = N;
      const ga = 2.39996;
      for (let i = 0; i < n; i++) {
        const t2 = (i + 0.5) / n;
        const phi = Math.acos(1 - 2 * t2);
        const th = ga * i;
        const R = 520 + ((i * 37) % 110);
        const x = R * Math.sin(phi) * Math.cos(th);
        const y = R * Math.cos(phi) * 0.62 + 40;
        let z = R * Math.sin(phi) * Math.sin(th) * 0.55;
        if (z < -260) z = -260 + ((i * 19) % 60);
        strands.push({
          ax: x, ay: y, az: z,
          bx: ((i * 13) % 40) - 20,
          by: 60 - ((i * 23) % 110),
          bz: ((i * 17) % 50) - 25,
          label: i < 3 ? core[i] : tasks[i % tasks.length],
          born: i < 3 ? 0 : 0.13 + (i / n) * 0.24,
          rel: i < 3 ? 2 : 0.5 + ((i - 3) / (n - 3)) * 0.15,
          sat: i % 4,
          ph: (i * 0.137) % 1,
          sp: 0.22 + ((i * 7) % 13) / 40,
        });
      }
    }

    function resize() {
      isMobile = window.innerWidth < 760;
      N = isMobile ? 13 : 25;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
      W = cv!.clientWidth; H = cv!.clientHeight;
      if (!W || !H) return;
      cv!.width = Math.round(W * dpr);
      cv!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      f = Math.max(600, Math.min(W, H) * 1.15);
      buildStrands();
    }

    let rotY = 0, rotYT = 0, rotX = 0, rotXT = 0, camD = 900;
    function project(x: number, y: number, z: number) {
      const cs = Math.cos(rotY), sn = Math.sin(rotY);
      const X = x * cs - z * sn;
      let Z = x * sn + z * cs;
      const c2 = Math.cos(rotX), s2 = Math.sin(rotX);
      const Y = y * c2 - Z * s2;
      Z = y * s2 + Z * c2;
      let d = Z + camD;
      if (d < 80) d = 80;
      const s = f / d;
      return { x: cx + X * s, y: cy - Y * s, s };
    }

    let pT = 0, p = 0;
    function readScroll() {
      const r = stage!.getBoundingClientRect();
      const total = stage!.offsetHeight - window.innerHeight;
      pT = clamp(-r.top / (total || 1), 0, 1);
    }

    function onMove(e: PointerEvent) {
      if (isMobile) return;
      rotYT = (e.clientX / window.innerWidth - 0.5) * 0.34;
      rotXT = (e.clientY / window.innerHeight - 0.5) * -0.16;
    }

    function bandOp(v: number, a: number, b: number) {
      const fd = 0.028;
      if (v < a - fd || v > b + fd) return 0;
      if (v < a) return (v - (a - fd)) / fd;
      if (v > b) return 1 - (v - b) / fd;
      return 1;
    }

    function roundRect(x: number, y: number, w: number, h: number, r: number) {
      ctx!.beginPath();
      ctx!.moveTo(x + r, y); ctx!.lineTo(x + w - r, y);
      ctx!.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx!.lineTo(x + w, y + h - r);
      ctx!.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx!.lineTo(x + r, y + h);
      ctx!.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx!.lineTo(x, y + r);
      ctx!.quadraticCurveTo(x, y, x + r, y);
      ctx!.closePath();
    }

    let tAnim = 0, last = 0;

    function frame(ts: number) {
      const dt = Math.min(0.05, (ts - last) / 1000 || 0);
      last = ts;
      if (!W || !H) { raf = requestAnimationFrame(frame); return; }

      p += (pT - p) * (reduce ? 1 : 0.085);
      rotY += (rotYT - rotY) * 0.055;
      rotX += (rotXT - rotX) * 0.055;

      const tension = sstep(0.15, 0.395, p);
      const frozen = p >= 0.398 && p <= 0.492;
      const tScale = frozen ? 0 : 1 + tension * 2.4;
      if (!reduce) tAnim += dt * tScale;

      const rise = sstep(0.7, 0.83, p);
      const pull = sstep(0.86, 1.0, p);
      camD = lerp(900, 1850, pull);

      const night = sstep(0.06, 0.4, p) * (1 - rise * 0.55);
      const g = ctx!.createRadialGradient(cx, cy * 0.92, 20, cx, cy, Math.max(W, H) * 0.85);
      g.addColorStop(0, mix([26, 48, 54, 1], [16, 28, 36, 1], night));
      g.addColorStop(1, mix([11, 25, 29, 1], [6, 12, 16, 1], night));
      ctx!.fillStyle = g;
      ctx!.fillRect(0, 0, W, H);

      const satOn = sstep(0.48, 0.56, p) * (1 - sstep(0.9, 1, p) * 0.5);
      if (satOn > 0.01) {
        for (const S of satellites) {
          const ps = project(S.x, S.y, S.z);
          const r = 16 * ps.s * 0.9 + 6;
          ctx!.beginPath(); ctx!.arc(ps.x, ps.y, r, 0, 6.284);
          ctx!.fillStyle = "rgba(62,158,138," + 0.14 * satOn + ")"; ctx!.fill();
          ctx!.beginPath(); ctx!.arc(ps.x, ps.y, r * 0.42, 0, 6.284);
          ctx!.fillStyle = "rgba(62,158,138," + 0.85 * satOn + ")"; ctx!.fill();
          ctx!.font = "500 " + (isMobile ? 10 : 12) + "px " + sansFamily;
          ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillStyle = "rgba(233,228,215," + 0.78 * satOn + ")";
          ctx!.fillText(S.label, ps.x, ps.y + r + 14);
        }
      }

      const figY = rise * 70;
      let tilt = tension * 0.14 * (1 - rise);
      if (!reduce && !frozen) tilt += Math.sin(tAnim * 7.3) * 0.012 * tension * (1 - rise);
      const base = project(0, -150 + figY, 0);
      const top = project(0, 190 + figY, 0);
      const sc = (base.y - top.y) / 340;

      let remaining = 0;
      let chips = 0;
      const chipMax = isMobile ? 6 : 11;

      for (let i = 0; i < strands.length; i++) {
        const st = strands[i];
        const appear = sstep(st.born, st.born + 0.05, p);
        if (appear <= 0.005) continue;
        const released = p > st.rel ? clamp((p - st.rel) / 0.055, 0, 1) : 0;
        if (released < 1) remaining++;

        const sat = satellites[st.sat];
        let ex = st.ax, ey = st.ay, ez = st.az;
        if (released > 0) {
          const e2 = released * released * (3 - 2 * released);
          ex = lerp(st.ax, sat.x, e2); ey = lerp(st.ay, sat.y, e2); ez = lerp(st.az, sat.z, e2);
        }
        const attX = lerp(st.bx, sat.x, released);
        const attY = lerp(st.by, sat.y, released) + figY * (1 - released);
        const attZ = lerp(st.bz, sat.z, released);

        const A = project(ex, ey, ez);
        const B = project(attX, attY, attZ);
        const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2;
        const dx = B.x - A.x, dy = B.y - A.y;
        const len = Math.hypot(dx, dy) || 1;
        const bow = (1 - tension * 0.85) * (len * 0.1) + released * len * 0.22;
        const ctrlX = mx + (-dy / len) * bow;
        const ctrlY = my + (dx / len) * bow;

        const col =
          released > 0.02 ? mix(VERM, JADE, released) : mix(BRASS, VERM, tension * (1 - rise * 0.9));
        let alpha = (0.2 + tension * 0.34) * appear * (1 - released * 0.45);
        if (i < 3) alpha = (0.3 + rise * 0.45) * appear;

        ctx!.beginPath();
        ctx!.moveTo(A.x, A.y);
        ctx!.quadraticCurveTo(ctrlX, ctrlY, B.x, B.y);
        ctx!.strokeStyle = col.replace(/[\d.]+\)$/, alpha.toFixed(3) + ")");
        ctx!.lineWidth = (i < 3 ? 1.9 : 1.15) * Math.min(1.4, A.s * 0.9);
        ctx!.stroke();

        ctx!.beginPath();
        ctx!.arc(A.x, A.y, (i < 3 ? 3.2 : 2.2) * Math.min(1.5, A.s), 0, 6.284);
        ctx!.fillStyle = col.replace(/[\d.]+\)$/, (alpha * 1.9).toFixed(3) + ")");
        ctx!.fill();

        if (chips < chipMax && released < 0.1 && len > 70 && appear > 0.6) {
          const u = (tAnim * st.sp + st.ph) % 1;
          const iu = 1 - u;
          const px = iu * iu * A.x + 2 * iu * u * ctrlX + u * u * B.x;
          const py = iu * iu * A.y + 2 * iu * u * ctrlY + u * u * B.y;
          const fade = Math.sin(u * Math.PI);
          const fs = isMobile ? 9.5 : 11.5;
          ctx!.font = "400 " + fs + "px " + sansFamily;
          const tw = ctx!.measureText(st.label).width;
          const pw = tw + 14, ph2 = fs + 11;
          const a2 = fade * appear * (0.55 + tension * 0.4);
          ctx!.fillStyle = "rgba(10,20,25," + a2 * 0.8 + ")";
          roundRect(px - pw / 2, py - ph2 / 2, pw, ph2, 3); ctx!.fill();
          ctx!.strokeStyle = col.replace(/[\d.]+\)$/, (a2 * 0.5).toFixed(3) + ")");
          ctx!.lineWidth = 1;
          roundRect(px - pw / 2, py - ph2 / 2, pw, ph2, 3); ctx!.stroke();
          ctx!.fillStyle = "rgba(233,228,215," + a2 * 0.92 + ")";
          ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillText(st.label, px, py + 0.5);
          chips++;
        }

        if (i < 3 && rise > 0.15) {
          ctx!.font = "500 " + (isMobile ? 10.5 : 12.5) + "px " + sansFamily;
          ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillStyle = "rgba(231,196,137," + rise * 0.9 + ")";
          ctx!.fillText(st.label, A.x, A.y - 14);
        }
      }

      // owner figure
      ctx!.save();
      ctx!.translate(base.x, base.y);
      ctx!.rotate(tilt);
      ctx!.scale(sc, sc);
      const warm = lerp(0.25, 1, Math.max(1 - tension, rise));
      const glow = ctx!.createRadialGradient(0, -150, 4, 0, -150, 300);
      glow.addColorStop(
        0,
        "rgba(" + Math.round(lerp(150, 231, warm)) + "," +
        Math.round(lerp(90, 196, warm)) + "," +
        Math.round(lerp(70, 137, warm)) + ",0.34)"
      );
      glow.addColorStop(1, "rgba(214,163,74,0)");
      ctx!.fillStyle = glow;
      ctx!.beginPath(); ctx!.arc(0, -150, 300, 0, 6.284); ctx!.fill();

      const body = ctx!.createLinearGradient(0, -330, 0, 10);
      body.addColorStop(0, mix([231, 196, 137, 1], [242, 226, 196, 1], warm));
      body.addColorStop(1, mix([120, 86, 60, 1], [176, 132, 74, 1], warm));
      ctx!.fillStyle = body;
      ctx!.beginPath(); ctx!.arc(0, -268, 40, 0, 6.284); ctx!.fill();
      ctx!.beginPath();
      ctx!.moveTo(-34, -212);
      ctx!.quadraticCurveTo(-56, -120, -46, 0);
      ctx!.lineTo(46, 0);
      ctx!.quadraticCurveTo(56, -120, 34, -212);
      ctx!.quadraticCurveTo(0, -238, -34, -212);
      ctx!.closePath(); ctx!.fill();
      ctx!.restore();

      if (p > 0.396 && p < 0.418) {
        const fl = 1 - (p - 0.396) / 0.022;
        ctx!.fillStyle = "rgba(199,69,47," + fl * 0.1 + ")";
        ctx!.fillRect(0, 0, W, H);
      }

      // HTML overlay
      const openOp = 1 - sstep(0, 0.045, p);
      if (openRef.current) {
        openRef.current.style.opacity = String(openOp);
        openRef.current.style.transform = "translateY(" + -p * 40 + "px)";
      }
      if (hintRef.current) hintRef.current.style.opacity = String(openOp);

      capRefs.current.forEach((el, k) => {
        if (!el) return;
        const o = bandOp(p, CAP_LAYOUT[k].from, CAP_LAYOUT[k].to);
        el.style.opacity = String(o);
        el.style.transform = "translateY(" + (1 - o) * 14 + "px)";
      });

      if (cntRef.current) cntRef.current.textContent = String(Math.max(3, remaining));

      raf = requestAnimationFrame(frame);
    }

    const onResize = () => { resize(); readScroll(); };
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onMove, { passive: true });

    resize();
    readScroll();
    raf = requestAnimationFrame((t2) => { last = t2; frame(t2); });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
    };
    // Coordinates, task labels and translated copy are read once on mount;
    // the canvas loop reads DOM refs for anything that can change later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className={styles.stage} ref={stageRef} aria-label={t("ariaLabel")}>
      <div className={styles.sticky}>
        <canvas className={styles.canvas} ref={canvasRef} aria-hidden="true" />
        <div className={styles.vignette} aria-hidden="true" />
        <div className={styles.grain} aria-hidden="true" />

        <div className={styles.open} ref={openRef}>
          <span className={styles.eyebrow}>{open.eyebrow}</span>
          <h1>{open.title}</h1>
          <p className={styles.sub}>{open.sub}</p>
        </div>

        <div className={styles.caps}>
          {caps.map((c, i) => (
            <div
              key={i}
              ref={(el) => { capRefs.current[i] = el; }}
              className={CAP_LAYOUT[i].hit ? `${styles.cap} ${styles.hit}` : styles.cap}
            >
              {c.kicker && <span className={styles.kicker}>{c.kicker}</span>}
              {c.titleHtml ? (
                <h2 dangerouslySetInnerHTML={{ __html: c.titleHtml }} />
              ) : (
                <h2>{c.title}</h2>
              )}
              {c.body && <p>{c.body}</p>}
              {c.counter && (
                <div className={styles.counter}>
                  <b ref={cntRef}>25</b>
                  <span>{c.counter}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.hint} ref={hintRef}>
          <span>{open.scrollHint}</span>
          <i />
        </div>

        <a className={styles.skip} href={skipHref}>{t("skip")}</a>
      </div>
    </section>
  );
}
