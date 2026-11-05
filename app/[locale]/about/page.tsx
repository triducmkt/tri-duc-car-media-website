import { getTranslations, setRequestLocale } from "next-intl/server";
import { BondIcon, ReplicateIcon, AscendIcon } from "@/components/icons";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { FounderPortrait } from "@/components/FounderPortrait";
import { FounderAura } from "@/components/about/FounderAura";
import { Reveal } from "@/components/Reveal";
import { FounderJourney, type JourneyStop } from "@/components/about/FounderJourney";
import { BrandStory } from "@/components/about/BrandStory";
import { getCaseStudies } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const caseStudies = await getCaseStudies();

  // Journey stops, same order as messages → about.journey.stops.
  const cover = (slug: string) => {
    const img = caseStudies.find((c) => c.slug === slug)?.coverImage;
    return img ? urlForImage(img).width(240).height(300).fit("crop").auto("format").url() : undefined;
  };
  const caseStop = (slug: string): JourneyStop => ({
    href: { pathname: "/case-studies/[slug]", params: { slug } },
    image: cover(slug),
  });
  const journey: JourneyStop[] = [
    caseStop("ap-car-care"),
    caseStop("johnny-loc-nguyen-he-sinh-thai-ap"),
    caseStop("hoc-vien-detailing-viet-nam"),
    { ...caseStop("khang-vu-auto-care"), image: "/behind/khang-vu.webp" },
    { href: { pathname: "/contact", hash: "phap-ly" } },
  ];

  const values = [
    { Icon: BondIcon, title: t("value1Title"), body: t("value1Body") },
    { Icon: ReplicateIcon, title: t("value2Title"), body: t("value2Body") },
    { Icon: AscendIcon, title: t("value3Title"), body: t("value3Body") },
  ];

  const bodyBlocks = [
    { heading: t("body1Heading"), body: t("body1") },
    { heading: t("body2Heading"), body: t("body2") },
    { heading: t("body3Heading"), body: t("body3") },
  ];

  return (
    <>
      <section className="overflow-hidden bg-ink py-20 text-white sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm">
            <FounderAura />
            <FounderPortrait
              priority
              className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.5rem] ring-1 ring-white/15"
            />
          </div>
          <div className="flex flex-col items-start gap-4">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300 ring-1 ring-white/15">
              {t("eyebrow")}
            </span>
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">
              {t("name")}
            </h1>
            <p className="text-lg font-medium text-white/80">{t("roleLine")}</p>
            <p className="font-serif bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-2xl font-semibold text-transparent">
              {t("quote")}
            </p>
            <p className="max-w-xl text-base leading-relaxed text-white/70">{t("bodyIntro")}</p>
            <Button href="/contact" variant="primary" className="mt-2">
              {t("contactCta")}
            </Button>
          </div>
        </Container>
      </section>

      <FounderJourney stops={journey} />

      {/* Brand story: animated logo, meaning of the name + logo, slogan, mission.
          Vision (#tam-nhin) and core values (#gia-tri) follow. */}
      <BrandStory />

      <section id="tam-nhin" className="relative overflow-hidden bg-ink py-20 text-white sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_50%_at_50%_0%,rgba(110,166,247,0.16),transparent)]"
        />
        <Container className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-400">{t("visionEyebrow")}</span>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{t("visionHeading")}</h2>
          <p className="text-lg leading-relaxed text-white/75 sm:text-xl">{t("vision")}</p>
          <Button href="/services" variant="primary" className="mt-2">
            {t("visionCta")}
          </Button>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container className="mx-auto flex max-w-3xl flex-col gap-10">
          {bodyBlocks.map((block, index) => (
            <Reveal key={block.heading} delay={index * 100} className="flex gap-5">
              <span className="font-serif shrink-0 text-3xl font-bold text-brand-500/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-3 border-l border-black/10 pl-5">
                <h2 className="font-display text-2xl font-semibold text-ink">{block.heading}</h2>
                <p className="text-base leading-relaxed text-ink-muted">{block.body}</p>
              </div>
            </Reveal>
          ))}
        </Container>
      </section>

      <section id="gia-tri" className="bg-paper-soft py-20 sm:py-28">
        <Container className="flex flex-col gap-12">
          <SectionHeading heading={t("valuesHeading")} align="center" />
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map(({ Icon, title, body }, index) => (
              <Reveal key={title} delay={index * 90}>
                <div className="flex h-full flex-col items-center gap-3 rounded-2xl bg-paper p-7 text-center ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:ring-brand-500/30">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                    <Icon size={22} aria-hidden />
                  </span>
                  <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
