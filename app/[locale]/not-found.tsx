import { useTranslations } from "next-intl";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";

export default function NotFound() {
  const t = useTranslations("common");

  return (
    <section className="bg-paper py-32">
      <Container className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
        <span className="font-display text-6xl font-bold text-brand-500">404</span>
        <h1 className="font-display text-2xl font-semibold text-ink">{t("notFoundTitle")}</h1>
        <p className="text-base text-ink-muted">{t("notFoundBody")}</p>
        <Button href="/" variant="primary" className="mt-2">
          {t("notFoundCta")}
        </Button>
      </Container>
    </section>
  );
}
