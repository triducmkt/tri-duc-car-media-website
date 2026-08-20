import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { FounderPortrait } from "@/components/FounderPortrait";

export function Hero() {
  const t = useTranslations("home");

  const stats = [
    { value: t("heroStat1Value"), label: t("heroStat1Label") },
    { value: t("heroStat2Value"), label: t("heroStat2Label") },
    { value: t("heroStat3Value"), label: t("heroStat3Label") },
  ];

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_75%_0%,rgba(66,133,244,0.35),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
      />

      <Container className="relative grid gap-12 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
        <div className="flex flex-col items-start gap-6">
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-300 ring-1 ring-white/15">
            {t("heroEyebrow")}
          </span>

          <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-gold-400 to-gold-600 bg-clip-text text-transparent">
              {t("heroName")}
            </span>
          </h1>

          <p className="font-display text-2xl font-semibold text-white sm:text-3xl">
            {t("heroTagline")}
          </p>

          <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            {t("heroSubline")}
          </p>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Button href="/booking" variant="primary">
              {t("heroCtaPrimary")}
            </Button>
            <Button href="/services" variant="ghost" className="!ring-white/25 !text-white hover:!bg-white/10">
              {t("heroCtaSecondary")}
            </Button>
          </div>

          <dl className="mt-8 grid w-full grid-cols-3 gap-4 border-t border-white/10 pt-6">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </dd>
                <dd className="text-xs leading-snug text-white/55 sm:text-sm">{stat.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div
            aria-hidden
            className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-brand-500/40 via-transparent to-gold-500/20 blur-2xl"
          />
          <FounderPortrait
            priority
            className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] ring-1 ring-white/15"
          />
        </div>
      </Container>
    </section>
  );
}
