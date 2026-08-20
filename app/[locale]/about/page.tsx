import { getTranslations, setRequestLocale } from "next-intl/server";
import { ShieldCheck, Repeat, TrendingUp } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { FounderPortrait } from "@/components/FounderPortrait";

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

  const values = [
    { Icon: ShieldCheck, title: t("value1Title"), body: t("value1Body") },
    { Icon: Repeat, title: t("value2Title"), body: t("value2Body") },
    { Icon: TrendingUp, title: t("value3Title"), body: t("value3Body") },
  ];

  return (
    <>
      <section className="bg-ink py-20 text-white sm:py-28">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <FounderPortrait
            priority
            className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[1.5rem] ring-1 ring-white/15"
          />
          <div className="flex flex-col items-start gap-4">
            <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300 ring-1 ring-white/15">
              {t("eyebrow")}
            </span>
            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              {t("name")}
            </h1>
            <p className="text-lg font-medium text-white/80">{t("roleLine")}</p>
            <p className="font-display bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-2xl font-semibold text-transparent">
              {t("quote")}
            </p>
            <p className="max-w-xl text-base leading-relaxed text-white/70">{t("bodyIntro")}</p>
            <Button href="/contact" variant="primary" className="mt-2">
              {t("contactCta")}
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-28">
        <Container className="mx-auto flex max-w-3xl flex-col gap-14">
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink">{t("body1Heading")}</h2>
            <p className="text-base leading-relaxed text-ink-muted">{t("body1")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink">{t("body2Heading")}</h2>
            <p className="text-base leading-relaxed text-ink-muted">{t("body2")}</p>
          </div>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold text-ink">{t("body3Heading")}</h2>
            <p className="text-base leading-relaxed text-ink-muted">{t("body3")}</p>
          </div>
        </Container>
      </section>

      <section className="bg-paper-soft py-20 sm:py-28">
        <Container className="flex flex-col gap-12">
          <SectionHeading heading={t("valuesHeading")} align="center" />
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map(({ Icon, title, body }) => (
              <div
                key={title}
                className="flex flex-col items-center gap-3 rounded-2xl bg-paper p-7 text-center ring-1 ring-black/5"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600">
                  <Icon size={22} aria-hidden />
                </span>
                <h3 className="font-display text-base font-semibold text-ink">{title}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
