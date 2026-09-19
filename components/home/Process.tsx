import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";

export function Process() {
  const t = useTranslations("home");

  const steps = [
    { title: t("process1Title"), body: t("process1Body") },
    { title: t("process2Title"), body: t("process2Body") },
    { title: t("process3Title"), body: t("process3Body") },
    { title: t("process4Title"), body: t("process4Body") },
  ];

  return (
    <section className="bg-ink py-20 text-white sm:py-28">
      <Container className="flex flex-col gap-12">
        <SectionHeading
          eyebrow={t("processEyebrow")}
          heading={t("processHeading")}
          tone="dark"
          serif
        />

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-2xl bg-white/5 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1 hover:ring-gold-400/30"
            >
              <Reveal delay={index * 90} className="flex flex-col gap-3 p-6">
                <span className="font-serif text-3xl font-bold text-gold-400">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="font-display text-base font-semibold">{step.title}</h3>
                <p className="text-sm leading-relaxed text-white/65">{step.body}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
