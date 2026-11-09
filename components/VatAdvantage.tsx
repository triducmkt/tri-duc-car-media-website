"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Check, Copy, FileCheck2, Minus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { COMPANY } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/** USP block: a registered limited company that issues VAT e-invoices, compared
 *  with solo / freelance / household-business agencies. Copy: messages → vat. */
export function VatAdvantage({ id, tone = "light" }: { id?: string; tone?: "light" | "dark" }) {
  const t = useTranslations("vat");
  const rows = t.raw("rows") as { label: string; us: string; them: string }[];
  const [copied, setCopied] = useState(false);
  const dark = tone === "dark";

  const copyTax = async () => {
    try {
      await navigator.clipboard.writeText(COMPANY.taxCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
    trackEvent("vat_copy_mst", {});
  };

  return (
    <section id={id} className={`scroll-mt-24 py-20 sm:py-24 ${dark ? "bg-ink text-white" : "surface-light-soft text-ink"}`}>
      <Container className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
        <div className="flex flex-col gap-5">
          <p className="eyebrow-pill self-start" data-tone={dark ? "dark" : "light"}>
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{t("heading")}</h2>
          <p className={`text-base leading-relaxed sm:text-lg ${dark ? "text-white/80" : "text-ink-muted"}`}>{t("sub")}</p>

          <div
            className={`flex flex-col gap-3 rounded-2xl p-5 ring-1 ${
              dark ? "bg-white/[0.04] ring-white/10" : "bg-paper ring-black/5"
            }`}
          >
            <p className="flex items-center gap-2 text-sm font-bold">
              <BadgeCheck className="h-5 w-5 text-leaf-500" aria-hidden />
              {COMPANY.legalNameVi}
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-sm ${dark ? "text-white/60" : "text-ink-muted"}`}>{t("taxLabel")}</span>
              <span className="font-display text-2xl font-extrabold tracking-wide">{COMPANY.taxCode}</span>
              <button
                type="button"
                onClick={copyTax}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ring-1 transition-colors ${
                  dark ? "ring-white/20 hover:bg-white/10" : "ring-black/10 hover:bg-black/[0.04]"
                }`}
              >
                {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
            <a
              href={COMPANY.taxLookupUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("vat_lookup", {})}
              className={`w-fit text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-brand-300" : "text-brand-600"}`}
            >
              {t("lookup")} ↗
            </a>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/booking"
              onClick={() => trackEvent("vat_cta", { channel: "booking" })}
              className="inline-flex items-center gap-2 rounded-full bg-brand-500 btn-gradient px-6 py-3 text-sm font-bold text-ink transition-colors hover:bg-brand-400"
            >
              <FileCheck2 className="h-4 w-4" aria-hidden /> {t("cta")}
            </Link>
            <Link
              href={{ pathname: "/contact", hash: "phap-ly" }}
              onClick={() => trackEvent("vat_cta", { channel: "legal" })}
              className={`inline-flex items-center rounded-full px-6 py-3 text-sm font-bold ring-1 transition-colors ${
                dark ? "ring-white/25 hover:bg-white/10" : "ring-black/10 hover:bg-black/[0.04]"
              }`}
            >
              {t("ctaLegal")}
            </Link>
          </div>
        </div>

        <div className={`overflow-hidden rounded-2xl ring-1 ${dark ? "ring-white/10" : "bg-paper ring-black/5"}`}>
          <table className="w-full table-fixed break-words text-left text-[13px] sm:text-sm">
            <caption className="sr-only">{t("tableCaption")}</caption>
            <thead>
              <tr className={dark ? "bg-white/[0.06]" : "bg-ink text-white"}>
                <th scope="col" className="w-[30%] px-3 py-3.5 font-semibold sm:px-4">{t("colCriteria")}</th>
                <th scope="col" className="px-3 py-3.5 font-bold text-brand-400 sm:px-4">{t("colUs")}</th>
                <th scope="col" className="px-3 py-3.5 font-semibold opacity-80 sm:px-4">{t("colThem")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className={`border-t align-top ${dark ? "border-white/10" : "border-black/5"}`}>
                  <th scope="row" className="px-3 py-3.5 font-semibold sm:px-4">{r.label}</th>
                  <td className="px-3 py-3.5 sm:px-4">
                    <span className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-leaf-500" aria-hidden />
                      <span className="font-medium">{r.us}</span>
                    </span>
                  </td>
                  <td className={`px-3 py-3.5 sm:px-4 ${dark ? "text-white/60" : "text-ink-muted"}`}>
                    <span className="flex gap-2">
                      <Minus className="mt-0.5 h-4 w-4 shrink-0 opacity-60" aria-hidden />
                      {r.them}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className={`border-t px-4 py-3 text-xs ${dark ? "border-white/10 text-white/45" : "border-black/5 text-ink-muted"}`}>
            {t("footnote")}
          </p>
        </div>
      </Container>
    </section>
  );
}
