import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { urlForImage } from "@/lib/sanity/image";
import { HubIcon } from "@/components/icons";
import type { CaseStudy } from "@/lib/sanity/types";

export function CaseStudyCard({
  item,
  locale,
  readMoreLabel,
  ongoingLabel,
}: {
  item: CaseStudy;
  locale: "vi" | "en";
  readMoreLabel: string;
  ongoingLabel?: string;
}) {
  const cover = item.coverImage ? urlForImage(item.coverImage).width(640).height(420).url() : null;
  const logo = item.clientLogo ? urlForImage(item.clientLogo).width(160).height(160).fit("max").url() : null;

  return (
    <Link
      href={{ pathname: "/case-studies/[slug]", params: { slug: item.slug } }}
      className="group flex h-full flex-col overflow-hidden rounded-2xl bg-paper-soft ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5 hover:ring-gold-500/30"
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
            <HubIcon size={40} className="text-gold-500/30" aria-hidden />
          </div>
        )}
        {logo ? (
          <span className="absolute bottom-3 left-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 p-2 shadow-md">
            <Image src={logo} alt="" width={40} height={40} className="h-full w-full object-contain" />
          </span>
        ) : null}
        {item.isOngoing && ongoingLabel ? (
          <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-ink shadow-md">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {ongoingLabel}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-6">
        {item.industry ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
            {item.industry[locale] || item.industry.vi}
          </span>
        ) : null}
        <h3 className="font-display text-lg font-semibold text-ink">
          {item.title[locale] || item.title.vi}
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-ink-muted">
          {item.summary[locale] || item.summary.vi}
        </p>
        <span className="mt-auto flex items-center gap-1 pt-2 text-sm font-semibold text-gold-600">
          {readMoreLabel}
          <ArrowUpRight size={16} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
