import { setRequestLocale } from "next-intl/server";
import { FootageHero } from "@/components/home/FootageHero";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FreedomCalculator } from "@/components/home/FreedomCalculator";
import { ShopDashboard } from "@/components/home/ShopDashboard";
import { ProofEngine } from "@/components/home/ProofEngine";
import { VatAdvantage } from "@/components/VatAdvantage";
import { FounderIntro } from "@/components/home/FounderIntro";
import { Process } from "@/components/home/Process";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ChannelOrbit } from "@/components/channels/ChannelOrbit";
import { getChannelVideos, getFeaturedCaseStudies, getTestimonials } from "@/lib/sanity/queries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [caseStudies, testimonials, videos] = await Promise.all([
    getFeaturedCaseStudies(3),
    getTestimonials(),
    getChannelVideos(locale),
  ]);

  return (
    <>
      <FootageHero skipHref="#dong-ho" />
      <ShopDashboard />
      <div aria-hidden className="h-20 bg-gradient-to-b from-ink to-paper sm:h-28" />
      <FreedomCalculator />
      <ProofEngine />
      <VatAdvantage id="hoa-don-vat" />
      <div id="tru-cot">
        <ServicesGrid />
      </div>
      <FounderIntro />
      <ChannelOrbit videos={videos} />
      <Process />
      <CaseStudiesPreview items={caseStudies} locale={locale} />
      <Testimonials items={testimonials} locale={locale} />
      <CtaBanner />
    </>
  );
}
