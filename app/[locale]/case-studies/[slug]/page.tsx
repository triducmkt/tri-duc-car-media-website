import { notFound } from "next/navigation";
import Image from "next/image";
import { TrendingUp, ExternalLink } from "lucide-react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/Reveal";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";

function bodyComponents(locale: "vi" | "en"): PortableTextComponents {
  return {
    types: {
      image: ({ value }: { value: SanityImage & { caption?: string } }) => {
        const src = urlForImage(value).width(1400).url();
        return (
          <figure className="not-prose my-2 flex flex-col gap-2">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
              <Image
                src={src}
                alt={value.alt?.[locale] || value.alt?.vi || value.caption || ""}
                fill
                className="object-contain bg-paper-soft"
                sizes="(min-width: 768px) 768px, 100vw"
              />
            </div>
            {value.caption ? (
              <figcaption className="text-center text-sm text-ink-muted">{value.caption}</figcaption>
            ) : null}
          </figure>
        );
      },
    },
  };
}

export async function generateStaticParams() {
  const items = await getCaseStudies();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  const item = await getCaseStudyBySlug(slug);
  if (!item) return {};
  return { title: item.title[locale] || item.title.vi };
}

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("caseStudies");
  const item = await getCaseStudyBySlug(slug);

  if (!item) notFound();

  const cover = item.coverImage ? urlForImage(item.coverImage).width(1400).height(800).url() : null;
  const logo = item.clientLogo ? urlForImage(item.clientLogo).width(200).height(200).fit("max").url() : null;
  const body = item.body?.[locale] ?? item.body?.vi;

  return (
    <article className="bg-paper py-16 sm:py-24">
      <Container className="mx-auto flex max-w-3xl flex-col gap-8">
        <Link href="/case-studies" className="text-sm font-semibold text-gold-600">
          ← {t("backToList")}
        </Link>

        <Reveal className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-4">
            {logo ? (
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-black/5">
                <Image src={logo} alt="" width={48} height={48} className="h-full w-full object-contain" />
              </span>
            ) : null}
            {item.industry ? (
              <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                {item.industry[locale] || item.industry.vi}
              </span>
            ) : null}
            {item.isOngoing ? (
              <span className="flex items-center gap-1.5 rounded-full bg-paper-soft px-3 py-1 text-xs font-semibold text-ink ring-1 ring-black/5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
                {t("ongoingBadge")}
              </span>
            ) : null}
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {item.title[locale] || item.title.vi}
          </h1>

          <p className="text-lg leading-relaxed text-ink-muted">
            {item.summary[locale] || item.summary.vi}
          </p>

          {item.dataAsOf ? (
            <p className="-mt-4 text-sm font-medium text-ink-muted">
              {t("updatedThrough")} {item.dataAsOf}
            </p>
          ) : null}

          {item.links && item.links.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {item.links.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-full border border-black/10 px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-gold-500/40 hover:text-gold-600"
                >
                  {link.label[locale] || link.label.vi}
                  <ExternalLink size={13} aria-hidden />
                </a>
              ))}
            </div>
          ) : null}

          {cover ? (
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl ring-1 ring-black/5">
              <Image
                src={cover}
                alt={item.title[locale] || item.title.vi}
                fill
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
              />
            </div>
          ) : null}

          {item.stats && item.stats.length > 0 ? (
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-muted">
                {t("resultsHeading")}
              </h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {item.stats.map((stat, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-1.5 rounded-2xl bg-paper-soft p-4 ring-1 ring-black/5"
                  >
                    <span className="font-display text-2xl font-bold text-ink sm:text-3xl">{stat.value}</span>
                    <span className="text-xs leading-snug text-ink-muted">
                      {stat.label[locale] || stat.label.vi}
                    </span>
                    {stat.note ? (
                      <span className="mt-1 flex items-center gap-1 text-xs font-semibold text-gold-600">
                        <TrendingUp size={13} aria-hidden />
                        {stat.note[locale] || stat.note.vi}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {body ? (
            <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-a:text-gold-600 prose-strong:text-ink">
              <PortableText value={body} components={bodyComponents(locale)} />
            </div>
          ) : null}
        </Reveal>
      </Container>
    </article>
  );
}
