import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export function CtaBanner() {
  const t = useTranslations("home");

  return (
    <section className="relative overflow-hidden bg-brand-500 py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,rgba(255,255,255,0.25),transparent)]"
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <h2 className="font-display max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {t("ctaBannerHeading")}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {t("ctaBannerBody")}
        </p>
        <Button
          href="/booking"
          variant="secondary"
          className="!bg-white !text-brand-600 hover:!bg-white/90"
        >
          {t("ctaBannerButton")}
        </Button>
      </Container>
    </section>
  );
}
