"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

const navItems = [
  { href: "/" as const, key: "home" as const },
  { href: "/about" as const, key: "about" as const },
  { href: "/services" as const, key: "services" as const },
  { href: "/case-studies" as const, key: "caseStudies" as const },
  { href: "/blog" as const, key: "blog" as const },
  { href: "/contact" as const, key: "contact" as const },
];

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // The home hero (SystemHero) is a full-bleed dark canvas — the header
  // floats transparent over its opening frame and solidifies once scrolled
  // past it, instead of cutting a white bar across the cinematic intro.
  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        transparent
          ? "border-b border-transparent bg-transparent"
          : "border-b border-black/5 bg-white/85 backdrop-blur-md"
      }`}
    >
      <Container className="flex h-18 items-center justify-between py-3">
        <Link href="/" onClick={() => setOpen(false)}>
          <span
            className={`inline-flex items-center rounded-lg transition-colors duration-300 ${
              transparent ? "bg-white/90 px-2.5 py-1.5 shadow-sm" : ""
            }`}
          >
            <Image
              src="/brand/logo-mark.png"
              alt="Trí Đức Car Media"
              width={208}
              height={80}
              priority
              className="h-8 w-auto sm:h-9"
            />
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150 ${
                  active
                    ? transparent
                      ? "text-gold-400"
                      : "text-brand-600"
                    : transparent
                      ? "text-white/80 hover:text-white"
                      : "text-ink-muted hover:text-ink"
                }`}
              >
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher tone={transparent ? "dark" : "light"} />
          <Button
            href="/booking"
            variant="primary"
            className={transparent ? "!bg-gold-500 !text-ink hover:!bg-gold-400" : ""}
          >
            {t("bookingCta")}
          </Button>
        </div>

        <button
          type="button"
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors duration-300 lg:hidden ${
            transparent ? "text-white" : "text-ink"
          }`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} aria-hidden /> : <Menu size={22} aria-hidden />}
        </button>
      </Container>

      {open ? (
        <div className="border-t border-black/5 bg-white lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-black/[0.03]"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-3 px-3">
              <LanguageSwitcher />
              <Button href="/booking" variant="primary" onClick={() => setOpen(false)}>
                {t("bookingCta")}
              </Button>
            </div>
          </Container>
        </div>
      ) : null}
    </header>
  );
}
