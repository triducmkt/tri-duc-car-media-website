import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";

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
        />

        <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex flex-col gap-3 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <span className="font-display text-3xl font-bold text-brand-300">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-base font-semibold">{step.title}</h3>
              <p className="text-sm leading-relaxed text-white/65">{step.body}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
