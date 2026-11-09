"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, CalendarCheck, MessageCircle } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { AXIS_KEYS, LEVELS, type CheckAxis } from "@/lib/shopCheck";
import { trackEvent } from "@/lib/tracking/grid";
import { CheckRadar } from "./CheckRadar";

/** End-of-article bridge from organic reading to the landing page: the 3D
 *  radar with the article's own axis pulsing, and that axis' question with
 *  its 4 levels. One tap opens /kiem-tra-co-so with the answer pre-filled
 *  (?<axis>=<level>&from=<slug>), so the reader starts at question 2 of 5.
 *  Zalo / booking stay as quieter secondary links. */
export function RadarPrompt({ axis, slug }: { axis: CheckAxis; slug: string }) {
  const t = useTranslations("check");
  const router = useRouter();
  const k = AXIS_KEYS.indexOf(axis);
  const options = t.raw(`axes.${axis}.o`) as string[];

  const go = (level: number) => {
    trackEvent("prompt_answer", { axis, level, from: slug });
    router.push({ pathname: "/check", query: { [axis]: String(level), from: slug } });
  };

  return (
    <aside className="grid gap-6 overflow-hidden rounded-2xl bg-ink p-6 text-white sm:grid-cols-[0.9fr_1.1fr] sm:items-center sm:p-8">
      <CheckRadar
        values={AXIS_KEYS.map(() => -1)}
        focus={k}
        labels={AXIS_KEYS.map((a) => ({ text: t(`axes.${a}.label`), tone: a === axis ? ("focus" as const) : ("idle" as const) }))}
        className="mx-auto aspect-[16/10] w-full max-w-[300px] sm:aspect-square"
      />
      <div className="flex flex-col gap-3">
        <span className="eyebrow-pill" data-tone="dark">{t("prompt.eyebrow")}</span>
        <p className="font-serif text-xl font-bold leading-snug sm:text-2xl">{t("prompt.heading", { axis: t(`axes.${axis}.label`) })}</p>
        <p className="text-sm text-white/65">{t(`axes.${axis}.q`)}</p>
        <div className="flex flex-col gap-2">
          {options.map((o, level) => (
            <button
              key={o}
              type="button"
              onClick={() => go(level)}
              className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-left text-sm font-semibold ring-1 ring-white/12 transition-colors hover:bg-white/10 hover:ring-brand-400/50"
            >
              <span className="flex gap-0.5" aria-hidden>
                {Array.from({ length: LEVELS - 1 }, (_, b) => (
                  <span key={b} className={`h-3 w-1.5 rounded-sm ${b < level ? "bg-brand-400" : "bg-white/20"}`} />
                ))}
              </span>
              <span className="flex-1">{o}</span>
              <ArrowRight size={16} aria-hidden className="shrink-0 opacity-50" />
            </button>
          ))}
        </div>
        <p className="text-xs text-white/50">{t("prompt.sub")}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-sm font-semibold">
          <span className="text-white/50">{t("prompt.or")}</span>
          <a
            href={COMPANY.zalo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent("prompt_cta", { to: "zalo", from: slug })}
            className="inline-flex items-center gap-1.5 text-[#6ea6f7] hover:text-white"
          >
            <MessageCircle size={15} aria-hidden /> Zalo
          </a>
          <Link href="/booking" onClick={() => trackEvent("prompt_cta", { to: "booking", from: slug })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
            <CalendarCheck size={15} aria-hidden /> {t("orBook")}
          </Link>
        </div>
      </div>
    </aside>
  );
}
