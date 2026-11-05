import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { COMPANY, companyAddressLine } from "@/lib/company";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { ConsentSettingsButton } from "@/components/analytics/Tracker";
import { SERVICES, type Locale } from "@/lib/servicesCatalog";

const navItems = [
  { href: "/" as const, key: "home" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/services" as const, key: "services" as const },
  { href: "/case-studies" as const, key: "caseStudies" as const },
  { href: "/blog" as const, key: "blog" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Logo v10 with the slogan "Chủ vắng, khách vẫn đông." (animated SVG). */}
          <Image
            src="/brand/logo-slogan-light.svg"
            alt={t("companyName")}
            width={313}
            height={174}
            unoptimized
            className="h-24 w-auto self-start"
          />
          <p className="text-sm leading-relaxed text-white/60">{t("tagline")}</p>
          <Link
            href={{ pathname: "/about", hash: "thuong-hieu" }}
            className="self-start text-sm font-semibold text-emerald-300 underline-offset-4 hover:text-white hover:underline"
          >
            {t("brandStory")} →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">
            {t("linksHeading")}
          </h3>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-sm text-white/75 transition-colors hover:text-white"
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">
            {t("servicesHeading")}
          </h3>
          <ul className="flex flex-col gap-2">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: service.slug } }}
                  className="text-sm text-white/75 transition-colors hover:text-gold-400"
                >
                  {service.name[locale]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={{ pathname: "/services", hash: "bang-gia" }}
                className="text-sm font-semibold text-gold-400 transition-colors hover:text-white"
              >
                {t("priceList")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-white/50">
            {t("addressLabel")}
          </h3>
          <a
            href={`tel:${t("phone").replace(/\./g, "")}`}
            className="flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <Phone size={16} aria-hidden />
            {t("phone")}
          </a>
          <a
            href={`mailto:${t("email")}`}
            className="flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <Mail size={16} aria-hidden />
            {t("email")}
          </a>
          <a
            href={COMPANY.fanpage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <FacebookIcon size={16} aria-hidden />
            {t("fanpage")}
          </a>
          <Link
            href={{ pathname: "/contact", hash: "phap-ly" }}
            className="flex items-start gap-2 text-sm text-white/75 transition-colors hover:text-white"
          >
            <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
            {companyAddressLine}
          </Link>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <p className="font-semibold text-white/70">
              {COMPANY.legalNameVi} · {t("taxCode")} {COMPANY.taxCode} · {t("vatLine")}
            </p>
            <p>
              © {new Date().getFullYear()} {t("companyName")}. {t("rights")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ConsentSettingsButton label={t("privacy")} />
            <p>{t("madeWith")}</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}
