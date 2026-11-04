import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CalendarDays, Clock, FileCheck2 } from "lucide-react";
import { Container } from "@/components/Container";
import { Link, getPathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BlogPostCard } from "@/components/BlogPostCard";
import { FacebookIcon } from "@/components/icons/FacebookIcon";
import { getBlogPosts, getBlogPostBySlug } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";
import type { SanityImage } from "@/lib/sanity/types";
import { COMPANY } from "@/lib/company";
import { readingMinutes } from "@/lib/blog";
import { axisForArticle } from "@/lib/shopCheck";
import { RadarPrompt } from "@/components/check/RadarPrompt";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl;

function postUrl(locale: "vi" | "en", slug: string) {
  return `${siteUrl}${getPathname({ locale, href: { pathname: "/blog/[slug]", params: { slug } } })}`;
}

function bodyComponents(locale: "vi" | "en"): PortableTextComponents {
  return {
    types: {
      image: ({ value }: { value: SanityImage & { caption?: string } }) => (
        <figure className="not-prose my-6 flex flex-col gap-2">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-paper-soft ring-1 ring-black/5">
            <Image
              src={urlForImage(value).width(1400).url()}
              alt={value.alt?.[locale] || value.alt?.vi || value.caption || ""}
              fill
              className="object-contain"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          </div>
          {value.caption ? <figcaption className="text-center text-sm text-ink-muted">{value.caption}</figcaption> : null}
        </figure>
      ),
    },
  };
}

