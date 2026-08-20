import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import type { CaseStudy } from "@/lib/sanity/types";

export function CaseStudiesPreview({
  items,
  locale,
}: {
  items: CaseStudy[];
  locale: "vi" | "en";
}) {
  const t = useTranslations("home");
  const tCase = useTranslations("caseStudies");

  if (items.length === 0) return null;

  return (
    <section className="bg-paper py-20 sm:py-28">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading eyebrow={t("caseStudiesEyebrow")} heading={t("caseStudiesHeading")} />
          <Button href="/case-studies" variant="ghost" className="shrink-0">
            {t("caseStudiesCta")}
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <CaseStudyCard key={item._id} item={item} locale={locale} readMoreLabel={tCase("readMore")} />
          ))}
        </div>
      </Container>
    </section>
  );
}
