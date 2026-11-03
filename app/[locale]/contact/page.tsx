import { Mail, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/forms/ContactForm";
import { CompanyLegalCard } from "@/components/contact/CompanyLegalCard";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { COMPANY } from "@/lib/company";
import { ChannelOrbit } from "@/components/channels/ChannelOrbit";
import { getChannelVideos } from "@/lib/sanity/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("metaDescription") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const videos = await getChannelVideos(locale);

  const channels = [
    { href: `tel:${COMPANY.phone}`, Icon: Phone, label: t("phoneLabel"), value: COMPANY.phoneDisplay, external: false },
    { href: COMPANY.zalo, Icon: MessageCircle, label: "Zalo", value: COMPANY.phoneDisplay, external: true },
    { href: `mailto:${COMPANY.email}`, Icon: Mail, label: t("emailLabel"), value: COMPANY.email, external: false },
    { href: COMPANY.fanpage, Icon: FacebookIcon, label: t("fanpageLabel"), value: "facebook.com/triduccar.media", external: true },
  ];

  return (
    <>
      <section className="bg-paper-soft pb-16 pt-28 sm:pb-24 sm:pt-32">
        <Container className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="flex flex-col gap-8">
            <SectionHeading as="h1" eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} />
  
            <div className="grid gap-3 sm:grid-cols-2">
              {channels.map(({ href, Icon, label, value, external }) => (
                <a
                  key={label}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="flex items-center gap-3 rounded-xl bg-paper p-4 text-sm font-semibold text-ink ring-1 ring-black/5 transition-colors hover:ring-brand-500/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                    <Icon size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-ink-muted">{label}</span>
                    <span className="block truncate">{value}</span>
                  </span>
                </a>
              ))}
            </div>
  
            <CompanyLegalCard />
          </div>
  
          <div className="rounded-2xl bg-paper p-6 ring-1 ring-black/5 sm:p-10 lg:sticky lg:top-24">
            <ContactForm />
          </div>
        </Container>
      </section>
      <ChannelOrbit videos={videos} />
    </>
  );
}
