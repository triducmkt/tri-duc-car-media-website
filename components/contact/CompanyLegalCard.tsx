"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BadgeCheck, Check, ClipboardCopy, Copy, FileCheck2, MapPin } from "lucide-react";
import { COMPANY, companyAddressLine, formatViDate } from "@/lib/company";
import { trackEvent } from "@/lib/tracking/grid";

/** Business-registration card for the contact page (#phap-ly). Lets a client's
 *  accountant copy the tax code or the whole supplier block in one tap. */
export function CompanyLegalCard() {
  const t = useTranslations("legal");
  const [copied, setCopied] = useState<"" | "mst" | "all">("");

  const copy = async (what: "mst" | "all") => {
    const text =
      what === "mst"
        ? COMPANY.taxCode
        : [
            COMPANY.legalNameVi,
            `${t("taxCode")}: ${COMPANY.taxCode}`,
            `${t("address")}: ${companyAddressLine}`,
            `${t("representative")}: ${COMPANY.representative} — ${COMPANY.representativeTitle}`,
            `${t("phone")}: ${COMPANY.phoneDisplay} · Email: ${COMPANY.email}`,
          ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {}
    trackEvent("legal_copy", { what });
  };

  const rows: [string, React.ReactNode][] = [
    [t("legalName"), <span key="n" className="font-bold">{COMPANY.legalNameVi}</span>],
    [t("intlName"), `${COMPANY.legalNameEn} (${COMPANY.shortName})`],
    [
      t("taxCode"),
      <span key="t" className="flex flex-wrap items-center gap-2">
        <span className="font-display text-lg font-extrabold tracking-wide text-ink">{COMPANY.taxCode}</span>
        <button
          type="button"
          onClick={() => copy("mst")}
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-black/10 hover:bg-black/[0.04]"
        >
          {copied === "mst" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
          {copied === "mst" ? t("copied") : t("copy")}
        </button>
        <a
          href={COMPANY.taxLookupUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-brand-600 hover:underline"
        >
          {t("lookup")} ↗
        </a>
      </span>,
    ],
    [t("type"), COMPANY.type],
    [
      t("address"),
      <a
        key="a"
        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(companyAddressLine)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex gap-1.5 hover:text-brand-600"
      >
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
        {companyAddressLine}
      </a>,
    ],
    [t("representative"), `${COMPANY.representative} — ${COMPANY.representativeTitle}`],
    [t("capital"), t("capitalValue")],
    [
      t("registered"),
      t("registeredValue", {
        first: formatViDate(COMPANY.registeredOn),
        amended: formatViDate(COMPANY.amendedOn),
        issuer: COMPANY.issuer,
      }),
    ],
  ];

  return (
    <div id="phap-ly" className="scroll-mt-28 overflow-hidden rounded-2xl bg-paper ring-1 ring-black/5">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-ink px-5 py-4 text-white">
        <p className="flex items-center gap-2 text-sm font-bold">
          <BadgeCheck className="h-5 w-5 text-gold-400" aria-hidden />
          {t("heading")}
        </p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-500 px-3 py-1 text-xs font-bold text-ink">
          <FileCheck2 className="h-3.5 w-3.5" aria-hidden /> {t("vatBadge")}
        </span>
      </div>
      <dl className="divide-y divide-black/5">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[150px_1fr] sm:gap-4">
            <dt className="text-ink-muted">{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-col gap-3 border-t border-black/5 bg-paper-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink-muted">{t("note")}</p>
        <button
          type="button"
          onClick={() => copy("all")}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2.5 text-xs font-bold text-white hover:bg-ink-soft"
        >
          {copied === "all" ? <Check className="h-4 w-4" aria-hidden /> : <ClipboardCopy className="h-4 w-4" aria-hidden />}
          {copied === "all" ? t("copied") : t("copyAll")}
        </button>
      </div>
    </div>
  );
}
