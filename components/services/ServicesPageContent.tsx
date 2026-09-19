"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { SystemIcon, SpotlightIcon, SequenceIcon, ClusterIcon, HubIcon } from "@/components/icons";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Reveal } from "@/components/Reveal";
import Diagnostic from "@/components/services/Diagnostic";

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
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container>
          <h1 className="sr-only">{tDiag("pageHeading")}</h1>
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
                      ? "bg-gold-500/[0.06] ring-2 ring-gold-500 shadow-lg shadow-gold-500/10"
                      : "bg-white/[0.03] ring-1 ring-white/10 hover:ring-gold-500/30"
                  }`}
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
                      isRecommended ? "bg-gold-500 text-ink" : "bg-gold-500/10 text-gold-400"
                    }`}
                  >
                    <Icon size={26} aria-hidden />
                  </span>
                  <div className="flex flex-1 flex-col gap-3">
                    <span className="font-serif text-xs font-semibold uppercase tracking-[0.14em] text-gold-400">
                      0{index + 1}
                    </span>
                    <h2 className="font-display text-xl font-semibold text-white">{service.title}</h2>
                    <p className="text-sm leading-relaxed text-white/65 sm:text-base">
                      {service.description}
                    </p>
                    {isRecommended && (
                      <span className="inline-flex w-fit items-center rounded-full bg-gold-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-ink">
                        {tDiag("recBadge")}
                      </span>
                    )}
                    <Button
                      href="/booking"
                      variant="ghost"
                      className="mt-2 self-start !text-white !ring-white/20 hover:!bg-white/10"
                    >
                      {t("ctaLabel")}
                    </Button>
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
