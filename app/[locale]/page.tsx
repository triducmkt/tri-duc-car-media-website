import { setRequestLocale } from "next-intl/server";
import { LightHero } from "@/components/home/LightHero";
import { ChapterDial } from "@/components/home/ChapterDial";
import { HouseCallMap } from "@/components/home/HouseCallMap";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { FreedomCalculator } from "@/components/home/FreedomCalculator";
import { ProofEngine } from "@/components/home/ProofEngine";
import { FreedomLadder } from "@/components/home/FreedomLadder";
import { VatAdvantage } from "@/components/VatAdvantage";
import { FounderIntro } from "@/components/home/FounderIntro";
import { Process } from "@/components/home/Process";
import { CaseStudiesPreview } from "@/components/home/CaseStudiesPreview";
import { Testimonials } from "@/components/home/Testimonials";
import { CtaBanner } from "@/components/home/CtaBanner";
import { ChannelOrbit } from "@/components/channels/ChannelOrbit";
import { SectionSeam } from "@/components/SectionSeam";
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
      <LightHero />
      <SectionSeam to="dark" />
      <HouseCallMap />
      <SectionSeam to="light" />
      <FreedomCalculator />
      <SectionSeam to="dark" />
      <FreedomLadder variant="teaser" />
      <ProofEngine />
      <SectionSeam to="light" light="paper-soft" />
      <VatAdvantage id="hoa-don-vat" />
      <div id="tru-cot">
        <ServicesGrid />
      </div>
      <div id="nguoi-dong-hanh">
        <FounderIntro />
      </div>
      <SectionSeam to="dark" light="paper-soft" />
      <ChannelOrbit videos={videos} />
      <div id="quy-trinh">
        <Process />
      </div>
      <SectionSeam to="light" />
      <CaseStudiesPreview items={caseStudies} locale={locale} />
      <Testimonials items={testimonials} locale={locale} />
      <SectionSeam to="dark" light={testimonials.length > 0 ? "paper-soft" : "paper"} />
      <CtaBanner />
      <ChapterDial />
    </>
  );
}
