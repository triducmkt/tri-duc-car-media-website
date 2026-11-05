"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MessageCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { FormStatus } from "@/components/forms/FormStatus";
import { trackEvent } from "@/lib/tracking/grid";

/** Hours/week each repetitive task typically takes an SME owner. Labels live in
 *  messages → freedom.tasks, in the same order. `on` = preselected so the
 *  result card is already alarming before the visitor touches anything. */
const TASK_HOURS: { h: number; on: boolean }[] = [
  { h: 7, on: true }, // inbox / Zalo
  { h: 5, on: true }, // quotes & closing
  { h: 4, on: false }, // posting content
  { h: 3, on: false }, // reminding old customers
  { h: 6, on: true }, // assigning & checking staff
  { h: 2, on: false }, // complaints
  { h: 3, on: false }, // hiring & onboarding
  { h: 3, on: false }, // reports & books
  { h: 8, on: true }, // being on site because nobody can replace you
];

/** VND per owner-hour presets (≈ monthly profit ÷ 200 working hours). */
const RATES = [300_000, 500_000, 1_000_000, 2_000_000];
const DAYS_IN_YEAR = 365;
const ZALO_URL = "https://zalo.me/0769918685";

function useCountUp(target: number, ms = 600) {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const from = fromRef.current;
    if (reduce || from === target) {
      fromRef.current = target;
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = from + (target - from) * eased;
      fromRef.current = v;
      setValue(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return value;
}

export function FreedomCalculator() {
  const t = useTranslations("freedom");
  const taskLabels = t.raw("tasks") as string[];

  const [selected, setSelected] = useState<boolean[]>(() => TASK_HOURS.map((x) => x.on));
  const [rate, setRate] = useState(RATES[1]);
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  const hours = useMemo(
    () => TASK_HOURS.reduce((sum, task, i) => sum + (selected[i] ? task.h : 0), 0),
    [selected],
  );
  // 8-hour working days per year spent on work that should belong to someone else.
  const days = Math.min(DAYS_IN_YEAR, Math.round((hours * 52) / 8));
  const yearly = hours * 52 * rate;

  // Log each change of the calculator inputs (debounced) — no personal data.
  const initial = useRef({ hours, rate });
  useEffect(() => {
    if (hours === initial.current.hours && rate === initial.current.rate) return;
    const id = setTimeout(() => trackEvent("calculator_change", { hours, rate, days }), 800);
    return () => clearTimeout(id);
  }, [hours, rate, days]);

  const animHours = useCountUp(hours);
  const animDays = useCountUp(days);
  const animYearly = useCountUp(yearly, 800);

  function formatMoney(vnd: number) {
    if (vnd >= 1_000_000_000) {
      const b = Math.round(vnd / 100_000_000) / 10;
      return t("billion", { n: b.toLocaleString(t("numberLocale")) });
    }
    return t("million", { n: Math.round(vnd / 1_000_000).toLocaleString(t("numberLocale")) });
  }

  function formatRate(vnd: number) {
    return vnd >= 1_000_000 ? t("rateM", { n: vnd / 1_000_000 }) : t("rateK", { n: vnd / 1_000 });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const r = await fetch("/api/freedom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(form.get("name") ?? ""),
          phone: String(form.get("phone") ?? ""),
          hoursPerWeek: hours,
          daysPerYear: days,
          ratePerHour: rate,
          tasks: taskLabels.filter((_, i) => selected[i]),
        }),
      });
      setStatus(r.ok ? "ok" : "err");
      trackEvent("form_submit", { form: "freedom_calculator", ok: r.ok, hours, rate });
    } catch {
      setStatus("err");
    }
  }

  const filled = Math.round(animDays);

  return (
    <section id="tinh-gio" className="relative scroll-mt-20 bg-paper pb-20 pt-6 sm:pb-28 sm:pt-10">
      <Container className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        {/* ── Left: inputs ── */}
        <div className="flex flex-col gap-10">
          <div className="flex max-w-xl flex-col gap-4">
            <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-600">
              {t("eyebrow")}
            </span>
            <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-ink sm:text-[2.6rem]">
              {t("heading")}
            </h2>
            <p className="text-base leading-relaxed text-ink-muted sm:text-lg">{t("sub")}</p>
          </div>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-4 font-display text-base font-semibold text-ink">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm text-gold-400">
                1
              </span>
              {t("step1")}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {taskLabels.map((label, i) => {
                const on = selected[i];
                return (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSelected((s) => s.map((v, k) => (k === i ? !v : v)))}
                    className={`group inline-flex min-h-12 items-center gap-2.5 rounded-full py-2.5 pl-3 pr-4 text-left text-[15px] font-medium transition-all duration-200 ${
                      on
                        ? "bg-ink text-white shadow-[0_10px_24px_-12px_rgba(11,18,32,0.7)]"
                        : "bg-paper-soft text-ink ring-1 ring-inset ring-black/10 hover:ring-ink/30"
                    }`}
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
                        on ? "bg-gold-500 text-ink" : "bg-white ring-1 ring-black/15"
                      }`}
                    >
                      {on ? <Check size={15} strokeWidth={3} aria-hidden /> : null}
                    </span>
                    {label}
                    <span className={`text-xs font-semibold ${on ? "text-gold-400" : "text-ink-muted"}`}>
                      {t("hoursShort", { n: TASK_HOURS[i].h })}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4">
            <legend className="mb-1 font-display text-base font-semibold text-ink">
              <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-sm text-gold-400">
                2
              </span>
              {t("step2")}
            </legend>
            <p className="text-sm text-ink-muted">{t("step2Hint")}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={rate === r}
                  onClick={() => setRate(r)}
                  className={`min-h-12 rounded-xl px-3 text-[15px] font-semibold transition-all ${
                    rate === r
                      ? "bg-brand-500 text-white shadow-[0_8px_24px_-8px_rgba(10,111,184,0.6)]"
                      : "bg-paper-soft text-ink ring-1 ring-inset ring-black/10 hover:ring-brand-500/40"
                  }`}
                >
                  {formatRate(r)}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* ── Right: result card ── */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl bg-ink p-7 text-white shadow-[0_30px_80px_-30px_rgba(11,18,32,0.8)] sm:p-9">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_0%,rgba(69,209,127,0.18),transparent)]"
            />
            <div className="relative flex flex-col gap-7" aria-live="polite">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.12em] text-white/55">{t("resultWeek")}</p>
                <p className="mt-1 flex items-baseline gap-3">
                  <span className="font-serif text-6xl font-bold tabular-nums text-gold-400 sm:text-7xl">
                    {Math.round(animHours)}
                  </span>
                  <span className="text-lg text-white/80">{t("resultWeekUnit")}</span>
                </p>
              </div>

              <div>
                <div className="mb-3 flex items-baseline justify-between gap-4">
                  <p className="text-sm text-white/70">
                    {t.rich("resultDays", {
                      n: filled,
                      b: (chunks) => <strong className="font-semibold text-white">{chunks}</strong>,
                    })}
                  </p>
                </div>
                {/* One square per day of the year — gold = days lost to repetitive work. */}
                <div
                  className="grid gap-[3px]"
                  style={{ gridTemplateColumns: "repeat(31, minmax(0, 1fr))" }}
                  role="img"
                  aria-label={t("gridLabel", { n: days })}
                >
                  {Array.from({ length: DAYS_IN_YEAR }, (_, i) => (
                    <span
                      key={i}
                      className={`aspect-square rounded-[2px] transition-colors duration-300 ${
                        i < filled ? "bg-gold-500" : "bg-white/10"
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10">
                <p className="text-sm text-white/65">{t("resultMoney")}</p>
                <p className="mt-1 font-serif text-3xl font-bold tabular-nums text-white sm:text-4xl">
                  ≈ {formatMoney(animYearly)}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{t("resultMoneyNote")}</p>
              </div>

              {hours === 0 ? (
                <p className="text-base text-white/80">{t("zeroState")}</p>
              ) : status === "ok" ? (
                <FormStatus type="success" title={t("okTitle")} body={t("okBody")} />
              ) : (
                <form onSubmit={onSubmit} className="flex flex-col gap-3">
                  <p className="font-display text-lg font-semibold text-white">
                    {t("ctaHeading", { n: hours })}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input
                      name="name"
                      required
                      maxLength={120}
                      autoComplete="name"
                      placeholder={t("namePh")}
                      aria-label={t("namePh")}
                      className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
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
                      className="min-h-12 rounded-xl bg-white px-4 text-[15px] text-ink outline-none placeholder:text-ink-muted/70 focus:ring-2 focus:ring-gold-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="min-h-12 rounded-full bg-gold-500 px-6 text-[15px] font-bold text-ink transition-colors hover:bg-gold-400 disabled:opacity-60"
                  >
                    {status === "sending" ? t("sending") : t("submit")}
                  </button>
                  {status === "err" ? (
                    <FormStatus type="error" title={t("errTitle")} body={t("errBody")} />
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm text-white/55">
                    <span>{t("privacy")}</span>
                    <a
                      href={ZALO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-brand-300 hover:text-white"
                    >
                      <MessageCircle size={16} aria-hidden />
                      {t("zalo")}
                    </a>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
