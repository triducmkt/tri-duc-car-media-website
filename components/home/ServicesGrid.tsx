import { useTranslations } from "next-intl";
import {
  Megaphone,
  UserRoundCheck,
  ClipboardList,
  Building2,
  LayoutDashboard,
} from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

const icons = [Megaphone, UserRoundCheck, ClipboardList, Building2, LayoutDashboard];

export function ServicesGrid() {
  const t = useTranslations("home");
  const tServices = useTranslations("services");
  const items = tServices.raw("items") as { title: string; description: string }[];

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={t("servicesEyebrow")}
          heading={t("servicesHeading")}
          sub={t("servicesSub")}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <div
                key={service.title}
                className="group flex flex-col gap-4 rounded-2xl bg-paper-soft p-7 ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="font-display text-lg font-semibold text-ink">{service.title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{service.description}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
