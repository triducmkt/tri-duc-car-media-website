import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { BookingForm } from "@/components/forms/BookingForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booking" });
  return { title: t("title") };
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("booking");

  return (
    <section className="bg-paper-soft py-16 sm:py-24">
      <Container className="mx-auto flex max-w-2xl flex-col gap-10">
        <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} />
        <div className="rounded-2xl bg-paper p-6 ring-1 ring-black/5 sm:p-10">
          <BookingForm />
        </div>
      </Container>
    </section>
  );
}
