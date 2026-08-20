import { useTranslations } from "next-intl";
import { Mail, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/Container";

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
  const tServices = useTranslations("services");
  const services = tServices.raw("items") as { title: string }[];

  return (
    <footer className="bg-ink text-white">
      <Container className="grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        <div className="flex flex-col gap-4 lg:col-span-1">
          <span className="font-display text-lg font-bold tracking-tight text-white">
            {t("companyName")}
          </span>
          <p className="text-sm leading-relaxed text-white/60">{t("tagline")}</p>
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
            {services.map((service) => (
              <li key={service.title} className="text-sm text-white/75">
                {service.title}
              </li>
            ))}
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
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {t("companyName")}. {t("rights")}
          </p>
          <p>{t("madeWith")}</p>
        </Container>
      </div>
    </footer>
  );
}
