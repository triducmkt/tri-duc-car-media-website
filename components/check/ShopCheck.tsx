"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, CalendarCheck, Check, MessageCircle, Phone, RotateCcw, ShieldCheck } from "lucide-react";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { ATTRIBUTION_KEYS, AXIS_KEYS, CHECK_AXES, INDUSTRY_VARIANTS, LEVELS, checkScore, entryReferrer, weakestAxis, type CheckAxis } from "@/lib/shopCheck";
import { trackEvent } from "@/lib/tracking/grid";
import { CheckRadar } from "./CheckRadar";
import { GiftBox } from "./GiftBox";
import { GiftContent } from "./GiftContent";
import { GIFT_IDS, GIFT_MAP, giftForAxis, type GiftId } from "@/lib/gifts";

/** Landing hero: "Kiểm tra cơ sở 60 giây". The 3D radar (CheckRadar) morphs
 *  live as the visitor answers; the result names the weakest axis, the first
 *  fix and a matching real case, then either a 2-field form → /api/check or
 *  "send my result via Zalo" (copied text). Answers can arrive pre-filled
 *  from a Kiến thức article (?doi-ngu=1&from=<slug>, see RadarPrompt).
 *  Attribution sent with the lead: utm_*, gclid, ?nganh=, from, entry_ref
 *  (first external referrer of the visit → organic vs ads). dataLayer /
 *  gtag `generate_lead` fire on submit for Google Ads later. */

const STORE = "td-check-attribution";

type Values = Partial<Record<CheckAxis, number>>;

