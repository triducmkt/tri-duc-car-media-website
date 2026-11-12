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

/** tone="light" = trial light version (docs/DESIGN-BRIEF.md, 12/11/2026),
 *  shown only on the /preview/hero-light page; the live site uses "dark". */
const TONE = {
  dark: {
    root: "relative overflow-hidden bg-ink text-white",
    logo: "/brand/logo-slogan-light.svg",
    muted: "text-white/60",
    label: "text-white/50",
    link: "text-white/75 hover:text-white",
    accentLink: "text-leaf-400 hover:text-white",
    price: "text-brand-400 hover:text-white",
    bottom: "text-white/45",
    legal: "text-white/80",
  },
  light: {
    root: "relative overflow-hidden footer-mesh text-ink",
    logo: "/brand/logo-slogan.svg",
    muted: "text-ink-muted",
    label: "text-ink-muted",
    link: "text-ink/80 hover:text-brand-700",
    accentLink: "text-leaf-600 hover:text-brand-700",
    price: "text-brand-700 hover:text-ink",
    bottom: "text-ink-muted",
    legal: "text-ink",
  },
} as const;

export function Footer({ tone = "dark" }: { tone?: "dark" | "light" } = {}) {
  const c = TONE[tone];
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");
  const locale = useLocale() as Locale;

  return (
    <footer className={c.root}>
      {/* F9: brand-gradient strip on top + a soft blue glow behind the columns */}
      <div aria-hidden className="footer-strip" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-60"
        style={{ backgroundImage: "radial-gradient(60% 100% at 50% 0%, rgba(66, 133, 244, 0.16), transparent 70%)" }}
      />
      <Container className="relative grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
          {/* Logo v12 bản A with the slogan "Chủ vắng, khách vẫn đông." (animated SVG). */}
          <Image
            src={c.logo}
            alt={t("companyName")}
            width={357}
            height={157}
            unoptimized
            className="h-24 w-auto self-start"
          />
          <p className={`text-sm leading-relaxed ${c.muted}`}>{t("tagline")}</p>
          <Link
            href={{ pathname: "/about", hash: "thuong-hieu" }}
            className={`self-start text-sm font-semibold underline-offset-4 hover:underline ${c.accentLink}`}
          >
            {t("brandStory")} →
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className={`text-sm font-semibold uppercase tracking-[0.12em] ${c.label}`}>
            {t("linksHeading")}
          </h3>
          <ul className="flex flex-col gap-2">
            {navItems.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={`text-sm transition-colors ${c.link}`}
                >
                  {tNav(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className={`text-sm font-semibold uppercase tracking-[0.12em] ${c.label}`}>
            {t("servicesHeading")}
          </h3>
          <ul className="flex flex-col gap-2">
            {SERVICES.map((service) => (
              <li key={service.slug}>
                <Link
                  href={{ pathname: "/services/[slug]", params: { slug: service.slug } }}
                  className={`text-sm transition-colors ${c.link}`}
                >
                  {service.name[locale]}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={{ pathname: "/services", hash: "bang-gia" }}
                className={`text-sm font-semibold transition-colors ${c.price}`}
              >
                {t("priceList")}
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className={`text-sm font-semibold uppercase tracking-[0.12em] ${c.label}`}>
            {t("addressLabel")}
          </h3>
          <a
            href={`tel:${t("phone").replace(/\./g, "")}`}
            className={`flex items-center gap-2 text-sm transition-colors ${c.link}`}
          >
            <Phone size={16} aria-hidden />
            {t("phone")}
          </a>
          <a
            href={`mailto:${t("email")}`}
            className={`flex items-center gap-2 text-sm transition-colors ${c.link}`}
          >
            <Mail size={16} aria-hidden />
            {t("email")}
          </a>
          <a
            href={COMPANY.fanpage}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-2 text-sm transition-colors ${c.link}`}
          >
            <FacebookIcon size={16} aria-hidden />
            {t("fanpage")}
          </a>
          <Link
            href={{ pathname: "/contact", hash: "phap-ly" }}
            className={`flex items-start gap-2 text-sm transition-colors ${c.link}`}
          >
            <MapPin size={16} className="mt-0.5 shrink-0" aria-hidden />
            {companyAddressLine}
          </Link>
        </div>
      </Container>

      <div className="relative">
        {/* F9: glowing gradient hairline instead of a flat border */}
        <div aria-hidden className="hairline-gradient opacity-50" />
        <Container className={`flex flex-col gap-2 py-6 text-xs sm:flex-row sm:items-center sm:justify-between ${c.bottom}`}>
          <div className="flex flex-col gap-1">
            <p className={`font-semibold ${c.legal}`}>
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
