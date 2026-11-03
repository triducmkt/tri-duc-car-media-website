import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlForImage } from "@/lib/sanity/image";
import type { BlogPost } from "@/lib/sanity/types";

export function BlogPostCard({
  item,
  locale,
  readMoreLabel,
  categoryLabel,
}: {
  item: BlogPost;
  locale: "vi" | "en";
  readMoreLabel: string;
  /** Display name of item.category (messages → blog.categories). */
  categoryLabel?: string;
}) {
  const cover = item.coverImage ? urlForImage(item.coverImage).width(640).height(420).url() : null;
  const title = item.title[locale] || item.title.vi;
  const date = item.publishedAt
    ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
        new Date(item.publishedAt),
      )
    : null;

  return (
    <Link
      href={{ pathname: "/blog/[slug]", params: { slug: item.slug } }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper-soft ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
        {cover ? (
          <Image
            src={cover}
            alt={item.coverImage?.alt?.[locale] || item.coverImage?.alt?.vi || title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-soft to-ink">
            <Image
              src="/brand/logo-light.svg"
              alt="Trí Đức Car Media"
              width={725}
              height={256}
              unoptimized
              className="h-10 w-auto opacity-40"
            />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        {categoryLabel || date ? (
          <p className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-brand-600">
            {categoryLabel ? <span>{categoryLabel}</span> : null}
            {categoryLabel && date ? <span aria-hidden className="text-ink-muted/50">·</span> : null}
            {date ? (
              <time dateTime={item.publishedAt} className="font-semibold normal-case tracking-normal text-ink-muted">
                {date}
              </time>
            ) : null}
          </p>
        ) : null}
        <h3 className="font-display text-lg font-bold leading-snug text-ink">{title}</h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">{item.excerpt[locale] || item.excerpt.vi}</p>
        <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-bold text-brand-600">
          {readMoreLabel}
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
