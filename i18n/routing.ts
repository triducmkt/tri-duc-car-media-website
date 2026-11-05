import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["vi", "en"],
  defaultLocale: "vi",
  localePrefix: "always",
  // Vietnamese SME/household-business clients are the primary audience, so
  // first-time visitors always land on /vi regardless of browser language —
  // the header's language switcher remains a one-click way to reach English.
  localeDetection: false,
  pathnames: {
    "/": "/",
    "/about": {
      vi: "/ve-founder",
      en: "/about",
    },
    "/services": {
      vi: "/dich-vu",
      en: "/services",
    },
    // One page per service (lib/servicesCatalog.ts).
    "/services/[slug]": {
      vi: "/dich-vu/[slug]",
      en: "/services/[slug]",
    },
    "/case-studies": {
      vi: "/du-an",
      en: "/case-studies",
    },
    "/case-studies/[slug]": {
      vi: "/du-an/[slug]",
      en: "/case-studies/[slug]",
    },
    "/blog": {
      vi: "/kien-thuc",
      en: "/blog",
    },
    "/blog/[slug]": {
      vi: "/kien-thuc/[slug]",
      en: "/blog/[slug]",
    },
    "/booking": {
      vi: "/dat-lich-tu-van",
      en: "/booking",
    },
    "/contact": {
      vi: "/lien-he",
      en: "/contact",
    },
    // Ads landing page (components/check/ShopCheck.tsx).
    "/check": {
      vi: "/kiem-tra-co-so",
      en: "/shop-check",
    },
  },
});

export type AppPathnames = keyof typeof routing.pathnames;
