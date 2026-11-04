"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, BarChart3, CalendarCheck, Repeat, RotateCcw, Smartphone, UserPlus, Users, type LucideIcon } from "lucide-react";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { AXIS_KEYS, LEVELS, checkScore, weakestAxis, type CheckAxis } from "@/lib/shopCheck";
import { trackEvent } from "@/lib/tracking/grid";

/** Homepage "Đồng hồ cơ sở": the 5-axis shop check as a car instrument
 *  cluster. The tachometer reuses the brand mark idea (Đ kim đo: navy needle,
 *  orange hub, orange→red arc). On first view the needle does an ignition
 *  sweep; each answer moves it; the weakest axis lights up as a warning lamp.
 *  Finishing hands the answers to the /check landing (result, gift, lead form)
 *  via the same query params RadarPrompt uses, with from=home-dash. */

type Values = Partial<Record<CheckAxis, number>>;

const LAMP_ICON: Record<CheckAxis, LucideIcon> = {
  "khach-moi": UserPlus,
  "khach-cu": Repeat,
  "doi-ngu": Users,
  kenh: Smartphone,
  "so-lieu": BarChart3,
};

// Gauge geometry (viewBox 320×250): 240° sweep from 210° (0) to -30° (100).
const CX = 160;
const CY = 140;
const R = 116;
const ARC_LEN = Math.round(R * ((240 * Math.PI) / 180) * 100) / 100;
// Rounded so server and browser render identical attributes (no hydration diff).
const round = (n: number) => Math.round(n * 100) / 100;
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [round(CX + r * Math.cos(a)), round(CY - r * Math.sin(a))] as const;
};
const angleOf = (v: number) => 210 - 2.4 * v;
const [AX0, AY0] = pt(210, R);
const [AX1, AY1] = pt(-30, R);
const ARC = `M${AX0.toFixed(2)} ${AY0.toFixed(2)}A${R} ${R} 0 1 1 ${AX1.toFixed(2)} ${AY1.toFixed(2)}`;
const TICKS = Array.from({ length: 21 }, (_, i) => {
  const major = i % 4 === 0;
  const a = angleOf(i * 5);
  const [x1, y1] = pt(a, R - 13);
  const [x2, y2] = pt(a, R - (major ? 24 : 18));
  const [tx, ty] = pt(a, R - 38);
  return { major, x1, y1, x2, y2, tx, ty, label: i * 5 };
});

