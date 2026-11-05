"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, BatteryMedium, Check, CheckCircle2, MessageCircle, PhoneIncoming, Signal } from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/**
 * "Thang Tự Do" — the package ladder built on the brand promise
 * "Vắng 30 ngày, cơ sở vẫn tăng trưởng" (strategy: hq/07-STRATEGY-ANALYSIS-2026.md §6).
 * Content lives in messages → ladder.levels (same order as STAIR_HEIGHTS).
 * Picking a stair = how long the owner wants to be away → the phone mock shows
 * the calls that would pull them back (pain), the card shows the package that
 * removes those calls. Level 4 is the calm state: notifications, no calls.
 *
 * variant "teaser" (home): ladder only + link to the services page.
 * variant "full" (services): + 5 criteria ("why 30 days") + absence test.
 */
type Level = {
  span: string;
  step: string;
  name: string;
  fit: string;
  time: string;
  test: string;
  note?: string;
  calls: { when: string; text: string }[];
  build: string[];
};

/** Stair heights in % — rising left → right. */
const STAIR_HEIGHTS = [28, 46, 64, 82, 100];
/** Default selection = the headline promise (30 days). */
const PROMISE_LEVEL = 1;
const CALM_LEVEL = 4;

export function FreedomLadder({ variant = "full" }: { variant?: "full" | "teaser" }) {
  const t = useTranslations("ladder");
  const levels = t.raw("levels") as Level[];
  const why = t.raw("why") as { t: string; b: string }[];
  const tests = t.raw("tests") as string[];
  const [active, setActive] = useState(PROMISE_LEVEL);
  const level = levels[active];
  const calm = active === CALM_LEVEL;

  function pick(i: number) {
    setActive(i);
    trackEvent("ladder_pick", { level: i, variant });
  }

  return (
    <section id={variant === "full" ? "thang-tu-do" : "loi-hua"} className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_15%_0%,rgba(69,209,127,0.14),transparent),radial-gradient(ellipse_50%_40%_at_100%_100%,rgba(10,111,184,0.12),transparent)]"
      />
      <Container className="relative flex flex-col gap-14">
        {/* ── Promise ── */}
        <div className="flex max-w-3xl flex-col gap-5">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">{t("eyebrow")}</span>
          <h2 className="font-serif text-4xl font-bold leading-[1.1] tracking-tight sm:text-6xl">{t("heading")}</h2>
          <p className="text-lg leading-relaxed text-white/75 sm:text-xl">{t("sub")}</p>
          <p className="text-sm font-semibold text-gold-400/90">{t("goal")}</p>
        </div>

        {/* ── Ladder (stairs) ── */}
        <div className="flex flex-col gap-4">
          <p className="font-display text-base font-semibold text-white/85">{t("pickLabel")}</p>
          <div className="grid grid-cols-5 items-end gap-2 sm:gap-3" role="tablist" aria-label={t("pickLabel")}>
            {levels.map((l, i) => {
              const on = i === active;
              const passed = i < active;
              return (
                <button
                  key={l.step}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => pick(i)}
                  className="group flex h-44 flex-col justify-end text-left sm:h-56"
                >
                  <span
                    style={{ height: `${STAIR_HEIGHTS[i]}%` }}
                    className={`flex flex-col justify-between rounded-t-xl p-2.5 transition-all duration-300 sm:p-4 ${
                      on
                        ? "bg-gold-500 text-ink shadow-[0_-12px_40px_-12px_rgba(69,209,127,0.7)]"
                        : passed
                          ? "bg-gold-500/25 text-white ring-1 ring-inset ring-gold-500/40"
                          : "bg-white/[0.06] text-white ring-1 ring-inset ring-white/10 group-hover:bg-white/[0.1]"
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs ${on ? "text-ink/70" : "text-white/50"}`}>
                      {l.step}
                    </span>
                    <span className="font-serif text-sm font-bold leading-tight sm:text-2xl">{l.span}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Phone (pain) + package (fix) ── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:gap-12">
          {/* Phone mock */}
          <div className="mx-auto w-full max-w-[380px]">
            <div className="rounded-[2.4rem] bg-gradient-to-b from-white/20 to-white/5 p-[3px] shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)]">
              <div className="rounded-[2.3rem] bg-[#070c16] px-5 pb-7 pt-4">
                <div className="mb-5 flex items-center justify-between text-[11px] font-semibold text-white/60">
                  <span>9:41</span>
                  <span className="h-5 w-20 rounded-full bg-black" aria-hidden />
                  <span className="flex items-center gap-1">
                    <Signal size={12} aria-hidden />
                    <BatteryMedium size={14} aria-hidden />
                  </span>
                </div>
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-white/45">
                  {t("phoneTitle", { span: level.span })}
                </p>
                <p className={`mt-1 font-display text-lg font-semibold ${calm ? "text-gold-400" : "text-white"}`}>
                  {calm ? t("calm") : t("onlyYou", { n: level.calls.length })}
                </p>
                <ul key={active} className="mt-4 flex flex-col gap-2.5" aria-live="polite">
                  {level.calls.map((c, i) => (
                    <li
                      key={c.text}
                      style={{ animation: "fadeUp .45s ease both", animationDelay: `${i * 110}ms` }}
                      className={`flex items-start gap-3 rounded-2xl p-3.5 ${
                        calm ? "bg-gold-500/10 ring-1 ring-gold-500/20" : "bg-white/[0.07] ring-1 ring-white/10"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                          calm ? "bg-gold-500/20 text-gold-400" : "bg-red-500/90 text-white"
                        }`}
                      >
                        {calm ? <CheckCircle2 size={16} aria-hidden /> : <PhoneIncoming size={15} aria-hidden />}
                      </span>
                      <span className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/45">{c.when}</span>
                        <span className="text-[15px] leading-snug text-white/90">{c.text}</span>
                      </span>
                    </li>
                  ))}
                </ul>
                {level.note ? <p className="mt-4 text-sm leading-relaxed text-gold-400/90">{level.note}</p> : null}
              </div>
            </div>
          </div>

          {/* Package card */}
          <div
            key={`pkg-${active}`}
            style={{ animation: "fadeUp .45s ease both" }}
            className="flex flex-col gap-6 rounded-3xl bg-white/[0.04] p-7 ring-1 ring-white/10 sm:p-9"
          >
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
                {t("packageLabel")} · {level.step}
              </span>
              <h3 className="font-serif text-3xl font-bold text-gold-400 sm:text-4xl">{level.name}</h3>
            </div>
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                [t("fitLabel"), level.fit],
                [t("timeLabel"), level.time],
                [t("testLabel"), level.test],
              ].map(([k, v]) => (
                <div key={k} className="rounded-2xl bg-white/[0.05] p-4">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-white/45">{k}</dt>
                  <dd className="mt-1 text-[15px] leading-snug text-white/90">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="flex flex-col gap-3">
              <p className="font-display text-base font-semibold text-white">
                {active >= 2 ? t("inherit") : t("buildLabel")}
              </p>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {level.build.map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-[15px] leading-snug text-white/80">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink">
                      <Check size={12} strokeWidth={3} aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-auto flex flex-wrap gap-3 pt-2">
              <Button href="/check" onClick={() => trackEvent("ladder_cta", { cta: "check", level: active })}>
                {t("ctaCheck")}
                <ArrowRight size={16} aria-hidden />
              </Button>
              <a
                href={COMPANY.zalo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent("ladder_cta", { cta: "zalo", level: active })}
                className="inline-flex min-h-11 items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white ring-1 ring-inset ring-white/25 transition-colors hover:bg-white/10"
              >
                <MessageCircle size={16} aria-hidden />
                {t("ctaZalo")}
              </a>
            </div>
          </div>
        </div>

        {variant === "teaser" ? (
          <Link
            href={{ pathname: "/services", hash: "thang-tu-do" }}
            className="inline-flex w-fit items-center gap-2 text-base font-semibold text-gold-400 underline-offset-4 hover:underline"
          >
            {t("more")}
            <ArrowRight size={16} aria-hidden />
          </Link>
        ) : (
          <>
            {/* ── 5 criteria: why 30 days ── */}
            <div className="flex flex-col gap-8 border-t border-white/10 pt-14">
              <div className="flex max-w-2xl flex-col gap-3">
                <span className="text-sm font-semibold uppercase tracking-[0.14em] text-gold-400">{t("whyEyebrow")}</span>
                <h3 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">{t("whyHeading")}</h3>
                <p className="text-base leading-relaxed text-white/70 sm:text-lg">{t("whySub")}</p>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {why.map((w, i) => (
                  <Reveal key={w.t} delay={i * 80}>
                    <li className="flex h-full flex-col gap-3 rounded-2xl bg-white/[0.04] p-6 ring-1 ring-white/10">
                      <span className="font-serif text-3xl font-bold text-gold-400">0{i + 1}</span>
                      <span className="font-display text-lg font-semibold text-white">{w.t}</span>
                      <span className="text-sm leading-relaxed text-white/65">{w.b}</span>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>

            {/* ── Absence test ── */}
            <div className="grid gap-8 rounded-3xl bg-gold-500 p-7 text-ink sm:p-10 lg:grid-cols-[1fr_1.2fr] lg:gap-12">
              <div className="flex flex-col gap-3">
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-ink/60">{t("testEyebrow")}</span>
                <h3 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{t("testHeading")}</h3>
                <p className="text-base leading-relaxed text-ink/75">{t("testSub")}</p>
              </div>
              <ul className="flex flex-col gap-3">
                {tests.map((x) => (
                  <li key={x} className="flex items-start gap-3 rounded-2xl bg-ink/[0.07] p-4 text-[15px] font-medium leading-snug">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-gold-400">
                      <Check size={14} strokeWidth={3} aria-hidden />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-serif text-2xl font-bold sm:text-3xl">{t("ctaHeading")}</p>
              <div className="flex flex-wrap gap-3">
                <Button href="/check" onClick={() => trackEvent("ladder_cta", { cta: "check_bottom" })}>
                  {t("ctaCheck")}
                </Button>
                <Button href="/booking" variant="ghost" className="!text-white ring-white/25 hover:!bg-white/10" onClick={() => trackEvent("ladder_cta", { cta: "book" })}>
                  {t("ctaBook")}
                </Button>
              </div>
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
