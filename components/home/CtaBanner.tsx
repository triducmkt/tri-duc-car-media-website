import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { Lockup } from "@/components/Lockup";

export function CtaBanner() {
  const t = useTranslations("home");
  const tc = useTranslations("check");

  return (
    <section className="relative overflow-hidden bg-ink py-20 sm:py-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_0%,rgba(110,166,247,0.16),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-500/10 blur-3xl"
      />
      <Container className="relative flex flex-col items-center gap-6 text-center">
        <Lockup accent={t("ctaBannerAccent")} anchor={t("ctaBannerAnchor")}
          align="center" />
        <p className="max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
          <span className="font-semibold text-white">{t("ctaBannerHeading")}</span> {t("ctaBannerBody")}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Button
            href="/booking"
            variant="secondary"
            className="!bg-brand-500 !text-ink hover:!bg-brand-400"
          >
            {t("ctaBannerButton")}
          </Button>
          <Button href="/check" variant="secondary" className="!bg-transparent !text-white ring-1 ring-white/30 hover:!bg-white/10">
            {tc("finalCta")} · 60s
          </Button>
        </div>
      </Container>
    </section>
  );
}
