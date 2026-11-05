import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, CalendarDays, Check, MessageCircle } from "lucide-react";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { COMBOS, SERVICES, formatVnd, serviceBySlug, shortVnd, type Locale } from "@/lib/servicesCatalog";

/** One page per service (Dịch vụ → each pillar, footer links). Content and
 *  prices: lib/servicesCatalog.ts. Copy for labels: messages → pricing. */

export function generateStaticParams() {
  return SERVICES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  const s = serviceBySlug(slug);
  if (!s) return {};
  return { title: s.name[locale], description: s.pitch[locale] };
}

export default async function ServicePage({ params }: { params: Promise<{ locale: Locale; slug: string }> }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const s = serviceBySlug(slug);
  if (!s) notFound();
  const t = await getTranslations("pricing");
  const index = SERVICES.findIndex((x) => x.slug === slug);
  const inCombos = COMBOS.filter((c) => c.parts.some((p) => p.slug === slug));
  const others = SERVICES.filter((x) => x.slug !== slug);
  const star = s.price.estimated ? <span className="text-gold-400">*</span> : null;

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-28 text-white sm:pb-20 sm:pt-32">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_80%_30%,rgba(10,111,184,0.25),transparent_70%),radial-gradient(35%_40%_at_10%_90%,rgba(23,168,90,0.14),transparent_70%)]"
        />
        <Container className="relative grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="flex flex-col gap-4">
            <Link href="/services" className="inline-flex w-fit items-center gap-1.5 text-sm text-white/60 hover:text-white">
              <ArrowLeft className="h-4 w-4" aria-hidden /> {t("back")}
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400">
              {t("pillar", { n: index + 1 })}
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-5xl">{s.name[locale]}</h1>
            <p className="max-w-2xl text-white/75 sm:text-lg">{s.pitch[locale]}</p>
          </div>

          <div className="flex flex-col gap-3 rounded-3xl bg-white/[0.05] p-6 ring-1 ring-gold-500/40">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/55">{t("priceFrom")}</p>
            <p className="font-display text-3xl font-bold sm:text-4xl">
              {formatVnd(s.price.amount, locale)}
              {star}
              <span className="ml-1 text-base font-medium text-white/60">
                {s.price.unit === "month" ? t("perMonth") : t("once")}
              </span>
            </p>
            {s.price.plus ? (
              <p className="text-sm text-white/70">
                {t("plus", { amount: formatVnd(s.price.plus.amount, locale) })}
                {star}
              </p>
            ) : null}
            {s.price.minMonths ? <p className="text-sm text-white/60">{t("minMonths", { n: s.price.minMonths })}</p> : null}
            <p className="text-xs text-white/50">{t("vatNote")}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <a
                href={COMPANY.zalo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-5 py-3 text-sm font-bold text-ink transition hover:bg-gold-400"
              >
                <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
              </a>
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/60"
              >
                <CalendarDays className="h-4 w-4" aria-hidden /> {t("ctaBook")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-bold text-ink">{t("includes")}</h2>
              <ul className="grid gap-3 sm:grid-cols-2">
                {s.includes[locale].map((x) => (
                  <li key={x} className="flex items-start gap-3 rounded-2xl bg-paper-soft p-4 text-sm text-ink ring-1 ring-black/5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/15 text-gold-600">
                      <Check className="h-4 w-4" aria-hidden />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-bold text-ink">{t("steps")}</h2>
              <ol className="flex flex-col gap-0">
                {s.steps[locale].map((x, i) => (
                  <li key={x} className="relative flex gap-4 pb-6 last:pb-0">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                      {i + 1}
                    </span>
                    <p className="pt-1 text-ink">{x}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2 rounded-2xl bg-paper-soft p-5 ring-1 ring-black/5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("fit")}</h3>
                <p className="text-sm text-ink">{s.fit[locale]}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-2xl bg-paper-soft p-5 ring-1 ring-black/5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("measure")}</h3>
                <p className="text-sm text-ink">{s.measure[locale]}</p>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            {inCombos.length ? (
              <div className="flex flex-col gap-3 rounded-3xl bg-ink p-6 text-white">
                <h2 className="font-display text-lg font-bold">{t("inCombos")}</h2>
                {inCombos.map((c) => (
                  <Link
                    key={c.key}
                    href={{ pathname: "/services", hash: "bang-gia" }}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.05] p-4 ring-1 ring-white/10 hover:ring-gold-500/60"
                  >
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-400">{c.step[locale]}</span>
                      <span className="block font-semibold">{c.name[locale]}</span>
                    </span>
                    <span className="text-right text-sm font-bold">
                      {c.price ? `${shortVnd(c.price, locale)}*` : t("contact")}
                    </span>
                  </Link>
                ))}
                <p className="text-xs text-white/55">{t("comboHint")}</p>
              </div>
            ) : null}

            {s.price.estimated ? (
              <div className="flex flex-col gap-2 rounded-2xl bg-paper-soft p-5 ring-1 ring-black/5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("basis")}</h3>
                <p className="text-sm text-ink">{s.basis[locale]}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{t("others")}</h3>
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={{ pathname: "/services/[slug]", params: { slug: o.slug } }}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-ink ring-1 ring-black/5 hover:ring-brand-500/40"
                >
                  {o.name[locale]}
                  <ArrowRight className="h-4 w-4 shrink-0 text-brand-500" aria-hidden />
                </Link>
              ))}
            </div>
          </aside>
        </Container>
        <Container className="mt-12">
          <p className="border-t border-black/10 pt-6 text-xs leading-relaxed text-ink-muted">
            <span className="font-semibold text-gold-600">(*)</span> {t("footnote")}
          </p>
        </Container>
      </section>
    </>
  );
}
