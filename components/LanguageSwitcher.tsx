"use client";

import { useParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

const locales = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
] as const;

export function LanguageSwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();

  const trackClass =
    tone === "dark" ? "bg-white/10 ring-1 ring-white/15" : "bg-black/[0.04] ring-1 ring-black/5";

  return (
    <div
      className={`inline-flex items-center rounded-full p-1 text-xs font-semibold ${trackClass}`}
      role="group"
      aria-label="Language"
    >
      {locales.map(({ code, label }) => {
        const active = code === locale;
        return (
          <Link
            key={code}
            href={{ pathname, params } as Parameters<typeof Link>[0]["href"]}
            locale={code}
            aria-current={active ? "true" : undefined}
            className={`min-h-8 rounded-full px-3 py-1.5 transition-colors duration-150 ${
              active
                ? "bg-brand-500 text-white"
                : tone === "dark"
                  ? "text-white/70 hover:text-white"
                  : "text-ink-muted hover:text-ink"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
