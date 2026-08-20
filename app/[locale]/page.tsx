import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FounderIntro } from "@/components/home/FounderIntro";
import { Process } from "@/components/home/Process";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBanner } from "@/components/home/CtaBanner";
import { getFeaturedCaseStudies, getTestimonials } from "@/lib/sanity/queries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [caseStudies, testimonials] = await Promise.all([
    getFeaturedCaseStudies(3),
    getTestimonials(),
  ]);

  return (
    <>
      <Hero />
      <ServicesGrid />
      <FounderIntro />
      <Process />
      <CaseStudiesPreview items={caseStudies} locale={locale} />
      <Testimonials items={testimonials} locale={locale} />
      <CtaBanner />
    </>
  );
}
