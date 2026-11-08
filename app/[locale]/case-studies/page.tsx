import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionSeam } from "@/components/SectionSeam";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { Reveal } from "@/components/Reveal";
import { getCaseStudies } from "@/lib/sanity/queries";
import { CaseMap } from "@/components/case-studies/CaseMap";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "caseStudies" });
  return { title: t("title") };
}

export default async function CaseStudiesPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("caseStudies");
  const items = await getCaseStudies();

  return (
    <>
      <CaseMap />

      <SectionSeam to="light" />
      <section className="surface-light py-20 sm:py-24">
        <Container className="flex flex-col gap-10">
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} serif />
          {items.length === 0 ? (
            <p className="text-base text-ink-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item, index) => (
                <Reveal key={item._id} delay={index * 90}>
                  <CaseStudyCard
                    item={item}
                    locale={locale}
                    readMoreLabel={t("readMore")}
                    ongoingLabel={t("ongoingBadge")}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
