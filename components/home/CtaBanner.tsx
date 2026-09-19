import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export function CtaBanner() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,rgba(240,192,105,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl"
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="font-serif max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("ctaBannerHeading")}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          {t("ctaBannerBody")}
        </p>
        <Button
          href="/booking"
          variant="secondary"
          className="!bg-gold-500 !text-ink hover:!bg-gold-400"
        >
          {t("ctaBannerButton")}
        </Button>
      </Container>
    </section>
  );
}
