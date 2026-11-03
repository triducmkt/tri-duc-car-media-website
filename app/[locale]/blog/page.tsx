import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/SectionHeading";
import { BlogPostCard } from "@/components/BlogPostCard";
import { getBlogPosts } from "@/lib/sanity/queries";
import { getPathname } from "@/i18n/navigation";
import { COMPANY } from "@/lib/company";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || COMPANY.siteUrl;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const url = (l: "vi" | "en") => `${siteUrl}${getPathname({ locale: l, href: "/blog" })}`;
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: url(locale), languages: { vi: url("vi"), en: url("en"), "x-default": url("vi") } },
    openGraph: { type: "website", title: t("metaTitle"), description: t("metaDescription"), url: url(locale) },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: "vi" | "en" }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const items = await getBlogPosts();
  const categories = t.raw("categories") as Record<string, string>;

  return (
    <>
      <section className="bg-ink py-20 text-white sm:py-24">
        <Container>
          <SectionHeading as="h1" eyebrow={t("eyebrow")} heading={t("heading")} sub={t("intro")} tone="dark" />
        </Container>
      </section>

      <section className="bg-paper py-20 sm:py-24">
        <Container>
          {items.length === 0 ? (
            <p className="text-base text-ink-muted">{t("empty")}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <BlogPostCard key={item._id} item={item} locale={locale} readMoreLabel={t("readMore")} categoryLabel={item.category ? categories[item.category] : undefined} />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