export function ShopCheck() {
  const t = useTranslations("check");
  const tg = useTranslations("gifts");
  const [giftPick, setGiftPick] = useState<GiftId | null>(null);
  const [values, setValues] = useState<Values>({});
  const [step, setStep] = useState(0);
  const [prefilled, setPrefilled] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [zaloCopied, setZaloCopied] = useState(false);
  const [zaloSent, setZaloSent] = useState(false);
  const [attribution, setAttribution] = useState<Record<string, string>>({});
  // ?nganh= (ad group industry) is read in the browser so the page stays static (ERR-WEB-006).
  const [variant, setVariant] = useState<string | undefined>();

  const done = step >= AXIS_KEYS.length;
  const score = checkScore(values);
  const weakest = weakestAxis(values);
  const gift: GiftId = giftPick ?? giftForAxis(weakest);
  const heading = t.has(`heading.${variant}`) ? t(`heading.${variant}`) : t("heading.default");

  // Read the URL once: attribution (first landing wins for the session) and
  // any answer pre-filled by an article.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fresh: Record<string, string> = {};
    for (const k of ATTRIBUTION_KEYS) {
      const v = params.get(k);
      if (v) fresh[k] = v.slice(0, 200);
    }
    const entry = entryReferrer();
    if (entry) fresh.entry_ref = entry;
    let stored: Record<string, string> = {};
    try {
      stored = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      if (!Object.keys(stored).length && Object.keys(fresh).length) sessionStorage.setItem(STORE, JSON.stringify(fresh));
    } catch {}

    const pre: Values = {};
    for (const k of AXIS_KEYS) {
      const n = Number(params.get(k));
      if (params.has(k) && Number.isInteger(n) && n >= 0 && n < LEVELS) pre[k] = n;
    }
    const first = AXIS_KEYS.findIndex((k) => pre[k] === undefined);
    const nganh = params.get("nganh") ?? "";
    const v = (INDUSTRY_VARIANTS as readonly string[]).includes(nganh) ? nganh : undefined;
    const qua = params.get("qua");
    /* eslint-disable react-hooks/set-state-in-effect -- read once from the URL on mount */
    setVariant(v);
    if (qua && (GIFT_IDS as string[]).includes(qua)) setGiftPick(qua as GiftId);
    setAttribution({ ...fresh, ...stored, ...(fresh.from ? { from: fresh.from } : {}) });
    if (Object.keys(pre).length) {
      setValues(pre);
      setStep(first < 0 ? AXIS_KEYS.length : first);
      setPrefilled(true);
    }
    /* eslint-enable react-hooks/set-state-in-effect */
    trackEvent("check_view", { variant: v ?? "default", source: fresh.utm_source ?? entry ?? "", from: fresh.from ?? "", prefilled: Object.keys(pre).length });
  }, []);

  const answer = (axis: CheckAxis, level: number) => {
    const next = { ...values, [axis]: level };
    setValues(next);
    // Jump to the next unanswered question (some may be pre-filled).
    const nextStep = AXIS_KEYS.findIndex((k) => next[k] === undefined);
    setStep(nextStep < 0 ? AXIS_KEYS.length : nextStep);
    trackEvent("check_answer", { axis, level });
    if (nextStep < 0) {
      trackEvent("check_complete", { score: checkScore(next), weakest: weakestAxis(next), entry: attribution.entry_ref ?? "" });
      trackEvent("gift_reveal", { gift: giftPick ?? giftForAxis(weakestAxis(next)) });
    }
  };

  const restart = () => {
    setValues({});
    setStep(0);
    setPrefilled(false);
    setStatus("idle");
    setZaloCopied(false);
    setZaloSent(false);
  };

  const answerLines = () => AXIS_KEYS.map((k) => `${t(`axes.${k}.label`)}: ${(t.raw(`axes.${k}.o`) as string[])[values[k] ?? 0]}`);

  const conversion = (channel: "form" | "zalo") => {
    // Google Ads / GTM conversion hook (no-op until a tag is installed).
    const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
    w.dataLayer?.push({ event: "generate_lead", form: "shop_check", channel, score, weakest });
    w.gtag?.("event", "generate_lead", { form: "shop_check", channel, value: 1 });
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setStatus("sending");
    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          phone: fd.get("phone"),
          score,
          weakest: t(`axes.${weakest}.label`),
          gift: `${tg(`items.${gift}.title`)} (${tg(`formats.${GIFT_MAP[gift].format}`)} · ${tg(GIFT_MAP[gift].status)})`,
          answers: answerLines(),
          attribution,
          page: window.location.pathname + window.location.search,
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      trackEvent("check_lead", { score, weakest, channel: "form", gift, entry: attribution.entry_ref ?? "", from: attribution.from ?? "" });
      conversion("form");
    } catch {
      setStatus("error");
    }
  };

  const sendViaZalo = () => {
    const text = t("zaloText", { score, weakest: t(`axes.${weakest}.label`) });
    // Start the copy and open Zalo inside the same tap, or popup blockers kick in.
    navigator.clipboard?.writeText(text).then(() => setZaloCopied(true), () => setZaloCopied(false));
    window.open(COMPANY.zalo, "_blank", "noopener");
    setZaloSent(true);
    trackEvent("check_lead", { score, weakest, channel: "zalo", gift, entry: attribution.entry_ref ?? "", from: attribution.from ?? "" });
    conversion("zalo");
  };

  const axis = AXIS_KEYS[Math.min(step, AXIS_KEYS.length - 1)];
  const options = t.raw(`axes.${axis}.o`) as string[];
  const caseSlug = CHECK_AXES[weakest].caseSlug;
  const radarValues = AXIS_KEYS.map((k) => values[k] ?? -1);
  const labels = AXIS_KEYS.map((k) => ({
    text: t(`axes.${k}.label`),
    tone: done && k === weakest ? ("weak" as const) : !done && k === axis ? ("focus" as const) : values[k] !== undefined ? ("done" as const) : ("idle" as const),
  }));

  return (
    <section id="kiem-tra" className="relative overflow-hidden bg-ink pb-16 pt-24 text-white sm:pb-24 sm:pt-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_25%_35%,rgba(66,133,244,0.2),transparent_60%)]" />
      <Container className="relative grid gap-5 sm:gap-8 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-4 sm:gap-5">
          <span className="text-sm font-bold uppercase tracking-[0.14em] text-brand-300">{t("eyebrow")}</span>
          <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{heading}</h1>
          <p className="hidden max-w-xl text-lg text-white/70 sm:block">{t("sub")}</p>
          <p className="flex items-center gap-2 text-sm font-semibold text-brand-400">
            <ShieldCheck size={16} aria-hidden /> {t("free")}
          </p>
          <CheckRadar
            values={radarValues}
            weakest={done ? AXIS_KEYS.indexOf(weakest) : -1}
            focus={done ? -1 : AXIS_KEYS.indexOf(axis)}
            labels={labels}
            className="mx-auto aspect-[16/11] w-full max-w-[520px] sm:aspect-[4/3]"
          >
            {done && (
              <div className="pointer-events-none absolute right-0 top-0 flex flex-col items-end">
                <span className="font-display text-4xl font-bold tabular-nums text-brand-400 sm:text-5xl">{score}</span>
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/55">{t("score")} /100</span>
              </div>
            )}
          </CheckRadar>
        </div>

        <div className="flex flex-col gap-5 rounded-2xl bg-white/[0.05] p-5 ring-1 ring-white/10 backdrop-blur sm:p-7">
          {!done ? (
            <>
              <div className="flex items-center justify-between text-xs font-semibold text-white/55">
                <span>{t("step", { n: step + 1 })}</span>
                <span className="flex gap-1.5" aria-hidden>
                  {AXIS_KEYS.map((k, i) => (
                    <span key={k} className={`h-1.5 w-7 rounded-full ${values[k] !== undefined ? "bg-brand-400" : i === step ? "bg-white/60" : "bg-white/15"}`} />
                  ))}
                </span>
              </div>
              {prefilled && (
                <p className="flex items-center gap-2 text-xs font-semibold text-brand-400">
                  <Check size={14} aria-hidden /> {t("prefilled")}
                </p>
              )}
              <h2 className="font-display text-2xl font-bold leading-snug">{t(`axes.${axis}.q`)}</h2>
              <div className="flex flex-col gap-2.5">
                {options.map((o, level) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => answer(axis, level)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-left text-base font-semibold transition-colors ${
                      values[axis] === level ? "bg-brand-400 text-ink" : "bg-white/5 ring-1 ring-white/12 hover:bg-white/10 hover:ring-brand-400/50"
                    }`}
                  >
                    <span className="flex gap-0.5" aria-hidden>
                      {Array.from({ length: LEVELS - 1 }, (_, b) => (
                        <span key={b} className={`h-3.5 w-1.5 rounded-sm ${b < level ? "bg-brand-400" : "bg-white/20"}`} />
                      ))}
                    </span>
                    <span className="flex-1">{o}</span>
                    <ArrowRight size={18} aria-hidden className="shrink-0 opacity-50" />
                  </button>
                ))}
              </div>
              {step > 0 && (
                <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-1.5 self-start text-sm font-semibold text-white/60 hover:text-white">
                  <ArrowLeft size={15} aria-hidden /> {t("back")}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="flex flex-col gap-2 rounded-xl bg-[#ff6b59]/10 p-4 ring-1 ring-[#ff6b59]/40">
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff9b8e]">{t("weakest")}</p>
                <p className="font-display text-2xl font-bold">{t(`axes.${weakest}.label`)}</p>
                <p className="text-sm text-white/75">
                  <span className="font-semibold text-white">{t("nextStep")}:</span> {t(`fix.${weakest}`)}
                </p>
              </div>
              <Link
                href={{ pathname: "/case-studies/[slug]", params: { slug: caseSlug } }}
                onClick={() => trackEvent("check_case", { slug: caseSlug })}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm ring-1 ring-white/10 hover:bg-white/10"
              >
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.1em] text-white/50">{t("proofLabel")}</span>
                  <span className="font-semibold">{t(`proof.${weakest}`)}</span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-300">
                  {t("seeCase")} <ArrowRight size={15} aria-hidden />
                </span>
              </Link>

              {status === "done" ? (
                <p role="status" className="flex items-center gap-2 rounded-xl bg-leaf-500/15 px-4 py-3 text-sm font-semibold text-leaf-400 ring-1 ring-leaf-500/30">
                  <Check size={18} aria-hidden /> {t("done")}
                </p>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-3">
                  {/* The gift for the weakest axis (or the one picked in the library). */}
                  <div className="flex items-center gap-4 rounded-xl bg-brand-400/10 p-3 ring-1 ring-brand-400/35">
                    <GiftBox open={done} className="h-24 w-24 shrink-0 sm:h-28 sm:w-28" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand-400">{giftPick ? tg("chosen") : tg("eyebrow")}</p>
                      <h2 className="font-display text-lg font-bold leading-snug sm:text-xl">{tg(`items.${gift}.title`)}</h2>
                      <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
                        <span className="rounded-full bg-white/10 px-2 py-0.5 font-semibold text-white/80">{tg(`formats.${GIFT_MAP[gift].format}`)}</span>
                        <span className={GIFT_MAP[gift].status === "ready" ? "text-brand-400" : "text-white/55"}>{tg(GIFT_MAP[gift].status)}</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-white/65">{GIFT_MAP[gift].status === "ready" ? tg("claimReady") : tg("claimSoon")}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input name="name" required maxLength={120} autoComplete="name" placeholder={t("name")} aria-label={t("name")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    <input name="phone" required inputMode="tel" pattern="[0-9+\s.\-()]{8,30}" autoComplete="tel" placeholder={t("phone")} aria-label={t("phone")} className="rounded-xl bg-white px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                  <button type="submit" disabled={status === "sending"} className="rounded-full bg-brand-400 px-5 py-3.5 text-base font-bold text-ink transition-colors hover:bg-brand-500 disabled:opacity-60">
                    {status === "sending" ? t("sending") : tg("submit")}
                  </button>
                  {status === "error" && <p role="alert" className="text-sm text-red-300">{t("error")}</p>}
                </form>
              )}

              <button
                type="button"
                onClick={sendViaZalo}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#6ea6f7] px-5 py-3 text-sm font-bold text-ink hover:brightness-110"
              >
                <MessageCircle size={18} aria-hidden /> {t("zaloResult")}
              </button>
              {zaloCopied && (
                <p role="status" className="-mt-2 text-center text-xs font-semibold text-[#6ea6f7]">
                  {t("zaloCopied")}
                </p>
              )}
              {/* Gift opens once the visitor has left contact (form or Zalo). */}
              {(status === "done" || zaloSent) && <GiftContent gift={gift} />}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-sm font-semibold">
                <a href={`tel:${COMPANY.phone}`} onClick={() => trackEvent("check_cta", { to: "call" })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
                  <Phone size={16} aria-hidden /> {t("orCall", { phone: COMPANY.phoneDisplay })}
                </a>
                <Link href="/booking" onClick={() => trackEvent("check_cta", { to: "booking" })} className="inline-flex items-center gap-1.5 text-white/75 hover:text-white">
                  <CalendarCheck size={16} aria-hidden /> {t("orBook")}
                </Link>
                <button type="button" onClick={restart} className="ml-auto inline-flex items-center gap-1.5 text-white/50 hover:text-white">
                  <RotateCcw size={14} aria-hidden /> {t("restart")}
                </button>
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
