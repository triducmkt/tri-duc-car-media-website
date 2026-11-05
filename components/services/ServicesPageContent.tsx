"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SystemIcon, SpotlightIcon, SequenceIcon, ClusterIcon, HubIcon } from "@/components/icons";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import Diagnostic from "@/components/services/Diagnostic";
import { SystemBuilder } from "@/components/services/SystemBuilder";
import { VatAdvantage } from "@/components/VatAdvantage";
import { FreedomLadder } from "@/components/home/FreedomLadder";
import { PriceStudio } from "@/components/services/PriceStudio";
import { SERVICES, formatVnd, type Locale } from "@/lib/servicesCatalog";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const icons = [SystemIcon, SpotlightIcon, SequenceIcon, ClusterIcon, HubIcon];

// Which diagnostic bottleneck (see diagnosticLayout.ts → ModuleKey) each
// services.items entry answers. Must stay in the same order as that list;
// "" means the diagnostic never recommends this package directly.
const PACKAGE_KEYS = ["SALES", "", "SOP", "MKT", "DATA"];

export function ServicesPageContent() {
  const t = useTranslations("services");
  const tDiag = useTranslations("diagnostic");
  const items = t.raw("items") as { title: string; description: string }[];
  const [recommended, setRecommended] = useState("");
  const locale = useLocale() as Locale;
  const tp = useTranslations("pricing");

  async function sendLead(lead: { name: string; phone: string; score: number; bottleneck: string }) {
    const r = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return r.ok;
  }

  return (
    <>
      <FreedomLadder variant="full" />
      <PriceStudio />
      <SystemBuilder />
      <VatAdvantage id="hoa-don-vat" />

      <section className="border-t border-white/5 bg-ink py-20 text-white sm:py-24">
        <Container>
          <h2 className="sr-only">{tDiag("pageHeading")}</h2>
          <Diagnostic onSubmitLead={sendLead} onResult={setRecommended} />
        </Container>
      </section>

      <section className="bg-ink py-20 sm:py-24">
        <Container className="flex flex-col gap-6">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            const isRecommended = PACKAGE_KEYS[index] !== "" && PACKAGE_KEYS[index] === recommended;
            return (
              <Reveal key={service.title} delay={index * 80}>
                <div
                  className={`flex flex-col gap-5 rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 sm:flex-row sm:items-start sm:gap-8 ${
                    isRecommended
                      ? "bg-brand-500/[0.06] ring-2 ring-brand-500 shadow-lg shadow-brand-500/10"
                      : "bg-white/[0.03] ring-1 ring-white/10 hover:ring-brand-500/30"
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      isRecommended ? "bg-brand-500 text-ink" : "bg-brand-500/10 text-brand-400"
                    }`}
                  >
                    <Icon size={26} aria-hidden />
                  </span>
                  <div className="flex flex-1 flex-col gap-3">
                    <span className="font-serif text-xs font-semibold uppercase tracking-[0.14em] text-brand-400">
                      0{index + 1}
                    </span>
                    <h2 className="font-display text-xl font-semibold text-white">{service.title}</h2>
                    <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                      {service.description}
                    </p>
                    {isRecommended && (
                      <span className="inline-flex w-fit items-center rounded-full bg-brand-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
                        {tDiag("recBadge")}
                      </span>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                      {SERVICES[index] ? (
                        <span className="font-display text-lg font-bold text-white">
                          {formatVnd(SERVICES[index].price.amount, locale)}
                          {SERVICES[index].price.estimated ? <span className="text-brand-400">*</span> : null}
                          <span className="ml-1 text-sm font-medium text-white/55">
                            {SERVICES[index].price.unit === "month" ? tp("perMonth") : tp("once")}
                          </span>
                        </span>
                      ) : null}
                      {SERVICES[index] ? (
                        <Link
                          href={{ pathname: "/services/[slug]", params: { slug: SERVICES[index].slug } }}
                          className="inline-flex items-center rounded-full px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/10"
                        >
                          {tp("detail")}
                        </Link>
                      ) : null}
                      <Button href="/booking" variant="ghost" className="self-start !text-white !ring-white/20 hover:!bg-white/10">
                        {t("ctaLabel")}
                      </Button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </Container>
      </section>
    </>
  );
}
