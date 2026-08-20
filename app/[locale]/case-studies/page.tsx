import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { getCaseStudies } from "@/lib/sanity/queries";

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
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container>
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} tone="dark" />
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          {items.length === 0 ? (
            <p className="text-base text-ink-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <CaseStudyCard key={item._id} item={item} locale={locale} readMoreLabel={t("readMore")} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
