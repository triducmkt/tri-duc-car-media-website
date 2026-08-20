import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlForImage } from "@/lib/sanity/image";
import type { CaseStudy } from "@/lib/sanity/types";

export function CaseStudyCard({
  item,
  locale,
  readMoreLabel,
}: {
  item: CaseStudy;
  locale: "vi" | "en";
  readMoreLabel: string;
}) {
  const cover = item.coverImage ? urlForImage(item.coverImage).width(640).height(420).url() : null;

  return (
    <Link
      href={{ pathname: "/case-studies/[slug]", params: { slug: item.slug } }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-paper-soft ring-1 ring-black/5 transition-shadow duration-200 hover:shadow-lg hover:shadow-black/5"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink">
        {cover ? (
          <Image
            src={cover}
            alt={item.title[locale] || item.title.vi}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink-soft to-ink">
            <span className="font-display text-sm font-semibold uppercase tracking-widest text-white/40">
              Trí Đức Car Media
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        {item.industry ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {item.industry[locale] || item.industry.vi}
          </span>
        ) : null}
        <h3 className="font-display text-lg font-semibold text-ink">
          {item.title[locale] || item.title.vi}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {item.summary[locale] || item.summary.vi}
        </p>
        <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-brand-600">
          {readMoreLabel}
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
