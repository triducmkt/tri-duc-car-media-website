import { useTranslations } from "next-intl";
import { SystemIcon, SpotlightIcon, SequenceIcon, ClusterIcon, HubIcon } from "@/components/icons";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

const icons = [SystemIcon, SpotlightIcon, SequenceIcon, ClusterIcon, HubIcon];

export function ServicesGrid() {
  const t = useTranslations("home");
  const tServices = useTranslations("services");
  const items = tServices.raw("items") as { title: string; description: string }[];

  return (
    <section className="surface-light py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={t("servicesEyebrow")}
          accent={t("servicesAccent")}
          heading={t("servicesAnchor")}
          sub={t("servicesSub")}
        />

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((service, index) => {
            const Icon = icons[index % icons.length];
            return (
              <Reveal key={service.title} delay={index * 80}>
                <div className="card-premium group flex h-full flex-col gap-4 rounded-2xl p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3 className="font-serif text-lg font-semibold text-ink">{service.title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{service.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