export function ShopDashboard() {
  const t = useTranslations("dash");
  const tc = useTranslations("check");
  const [values, setValues] = useState<Values>({});
  const [step, setStep] = useState(0);
  const [sweep, setSweep] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const answeredRef = useRef(false);

  const done = step >= AXIS_KEYS.length;
  const score = checkScore(values);
  const weakest = weakestAxis(values);
  const shown = sweep ? 100 : score;

  // Ignition sweep the first time the cluster comes into view.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        if (answeredRef.current) return; // never sweep over a real reading
        setSweep(true);
        timer = setTimeout(() => setSweep(false), 900);
        trackEvent("dash_view");
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const answer = (axis: CheckAxis, level: number) => {
    const next = { ...values, [axis]: level };
    answeredRef.current = true;
    setSweep(false);
    setValues(next);
    const nextStep = AXIS_KEYS.findIndex((k) => next[k] === undefined);
    setStep(nextStep < 0 ? AXIS_KEYS.length : nextStep);
    trackEvent("dash_answer", { axis, level });
    if (nextStep < 0) trackEvent("dash_complete", { score: checkScore(next), weakest: weakestAxis(next) });
  };

  const back = () => setStep((s) => Math.max(0, s - 1));
  const restart = () => {
    setValues({});
    setStep(0);
    trackEvent("dash_restart");
  };

  const verdict = score < 40 ? "low" : score < 70 ? "mid" : "high";
  const query = { ...Object.fromEntries(AXIS_KEYS.map((k) => [k, String(values[k] ?? 0)])), from: "home-dash" };
  const axis = AXIS_KEYS[Math.min(step, AXIS_KEYS.length - 1)];
  const options = tc.raw(`axes.${axis}.o`) as string[];

  const lampTone = (k: CheckAxis) => {
    const v = values[k];
    if (sweep) return "bg-[#EC3A3A]/20 text-[#ff8a6b] ring-[#EC3A3A]/50";
    if (v === undefined) return "bg-white/[0.04] text-white/30 ring-white/10";
    if (v <= 1) return `bg-[#EC3A3A]/15 text-[#ff8a6b] ring-[#EC3A3A]/45${done && k === weakest ? " animate-pulse" : ""}`;
    return "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30";
  };

  return (
    <section ref={sectionRef} id="dong-ho" className="relative overflow-hidden bg-ink py-16 text-white sm:py-24" aria-labelledby="dong-ho-title">
      <div aria-hidden className="pointer-events-none absolute -right-40 top-10 h-[420px] w-[420px] rounded-full bg-[#F7891C]/10 blur-3xl" />
      <Container>
        {/* Mobile: heading → cluster → question. Desktop: heading + question left, cluster right. */}
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-x-16 lg:gap-y-6">
          <div className="flex flex-col gap-3 lg:col-start-1 lg:row-start-1 lg:self-end">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">{t("eyebrow")}</p>
            <h2 id="dong-ho-title" className="font-display text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              {t("heading")}
            </h2>
            <p className="max-w-xl text-white/65 sm:text-lg">{t("sub")}</p>
          </div>

          {/* Cluster */}
          <div className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-center">
            <div className="mx-auto max-w-[320px] rounded-[28px] bg-ink-soft/80 p-4 ring-1 ring-white/10 sm:max-w-[440px] sm:p-7">
              <svg viewBox="0 0 320 250" className="w-full" role="img" aria-label={t("gaugeAria", { score: shown })}>
                <defs>
                  <linearGradient id="dash-arc" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#F7891C" />
                    <stop offset="1" stopColor="#EC3A3A" />
                  </linearGradient>
                </defs>
                <path d={ARC} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" strokeLinecap="round" />
                <path
                  d={ARC}
                  fill="none"
                  stroke="url(#dash-arc)"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={ARC_LEN}
                  strokeDashoffset={round(ARC_LEN * (1 - shown / 100))}
                  style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.8,.2,1)" }}
                />
                {TICKS.map((k) => (
                  <g key={k.label}>
                    <line x1={k.x1} y1={k.y1} x2={k.x2} y2={k.y2} stroke={k.label >= 80 ? "#EC3A3A" : "rgba(255,255,255,0.45)"} strokeWidth={k.major ? 2.5 : 1.2} strokeLinecap="round" />
                    {k.major && (
                      <text x={k.tx} y={k.ty + 4} textAnchor="middle" fontSize="11" fontWeight="600" fill="rgba(255,255,255,0.5)">
                        {k.label}
                      </text>
                    )}
                  </g>
                ))}
                <g style={{ transform: `rotate(${-angleOf(shown)}deg)`, transformOrigin: `${CX}px ${CY}px`, transformBox: "view-box", transition: "transform 700ms cubic-bezier(.2,.8,.2,1)" }}>
                  <line x1={CX - 16} y1={CY} x2={CX + R - 30} y2={CY} stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
                </g>
                <circle cx={CX} cy={CY} r="10" fill="#F7891C" />
                <circle cx={CX} cy={CY} r="3.5" fill="#0B1220" />
                <text x={CX} y={CY + 72} textAnchor="middle" fontSize="40" fontWeight="800" fill="#ffffff" className="font-display tabular-nums">
                  {shown}
                  <tspan fontSize="14" fontWeight="600" fill="rgba(255,255,255,0.45)">/100</tspan>
                </text>
                <text x={CX} y={CY + 94} textAnchor="middle" fontSize="11" fontWeight="600" letterSpacing="2" fill="rgba(255,255,255,0.5)">
                  {t("readout").toUpperCase()}
                </text>
              </svg>

              <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{t("lamps")}</p>
              <ul className="mt-3 grid grid-cols-5 gap-2">
                {AXIS_KEYS.map((k) => {
                  const Icon = LAMP_ICON[k];
                  return (
                    <li key={k} className="flex flex-col items-center gap-1.5 text-center">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full ring-1 transition-colors duration-500 ${lampTone(k)}`}>
                        <Icon size={18} aria-hidden />
                      </span>
                      <span className="text-[10.5px] font-semibold leading-tight text-white/60">{tc(`axes.${k}.label`)}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Questions / result */}
          <div className="flex flex-col gap-6 lg:col-start-1 lg:row-start-2 lg:self-start">
            {!done ? (
              <div className="flex flex-col gap-3 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6">
                <div className="flex items-center justify-between text-xs font-semibold text-white/50">
                  <span>{t("step", { n: step + 1, total: AXIS_KEYS.length })}</span>
                  <span className="flex gap-1" aria-hidden>
                    {AXIS_KEYS.map((k, i) => (
                      <span key={k} className={`h-1.5 w-6 rounded-full ${i < step ? "bg-[#F7891C]" : i === step ? "bg-white/60" : "bg-white/15"}`} />
                    ))}
                  </span>
                </div>
                <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{tc(`axes.${axis}.q`)}</p>
                <div className="flex flex-col gap-2">
                  {options.map((o, level) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => answer(axis, level)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-[15px] font-semibold ring-1 transition-colors hover:bg-white/10 hover:ring-[#F7891C]/60 ${
                        values[axis] === level ? "bg-white/10 ring-[#F7891C]/60" : "bg-white/5 ring-white/12"
                      }`}
                    >
                      <span className="flex gap-0.5" aria-hidden>
                        {Array.from({ length: LEVELS - 1 }, (_, b) => (
                          <span key={b} className={`h-3 w-1.5 rounded-sm ${b < level ? "bg-[#F7891C]" : "bg-white/20"}`} />
                        ))}
                      </span>
                      <span className="flex-1">{o}</span>
                      <ArrowRight size={16} aria-hidden className="shrink-0 opacity-50" />
                    </button>
                  ))}
                </div>
                {step > 0 && (
                  <button type="button" onClick={back} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-white/55 hover:text-white">
                    <ArrowLeft size={15} aria-hidden /> {t("back")}
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-white/10 sm:p-6" aria-live="polite">
                <p className="font-display text-2xl font-bold leading-snug">{t(`verdict.${verdict}`)}</p>
                <p className="text-white/70">
                  {t("weakest")} <strong className="text-[#ff8a6b]">{tc(`axes.${weakest}.label`)}</strong>
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link
                    href={{ pathname: "/check", query }}
                    onClick={() => trackEvent("dash_cta", { to: "check", score, weakest })}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 font-bold text-ink transition-colors hover:bg-gold-500"
                  >
                    {t("cta")} <ArrowRight size={18} aria-hidden />
                  </Link>
                  <Link
                    href="/booking"
                    onClick={() => trackEvent("dash_cta", { to: "booking", score, weakest })}
                    className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 font-semibold text-white/80 ring-1 ring-white/20 transition-colors hover:text-white hover:ring-white/40"
                  >
                    <CalendarCheck size={17} aria-hidden /> {t("book")}
                  </Link>
                </div>
                <p className="text-xs text-white/45">{t("ctaNote")}</p>
                <button type="button" onClick={restart} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-white/55 hover:text-white">
                  <RotateCcw size={14} aria-hidden /> {t("restart")}
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
