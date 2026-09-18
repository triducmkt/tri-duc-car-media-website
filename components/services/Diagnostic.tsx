"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./Diagnostic.module.css";
import {
  MODULE_LAYOUT, EDGES, DEPENDENCIES, PRIORITY, PACKAGE_FOR_MODULE, QUESTION_MODULES, OPTION_SCORES,
  type ModuleKey,
} from "./diagnosticLayout";

type State = "unknown" | "good" | "warn" | "bad";
type ModState = { k: ModuleKey; n: string; x: number; y: number; z: number; score: number | null; state: State; flash: number };
type Question = { m: ModuleKey; t: string; o: [string, 0 | 1 | 2][] };
type QuestionMsg = { text: string; options: [string, string, string] };

type Props = {
  /** Called when the user submits the lead form. Return true on success. */
  onSubmitLead?: (lead: { name: string; phone: string; score: number; bottleneck: ModuleKey }) => Promise<boolean>;
  /** Called whenever a result is available, to highlight the matching package outside. */
  onResult?: (pkgKey: string) => void;
};

const COL: Record<State, [number, number, number]> = {
  unknown: [78, 94, 102],
  good: [62, 158, 138],
  warn: [214, 163, 74],
  bad: [199, 69, 47],
};

export default function Diagnostic({ onSubmitLead, onResult }: Props) {
  const t = useTranslations("diagnostic");
  const moduleNames = t.raw("moduleNames") as Record<ModuleKey, string>;
  const notes = t.raw("notes") as Record<ModuleKey, string>;
  const recommend = t.raw("recommend") as Record<ModuleKey, { name: string; why: string }>;
  const questionMsgs = t.raw("questions") as QuestionMsg[];
  const noteOk = t("noteOk");
  const coveringFor = t("coveringFor");

  const QUESTIONS: Question[] = useMemo(
    () =>
      questionMsgs.map((q, i) => ({
        m: QUESTION_MODULES[i],
        t: q.text,
        o: q.options.map((label, k) => [label, OPTION_SCORES[k]]) as [string, 0 | 1 | 2][],
      })),
    [questionMsgs],
  );

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const modsRef = useRef<ModState[]>(
    MODULE_LAYOUT.map((m) => ({ ...m, n: moduleNames[m.k], score: null, state: "unknown" as State, flash: 0 }))
  );
  const scoreRef = useRef<number | null>(null);
  const doneAtRef = useRef(-1);
  const scanRef = useRef(-1);

  const [phase, setPhase] = useState<"idle" | "quiz" | "done">("idle");
  const [qi, setQi] = useState(0);
  const [note, setNote] = useState<{ html: string; ok: boolean } | null>(null);
  const [result, setResult] = useState<{ score: number; key: ModuleKey } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<null | "ok" | "err">(null);
  const answersRef = useRef<Partial<Record<ModuleKey, number[]>>>({});

  /* ---------------- canvas ---------------- */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Canvas's `font` setter can't resolve CSS var() references, so the
    // actual font stacks are read once from the resolved custom properties.
    const rootStyle = getComputedStyle(document.documentElement);
    const sansFamily = rootStyle.getPropertyValue("--td-sans").trim() || '"Be Vietnam Pro", system-ui, sans-serif';
    const serifFamily = rootStyle.getPropertyValue("--td-serif").trim() || '"Playfair Display", Georgia, serif';

    let W = 0, H = 0, cx = 0, cy = 0, dpr = 1, f = 800, isMobile = false, raf = 0;
    let rotY = 0, rotYT = 0, rotX = 0, rotXT = 0, tA = 0, t0 = 0;

    const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
    const sstep = (a: number, b: number, v: number) => {
      const t2 = clamp((v - a) / (b - a), 0, 1);
      return t2 * t2 * (3 - 2 * t2);
    };
    const rgba = (c: [number, number, number], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    function resize() {
      isMobile = window.innerWidth < 620;
      dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.75 : 2);
      W = cv!.clientWidth; H = cv!.clientHeight;
      if (!W || !H) return;
      cv!.width = Math.round(W * dpr);
      cv!.height = Math.round(H * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      f = Math.min(W, H) * 1.55;
    }

    function project(x: number, y: number, z: number) {
      const cs = Math.cos(rotY), sn = Math.sin(rotY);
      const X = x * cs - z * sn;
      let Z = x * sn + z * cs;
      const c2 = Math.cos(rotX), s2 = Math.sin(rotX);
      const Y = y * c2 - Z * s2;
      Z = y * s2 + Z * c2;
      let d = Z + 780;
      if (d < 80) d = 80;
      const s = f / d;
      return { x: cx + X * s, y: cy - Y * s, s };
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

    const stateVal = (m: ModState) =>
      m.state === "good" ? 1 : m.state === "warn" ? 0.5 : m.state === "bad" ? 0.12 : 0.4;

    const onMove = (e: PointerEvent) => {
      const r = cv!.getBoundingClientRect();
      rotYT = ((e.clientX - r.left) / r.width - 0.5) * 0.42;
      rotXT = ((e.clientY - r.top) / r.height - 0.5) * -0.2;
    };
    const onLeave = () => { rotYT = 0; rotXT = 0; };

    function draw(ts: number) {
      const dt = Math.min(0.05, (ts - t0) / 1000 || 0);
      t0 = ts;
      if (!reduce) tA += dt;
      rotY += (rotYT - rotY) * 0.06;
      rotX += (rotXT - rotX) * 0.06;
      if (!W || !H) { raf = requestAnimationFrame(draw); return; }

      const MODS = modsRef.current;
      const IDX: Record<string, number> = {};
      MODS.forEach((m, i) => (IDX[m.k] = i));

      const g = ctx!.createRadialGradient(cx, cy, 10, cx, cy, Math.max(W, H) * 0.8);
      g.addColorStop(0, "#12242c"); g.addColorStop(1, "#081216");
      ctx!.fillStyle = g; ctx!.fillRect(0, 0, W, H);

      const hubP = project(0, 0, 0);
      for (let ring = 1; ring <= 3; ring++) {
        const rr = (tA * 0.35 + ring / 3) % 1;
        ctx!.beginPath();
        ctx!.arc(hubP.x, hubP.y, rr * Math.min(W, H) * 0.46, 0, 6.284);
        ctx!.strokeStyle = `rgba(143,160,166,${0.09 * (1 - rr)})`;
        ctx!.lineWidth = 1; ctx!.stroke();
      }

      EDGES.forEach(([ia, ib], e) => {
        const a = MODS[ia], b = MODS[ib];
        const A = project(a.x, a.y, a.z), B = project(b.x, b.y, b.z);
        const health = Math.min(stateVal(a), stateVal(b));
        ctx!.beginPath(); ctx!.moveTo(A.x, A.y); ctx!.lineTo(B.x, B.y);
        ctx!.strokeStyle = `rgba(143,160,166,${0.13 + health * 0.1})`;
        ctx!.lineWidth = 1; ctx!.stroke();
        for (let k = 0; k < 3; k++) {
          if (health < 0.34 && (k + e) % 2 === 0) continue;
          const u = (tA * (0.1 + health * 0.3) + k / 3 + e * 0.13) % 1;
          ctx!.beginPath();
          ctx!.arc(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * u, 2.1, 0, 6.284);
          ctx!.fillStyle = `rgba(231,196,137,${0.25 + health * 0.45})`;
          ctx!.fill();
        }
      });

      // "covering for it" arcs
      MODS.forEach((m) => {
        if (m.state !== "bad") return;
        (DEPENDENCIES[m.k] || []).forEach((dk) => {
          const tgt = MODS[IDX[dk]];
          const P1 = project(m.x, m.y, m.z), P2 = project(tgt.x, tgt.y, tgt.z);
          const mxx = (P1.x + P2.x) / 2, myy = (P1.y + P2.y) / 2;
          const ddx = P2.x - P1.x, ddy = P2.y - P1.y;
          const L = Math.hypot(ddx, ddy) || 1;
          const ctrlx = mxx - (ddy / L) * L * 0.34;
          const ctrly = myy + (ddx / L) * L * 0.34;
          ctx!.save();
          ctx!.setLineDash([5, 6]);
          ctx!.lineDashOffset = -tA * 26;
          ctx!.beginPath(); ctx!.moveTo(P1.x, P1.y);
          ctx!.quadraticCurveTo(ctrlx, ctrly, P2.x, P2.y);
          ctx!.strokeStyle = "rgba(199,69,47,.55)"; ctx!.lineWidth = 1.3; ctx!.stroke();
          ctx!.restore();
          const lx = 0.25 * P1.x + 0.5 * ctrlx + 0.25 * P2.x;
          const ly = 0.25 * P1.y + 0.5 * ctrly + 0.25 * P2.y;
          ctx!.font = "500 10px " + sansFamily;
          ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillStyle = "rgba(6,12,15,.8)";
          roundRect(lx - 46, ly - 9, 92, 18, 3); ctx!.fill();
          ctx!.fillStyle = "rgba(224,120,100,.95)";
          ctx!.fillText(coveringFor, lx, ly + 0.5);
        });
      });

      MODS.forEach((mo, i) => {
        const P = project(mo.x, mo.y, mo.z);
        const c = COL[mo.state];
        const bw = 126 * P.s, bh = 58 * P.s;
        let ox = 0, oy = 0;
        if (mo.state === "bad" && !reduce) {
          ox = Math.sin(tA * 19 + i) * 1.8;
          oy = Math.cos(tA * 23 + i) * 1.4;
        }
        if (mo.flash > 0) mo.flash = Math.max(0, mo.flash - dt * 1.6);
        const x = P.x - bw / 2 + ox, y = P.y - bh / 2 + oy;

        ctx!.fillStyle = "rgba(6,12,15,.75)";
        roundRect(x + 5 * P.s, y + 5 * P.s, bw, bh, 4 * P.s); ctx!.fill();

        const grd = ctx!.createLinearGradient(x, y, x, y + bh);
        grd.addColorStop(0, rgba(c, 0.3 + mo.flash * 0.4));
        grd.addColorStop(1, rgba(c, 0.12 + mo.flash * 0.25));
        ctx!.fillStyle = grd; roundRect(x, y, bw, bh, 4 * P.s); ctx!.fill();
        ctx!.strokeStyle = rgba(c, 0.75 + mo.flash * 0.25); ctx!.lineWidth = 1.2;
        roundRect(x, y, bw, bh, 4 * P.s); ctx!.stroke();

        if (mo.state === "bad") {
          ctx!.strokeStyle = "rgba(199,69,47,.85)"; ctx!.lineWidth = 1;
          ctx!.beginPath();
          ctx!.moveTo(x + bw * 0.3, y); ctx!.lineTo(x + bw * 0.4, y + bh * 0.45);
          ctx!.lineTo(x + bw * 0.28, y + bh * 0.62); ctx!.lineTo(x + bw * 0.36, y + bh);
          ctx!.stroke();
          ctx!.beginPath();
          ctx!.moveTo(x + bw * 0.72, y); ctx!.lineTo(x + bw * 0.64, y + bh * 0.5);
          ctx!.lineTo(x + bw * 0.74, y + bh);
          ctx!.stroke();
        }

        ctx!.font = `600 ${Math.max(9, 11 * P.s)}px ${sansFamily}`;
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
        ctx!.fillStyle = mo.state === "unknown" ? "rgba(143,160,166,.85)" : "rgba(240,236,226,.96)";
        ctx!.fillText(mo.n, P.x + ox, P.y + oy);
      });

      const hb = project(0, 0, 0);
      ctx!.beginPath(); ctx!.arc(hb.x, hb.y, 10 * hb.s, 0, 6.284);
      ctx!.fillStyle = "rgba(231,196,137,.10)"; ctx!.fill();
      ctx!.strokeStyle = "rgba(231,196,137,.35)"; ctx!.lineWidth = 1; ctx!.stroke();

      if (scoreRef.current !== null) {
        const ap = sstep(0, 1.1, (ts - doneAtRef.current) / 1000);
        ctx!.font = `700 ${30 * hb.s}px ${serifFamily}`;
        ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
        ctx!.fillStyle = `rgba(231,196,137,${0.95 * ap})`;
        ctx!.fillText(scoreRef.current.toFixed(1), hb.x, hb.y - 2);
        ctx!.font = `400 ${10 * hb.s}px ${sansFamily}`;
        ctx!.fillStyle = `rgba(143,160,166,${0.9 * ap})`;
        ctx!.fillText("/ 10", hb.x, hb.y + 20 * hb.s);
      }

      if (scanRef.current >= 0) {
        const sp = (ts - scanRef.current) / 1200;
        if (sp > 1) scanRef.current = -1;
        else {
          const yy = H * sp;
          const lg = ctx!.createLinearGradient(0, yy - 40, 0, yy + 40);
          lg.addColorStop(0, "rgba(214,163,74,0)");
          lg.addColorStop(0.5, "rgba(214,163,74,.35)");
          lg.addColorStop(1, "rgba(214,163,74,0)");
          ctx!.fillStyle = lg; ctx!.fillRect(0, yy - 40, W, 80);
          ctx!.fillStyle = "rgba(231,196,137,.7)"; ctx!.fillRect(0, yy, W, 1);
        }
      }

      raf = requestAnimationFrame(draw);
    }

    cv.addEventListener("pointermove", onMove, { passive: true });
    cv.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);
    resize();
    const kick = setTimeout(resize, 60);
    raf = requestAnimationFrame((t2) => { t0 = t2; draw(t2); });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(kick);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
    // Module labels and translated copy are read once on mount; the canvas
    // loop reads modsRef/scoreRef for anything that changes afterwards.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- logic ---------------- */
  const start = () => {
    scanRef.current = performance.now();
    setTimeout(() => { setPhase("quiz"); setQi(0); }, 700);
  };

  const finish = useCallback(() => {
    const answers = answersRef.current;
    let total = 0, count = 0;
    (Object.keys(answers) as ModuleKey[]).forEach((k) => {
      answers[k]!.forEach((v) => { total += v; count++; });
    });
    const score = (total / (count * 2)) * 10;
    scoreRef.current = score;
    doneAtRef.current = performance.now();

    let worst: ModuleKey = "CSKH", ws = 99;
    PRIORITY.forEach((k) => {
      const m = modsRef.current.find((x) => x.k === k);
      if (m && m.score !== null && m.score < ws) { ws = m.score; worst = k; }
    });

    setResult({ score, key: worst });
    setPhase("done");
    onResult?.(PACKAGE_FOR_MODULE[worst]);
  }, [onResult]);

  const answer = (score: number) => {
    const q = QUESTIONS[qi];
    const list = (answersRef.current[q.m] = answersRef.current[q.m] || []);
    list.push(score);
    const m = modsRef.current.find((x) => x.k === q.m)!;
    const avg = list.reduce((a, b) => a + b, 0) / list.length;
    m.score = avg;
    m.state = avg >= 1.6 ? "good" : avg >= 0.8 ? "warn" : "bad";
    m.flash = 1;

    setNote(m.state === "good" ? { html: noteOk, ok: true } : { html: notes[q.m], ok: false });

    if (qi + 1 < QUESTIONS.length) setTimeout(() => setQi(qi + 1), 120);
    else setTimeout(finish, 500);
  };

  const reset = () => {
    answersRef.current = {};
    modsRef.current.forEach((m) => { m.score = null; m.state = "unknown"; m.flash = 0; });
    scoreRef.current = null;
    setResult(null); setNote(null); setQi(0); setPhase("idle");
    setSent(null); setName(""); setPhone("");
    onResult?.("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setSending(true);
    try {
      const ok = onSubmitLead
        ? await onSubmitLead({ name, phone, score: result.score, bottleneck: result.key })
        : true;
      setSent(ok ? "ok" : "err");
    } catch {
      setSent("err");
    } finally {
      setSending(false);
    }
  };

  const q = QUESTIONS[qi];
  const barColor = result ? (result.score >= 7 ? "#3E9E8A" : result.score >= 4 ? "#D6A34A" : "#C7452F") : "#D6A34A";

  return (
    <div className={styles.dx}>
      <div className={styles.vis}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className={styles.legend}>
          <span><i style={{ background: "#3E9E8A" }} />{t("legendGood")}</span>
          <span><i style={{ background: "#D6A34A" }} />{t("legendWarn")}</span>
          <span><i style={{ background: "#C7452F" }} />{t("legendBad")}</span>
        </div>
      </div>

      <div className={styles.panel}>
        {phase !== "done" ? (
          <div>
            <div className={styles.step}>
              {phase === "idle" ? t("prepare") : t("questionStep", { current: qi + 1, total: QUESTIONS.length })}
            </div>
            <div className={styles.dots} aria-hidden="true">
              {QUESTIONS.map((_, k) => (
                <i key={k} className={phase === "quiz" && k <= qi ? styles.on : undefined} />
              ))}
            </div>
            <h2 className={styles.qtext}>{phase === "idle" ? t("prepareQ") : q.t}</h2>

            {phase === "idle" ? (
              <>
                <button className={styles.startBtn} onClick={start}>{t("startBtn")}</button>
                <p className={styles.privacy}>{t("privacy")}</p>
              </>
            ) : (
              <div className={styles.opts} role="group" aria-label={q.t}>
                {q.o.map(([label, sc], k) => (
                  <button key={k} type="button" className={styles.opt} onClick={() => answer(sc)}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {note && (
              <div
                className={note.ok ? `${styles.note} ${styles.ok}` : styles.note}
                dangerouslySetInnerHTML={{ __html: note.html }}
              />
            )}
          </div>
        ) : (
          result && (
            <div className={styles.res}>
              <div className={styles.step}>{t("resultLbl")}</div>
              <div className={styles.score}>
                <b style={{ color: barColor }}>{result.score.toFixed(1)}</b>
                <span>/ 10</span>
              </div>
              <div className={styles.bar}>
                <i style={{ width: `${result.score * 10}%`, background: barColor }} />
              </div>

              <h3>{t("bottleneck")}{moduleNames[result.key]}</h3>
              <p
                className={styles.why}
                dangerouslySetInnerHTML={{ __html: (notes[result.key] || "").replace(/<\/?b>/g, "") }}
              />

              <div className={styles.reco}>
                <div className={styles.recoLbl}>{t("recoLbl")}</div>
                <h4>{recommend[result.key].name}</h4>
                <p>{recommend[result.key].why}</p>
              </div>

              {sent === null ? (
                <form className={styles.form} onSubmit={submit}>
                  <input
                    type="text" required value={name} autoComplete="name"
                    placeholder={t("namePh")} onChange={(e) => setName(e.target.value)}
                  />
                  <input
                    type="tel" required value={phone} autoComplete="tel"
                    placeholder={t("phonePh")} onChange={(e) => setPhone(e.target.value)}
                  />
                  <button type="submit" disabled={sending}>
                    {sending ? t("sending") : t("submit")}
                  </button>
                  <p className={styles.microcopy}>{t("microcopy")}</p>
                </form>
              ) : (
                <div className={sent === "ok" ? styles.sent : `${styles.sent} ${styles.err}`}>
                  {sent === "ok" ? t("sentOk") : t("sentErr")}
                </div>
              )}

              <button className={styles.again} onClick={reset}>{t("again")}</button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
