"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Megaphone,
  UserRoundCheck,
  ClipboardList,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import Diagnostic from "@/components/services/Diagnostic";

const icons = [Megaphone, UserRoundCheck, ClipboardList, Building2, LayoutDashboard];

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

      <section className="bg-paper py-20 sm:py-24">
        <Container className="flex flex-col gap-6">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            const isRecommended = PACKAGE_KEYS[index] !== "" && PACKAGE_KEYS[index] === recommended;
            return (
              <div
                key={service.title}
                className={`flex flex-col gap-5 rounded-2xl bg-paper-soft p-8 ring-1 sm:flex-row sm:items-start sm:gap-8 ${
                  isRecommended ? "ring-2 ring-brand-500" : "ring-1 ring-black/5"
                }`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600">
                  <Icon size={26} aria-hidden />
                </span>
                <div className="flex flex-1 flex-col gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
                    0{index + 1}
                  </span>
                  <h2 className="font-display text-xl font-semibold text-ink">{service.title}</h2>
                  <p className="text-sm leading-relaxed text-ink-muted sm:text-base">
                    {service.description}
                  </p>
                  {isRecommended && (
                    <span className="inline-flex w-fit items-center rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
                      {tDiag("recBadge")}
                    </span>
                  )}
                  <Button href="/booking" variant="ghost" className="mt-2 self-start">
                    {t("ctaLabel")}
                  </Button>
                </div>
              </div>
            );
          })}
        </Container>
      </section>
    </>
  );
}