export async function generateStaticParams() {
  const items = await getBlogPosts();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en"; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const item = await getBlogPostBySlug(slug);
  if (!item) return {};
  const title = item.seoTitle?.[locale] || item.seoTitle?.vi || item.title[locale] || item.title.vi;
  const description =
    item.seoDescription?.[locale] || item.seoDescription?.vi || item.excerpt[locale] || item.excerpt.vi;
  const image = item.coverImage ? urlForImage(item.coverImage).width(1200).height(630).url() : undefined;
  const languages = Object.fromEntries(routing.locales.map((l) => [l, postUrl(l, slug)]));
  return {
    // Absolute: the SEO title already carries the brand where it fits.
    title: { absolute: title },
    description,
    keywords: [item.focusKeyword, ...(item.tags ?? [])].filter(Boolean) as string[],
    alternates: { canonical: postUrl(locale, slug), languages: { ...languages, "x-default": languages.vi } },
    openGraph: {
      type: "article",
      url: postUrl(locale, slug),
      title,
      description,
      siteName: COMPANY.brandName,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      publishedTime: item.publishedAt,
      modifiedTime: item._updatedAt,
      authors: [item.author || COMPANY.representative],
      tags: item.tags,
      images: image ? [{ url: image, width: 1200, height: 630, alt: item.coverImage?.alt?.[locale] || title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description, images: image ? [image] : undefined },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en"; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const [item, all] = await Promise.all([getBlogPostBySlug(slug), getBlogPosts()]);

  if (!item) notFound();

  const title = item.title[locale] || item.title.vi;
  const body = item.body?.[locale] ?? item.body?.vi;
  const cover = item.coverImage ? urlForImage(item.coverImage).width(1400).height(788).url() : null;
  const coverAlt = item.coverImage?.alt?.[locale] || item.coverImage?.alt?.vi || title;
  const minutes = readingMinutes(body);
  const author = item.author || COMPANY.representative;
  const date = item.publishedAt ? new Date(item.publishedAt) : null;
  const dateLabel = date
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date)
    : null;
  const categories = t.raw("categories") as Record<string, string>;
  // Related: same category first, then newest — never the post itself.
  const related = all
    .filter((p) => p.slug !== slug)
    .sort((a, b) => Number(b.category === item.category) - Number(a.category === item.category))
    .slice(0, 3);

  const url = postUrl(locale, slug);
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: title,
      description: item.seoDescription?.[locale] || item.excerpt[locale] || item.excerpt.vi,
      image: cover ? [urlForImage(item.coverImage!).width(1200).height(630).url()] : undefined,
      datePublished: item.publishedAt,
      dateModified: item._updatedAt || item.publishedAt,
      inLanguage: locale === "vi" ? "vi-VN" : "en",
      mainEntityOfPage: url,
      url,
      keywords: [item.focusKeyword, ...(item.tags ?? [])].filter(Boolean).join(", "),
      articleSection: item.category ? categories[item.category] : undefined,
      author: { "@type": "Person", name: author, url: `${siteUrl}${getPathname({ locale, href: "/about" })}` },
      publisher: { "@id": `${COMPANY.siteUrl}/#organization` },
      isBasedOn: item.sourceUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: t("crumbHome"), item: `${siteUrl}${getPathname({ locale, href: "/" })}` },
        { "@type": "ListItem", position: 2, name: t("title"), item: `${siteUrl}${getPathname({ locale, href: "/blog" })}` },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ];

  return (
    <article className="bg-paper pb-16 pt-28 sm:pb-24 sm:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container className="mx-auto flex max-w-3xl flex-col gap-7">
        <nav aria-label="Breadcrumb" className="text-sm text-ink-muted">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li><Link href="/" className="hover:text-brand-600">{t("crumbHome")}</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/blog" className="hover:text-brand-600">{t("title")}</Link></li>
            {item.category ? (
              <>
                <li aria-hidden>/</li>
                <li className="font-semibold text-brand-600">{categories[item.category]}</li>
              </>
            ) : null}
          </ol>
        </nav>

        <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-[42px]">{title}</h1>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          <span className="font-semibold text-ink">{author}</span>
          {dateLabel ? (
            <time dateTime={item.publishedAt} className="inline-flex items-center gap-1.5">
              <CalendarDays size={15} aria-hidden /> {dateLabel}
            </time>
          ) : null}
          <span className="inline-flex items-center gap-1.5">
            <Clock size={15} aria-hidden /> {t("readTime", { n: minutes })}
          </span>
        </div>

        <p className="text-lg leading-relaxed text-ink-muted">{item.excerpt[locale] || item.excerpt.vi}</p>

        {cover ? (
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-paper-soft">
            <Image src={cover} alt={coverAlt} fill priority className="object-cover" sizes="(min-width: 768px) 768px, 100vw" />
          </div>
        ) : null}

        {body ? (
          <div className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:font-bold prose-h2:mt-10 prose-a:text-brand-600 prose-strong:text-ink prose-li:my-1">
            <PortableText value={body} components={bodyComponents(locale)} />
          </div>
        ) : null}

        {item.tags?.length ? (
          <ul className="flex flex-wrap gap-2" aria-label={t("tagsLabel")}>
            {item.tags.map((tag) => (
              <li key={tag} className="rounded-full bg-paper-soft px-3 py-1 text-xs font-semibold text-ink-muted ring-1 ring-black/5">
                #{tag}
              </li>
            ))}
          </ul>
        ) : null}

        {/* Organic reader → landing page: this article's axis, pre-filled. */}
        <RadarPrompt axis={axisForArticle(item.slug, item.category)} slug={item.slug} />
        <p className="-mt-6 inline-flex items-center gap-2 text-xs text-ink-muted">
          <FileCheck2 size={14} aria-hidden /> {COMPANY.legalNameVi} · MST {COMPANY.taxCode} · {t("ctaVat")}
        </p>

        {item.sourceUrl ? (
          <a
            href={item.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            <FacebookIcon size={16} aria-hidden /> {t("sourceLink")}
          </a>
        ) : null}
      </Container>

      {related.length ? (
        <Container className="mt-16 flex flex-col gap-6">
          <h2 className="font-display text-2xl font-bold text-ink">{t("related")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => (
              <BlogPostCard key={p._id} item={p} locale={locale} readMoreLabel={t("readMore")} categoryLabel={p.category ? categories[p.category] : undefined} />
            ))}
          </div>
        </Container>
      ) : null}
    </article>
  );
}
