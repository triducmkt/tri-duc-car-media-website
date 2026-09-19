import { notFound } from "next/navigation";
import Image from "next/image";
import { PortableText } from "@portabletext/react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/Reveal";
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/sanity/queries";
import { urlForImage } from "@/lib/sanity/image";

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
          <div className="flex items-center gap-4">
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
          </div>

          <h1 className="font-serif text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {item.title[locale] || item.title.vi}
          </h1>

          <p className="text-lg leading-relaxed text-ink-muted">
            {item.summary[locale] || item.summary.vi}
          </p>

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

          {body ? (
            <div className="prose prose-neutral max-w-none prose-headings:font-serif prose-a:text-gold-600 prose-strong:text-ink">
              <PortableText value={body} />
            </div>
          ) : null}
        </Reveal>
      </Container>
    </article>
  );
}
