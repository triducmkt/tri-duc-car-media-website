import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Megaphone,
  UserRoundCheck,
  ClipboardList,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";

const icons = [Megaphone, UserRoundCheck, ClipboardList, Building2, LayoutDashboard];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services" });
  return { title: t("title") };
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");
  const items = t.raw("items") as { title: string; description: string }[];

  return (
    <>
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container>
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} tone="dark" />
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container className="flex flex-col gap-6">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={service.title}
                className="flex flex-col gap-5 rounded-2xl bg-paper-soft p-8 ring-1 ring-black/5 sm:flex-row sm:items-start sm:gap-8"
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
