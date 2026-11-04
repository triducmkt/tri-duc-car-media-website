import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, BookOpen, ChevronDown, Headphones, Image as ImageIcon, LayoutDashboard, ListChecks, Presentation, Ticket } from "lucide-react";
import { GIFT_IDS, GIFT_MAP, type GiftFormat } from "@/lib/gifts";

const FORMAT_ICON: Record<GiftFormat, typeof BookOpen> = {
  ebook: BookOpen,
  podcast: Headphones,
  infographic: LayoutDashboard,
  poster: ImageIcon,
  slides: Presentation,
  checklist: ListChecks,
  card: Ticket,
};
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { VatAdvantage } from "@/components/VatAdvantage";
import { ShopCheck } from "@/components/check/ShopCheck";
import { Link, getPathname } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";
import { AXIS_KEYS, INDUSTRY_VARIANTS, articlesByAxis } from "@/lib/shopCheck";
import { getBlogPosts } from "@/lib/sanity/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl;

export async function generateMetadata({ params }: { params: Promise<{ locale: "vi" | "en" }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "check" });
  const url = (l: "vi" | "en") => `${siteUrl}${getPathname({ locale: l, href: "/check" })}`;
  return {
    title: { absolute: t("metaTitle") },
    description: t("metaDescription"),
    alternates: { canonical: url(locale), languages: { vi: url("vi"), en: url("en"), "x-default": url("vi") } },
    openGraph: { type: "website", title: t("metaTitle"), description: t("metaDescription"), url: url(locale) },
  };
}

export default async function CheckPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
  searchParams: Promise<{ nganh?: string }>;
}) {
  const { locale } = await params;
  const { nganh } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("check");
  const tg = await getTranslations("gifts");
  const variant = (INDUSTRY_VARIANTS as readonly string[]).includes(nganh ?? "") ? nganh : undefined;
  const stats = t.raw("stats") as { v: string; l: string; c: string }[];
  const how = t.raw("how") as { t: string; d: string }[];
  const faq = t.raw("faq") as { q: string; a: string }[];
  const byAxis = articlesByAxis(await getBlogPosts());

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  return (
    <>
      <ShopCheck variant={variant} />

      {/* Gift library: every gift leads into the check (?qua=…) or straight to booking. */}
      <section id="thu-vien-qua" className="bg-paper-soft py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading eyebrow={tg("eyebrow")} heading={tg("libraryTitle")} sub={tg("librarySub")} align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {GIFT_IDS.map((id) => {
              const g = GIFT_MAP[id];
              const Icon = FORMAT_ICON[g.format];
              const ready = g.status === "ready";
              return (
                <div key={id} className="flex flex-col gap-3 rounded-2xl bg-paper p-5 ring-1 ring-black/5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 text-gold-600">
                      <Icon size={20} aria-hidden />
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ready ? "bg-emerald-500/10 text-emerald-700" : "bg-black/5 text-ink-muted"}`}>
                      {tg(`formats.${g.format}`)} · {tg(g.status)}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold leading-snug text-ink">{tg(`items.${id}.title`)}</h3>
                  <p className="text-sm leading-relaxed text-ink-muted">{tg(`items.${id}.desc`)}</p>
                  {"href" in g ? (
                    <Link href="/booking" className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700">
                      {tg("book")} <ArrowRight size={15} aria-hidden />
                    </Link>
                  ) : (
                    <a href={`?qua=${id}#kiem-tra`} className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700">
                      {tg("pick")} <ArrowRight size={15} aria-hidden />
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-paper py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading heading={t("proofTitle")} align="center" />
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((s) => (
              <Link
                key={s.c}
                href={{ pathname: "/case-studies/[slug]", params: { slug: s.c } }}
                className="group flex flex-col gap-2 rounded-2xl bg-paper-soft p-6 ring-1 ring-black/5 transition-colors hover:ring-gold-500/40"
              >
                <span className="font-display text-3xl font-bold text-ink">{s.v}</span>
                <span className="text-sm leading-snug text-ink-muted">{s.l}</span>
                <ArrowRight size={16} aria-hidden className="mt-auto text-gold-600 transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-paper-soft py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading heading={t("howTitle")} align="center" />
          <ol className="grid gap-4 sm:grid-cols-3">
            {how.map((h, i) => (
              <li key={h.t} className="flex flex-col gap-2 rounded-2xl bg-paper p-6 ring-1 ring-black/5">
                <span className="font-serif text-3xl font-bold text-gold-500/80">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-lg font-bold text-ink">{h.t}</span>
                <span className="text-sm text-ink-muted">{h.d}</span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Organic SEO: what each axis means + the articles about it (two-way links with RadarPrompt). */}
      <section className="bg-paper py-16 sm:py-20">
        <Container className="flex flex-col gap-8">
          <SectionHeading heading={t("axesTitle")} sub={t("axesSub")} align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {AXIS_KEYS.map((axis) => (
              <div key={axis} className="flex flex-col gap-3 rounded-2xl bg-paper-soft p-5 ring-1 ring-black/5">
                <h3 className="font-display text-lg font-bold text-ink">{t(`axes.${axis}.label`)}</h3>
                <p className="text-sm leading-relaxed text-ink-muted">{t(`signs.${axis}`)}</p>
                <ul className="mt-auto flex flex-col gap-2">
                  {byAxis[axis].slice(0, 2).map((p) => (
                    <li key={p.slug}>
                      <Link
                        href={{ pathname: "/blog/[slug]", params: { slug: p.slug } }}
                        className="group inline-flex items-start gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
                      >
                        <ArrowRight size={14} aria-hidden className="mt-1 shrink-0 transition-transform group-hover:translate-x-0.5" />
                        <span>{p.title[locale] || p.title.vi}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <VatAdvantage id="hoa-don-vat" />

      <section className="bg-paper py-16 sm:py-20">
        <Container className="mx-auto flex max-w-3xl flex-col gap-6">
          <SectionHeading heading={t("faqTitle")} align="center" />
          <div className="flex flex-col gap-3">
            {faq.map((f) => (
              <details key={f.q} className="group rounded-xl bg-paper-soft p-5 ring-1 ring-black/5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-ink">
                  {f.q}
                  <ChevronDown size={18} aria-hidden className="shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </Container>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      </section>

      <section className="bg-ink py-16 text-white sm:py-20">
        <Container className="flex flex-col items-center gap-6 text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("finalTitle")}</h2>
          <a href="#kiem-tra" className="inline-flex items-center gap-2 rounded-full bg-gold-400 px-6 py-3.5 text-base font-bold text-ink hover:bg-gold-500">
            {t("finalCta")} <ArrowRight size={18} aria-hidden />
          </a>
        </Container>
      </section>
    </>
  );
}
