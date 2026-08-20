import { Mail, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");

  return (
    <section className="bg-paper-soft py-16 sm:py-24">
      <Container className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="flex flex-col gap-8">
          <SectionHeading eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} />

          <div className="flex flex-col gap-4">
            <a
              href="tel:0769918685"
              className="flex items-center gap-3 rounded-xl bg-paper p-4 text-sm font-medium text-ink ring-1 ring-black/5 transition-colors hover:ring-brand-500/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                <Phone size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-xs text-ink-muted">{t("phoneLabel")}</span>
                076.991.8685
              </span>
            </a>
            <a
              href="mailto:tangtriduc@triduccar.media"
              className="flex items-center gap-3 rounded-xl bg-paper p-4 text-sm font-medium text-ink ring-1 ring-black/5 transition-colors hover:ring-brand-500/40"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                <Mail size={18} aria-hidden />
              </span>
              <span>
                <span className="block text-xs text-ink-muted">{t("emailLabel")}</span>
                tangtriduc@triduccar.media
              </span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-paper p-6 ring-1 ring-black/5 sm:p-10">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
