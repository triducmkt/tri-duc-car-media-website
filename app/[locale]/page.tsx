import { setRequestLocale } from "next-intl/server";
import SystemHero from "@/components/home/SystemHero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { ConsultReel } from "@/components/home/ConsultReel";
import { FreedomCalculator } from "@/components/home/FreedomCalculator";
import { ProofEngine } from "@/components/home/ProofEngine";
import { VatAdvantage } from "@/components/VatAdvantage";
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
      <SystemHero skipHref="#tinh-gio" />
      <ConsultReel />
      <div aria-hidden className="h-20 bg-gradient-to-b from-ink to-paper sm:h-28" />
      <FreedomCalculator />
      <ProofEngine />
      <VatAdvantage id="hoa-don-vat" />
      <div id="tru-cot">
        <ServicesGrid />
      </div>
      <FounderIntro />
      <Process />
      <CaseStudiesPreview items={caseStudies} locale={locale} />
      <Testimonials items={testimonials} locale={locale} />
      <CtaBanner />
    </>
  );
}
