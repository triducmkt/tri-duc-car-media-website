import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { FounderPortrait } from "@/components/FounderPortrait";

export function FounderIntro() {
  const t = useTranslations("home");

  return (
    <section className="bg-paper-soft py-20 sm:py-28">
      <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <FounderPortrait className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.5rem] shadow-xl shadow-black/10 ring-1 ring-black/5" />

        <div className="flex flex-col items-start gap-6">
          <SectionHeading
            eyebrow={t("founderEyebrow")}
            heading={t("founderHeading")}
            sub={t("founderBody")}
          />
          <Button href="/about" variant="secondary">
            {t("founderCta")}
          </Button>
        </div>
      </Container>
    </section>
  );
}
