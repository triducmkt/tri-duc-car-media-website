import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getPathname } from "@/i18n/navigation";
import { getBlogPosts, getCaseStudies } from "@/lib/sanity/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://triduccar.media";

const staticPaths = [
  "/",
  "/about",
  "/services",
  "/case-studies",
  "/blog",
  "/booking",
  "/contact",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [caseStudies, blogPosts] = await Promise.all([getCaseStudies(), getBlogPosts()]);

  const entries: MetadataRoute.Sitemap = [];

  for (const href of staticPaths) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${getPathname({ locale, href })}`,
        lastModified: new Date(),
      });
    }
  }

  for (const item of caseStudies) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${getPathname({ locale, href: { pathname: "/case-studies/[slug]", params: { slug: item.slug } } })}`,
        lastModified: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      });
    }
  }

  for (const item of blogPosts) {
    for (const locale of routing.locales) {
      entries.push({
        url: `${siteUrl}${getPathname({ locale, href: { pathname: "/blog/[slug]", params: { slug: item.slug } } })}`,
        lastModified: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      });
    }
  }

  return entries;
}
