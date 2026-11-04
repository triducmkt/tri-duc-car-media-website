"use client";

import { useTranslations } from "next-intl";
import { Download, Headphones, Image as ImageIcon } from "lucide-react";
import { giftAssets, type GiftId } from "@/lib/gifts";
import { trackEvent } from "@/lib/tracking/grid";

/** The unlocked gift, shown on the check result once the visitor has left
 *  their name + Zalo (form or "send via Zalo"): vertical video, audio
 *  players, and buttons for the PDF / infographic. Files: lib/gifts.ts. */
export function GiftContent({ gift }: { gift: GiftId }) {
  const t = useTranslations("gifts");
  const assets = giftAssets(gift);
  if (!assets.length) return null;

  const video = assets.find((a) => a.kind === "video");
  const audios = assets.filter((a) => a.kind === "audio");
  const files = assets.filter((a) => a.kind === "pdf" || a.kind === "image");
  const open = (label: string) => trackEvent("gift_open", { gift, asset: label });

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-white/[0.06] p-4 ring-1 ring-gold-400/40">
      <div>
        <p className="font-display text-lg font-bold">{t("unlockedTitle")}</p>
        <p className="mt-1 text-sm text-white/65">{t("unlockedBody")}</p>
      </div>
      <div className={`grid gap-4 ${video && !video.landscape ? "sm:grid-cols-[160px_1fr]" : ""}`}>
        {video && (
          <figure className="flex flex-col gap-1.5">
            <video
              src={video.url}
              poster={video.poster}
              controls
              playsInline
              preload="none"
              onPlay={() => open(video.label)}
              className={`mx-auto w-full rounded-lg bg-black ring-1 ring-white/10 ${video.landscape ? "aspect-video" : "aspect-[9/16] max-w-[200px]"}`}
            />
            <figcaption className="text-center text-xs text-white/60">{t(`assets.${video.label}`)}</figcaption>
          </figure>
        )}
        <div className="flex flex-col gap-3">
          {audios.map((a) => (
            <div key={a.url} className="flex flex-col gap-1.5">
              <p className="flex items-center gap-1.5 text-sm font-semibold">
                <Headphones size={15} className="text-gold-400" aria-hidden /> {t(`assets.${a.label}`)}
              </p>
              <audio src={a.url} controls preload="none" onPlay={() => open(a.label)} className="w-full" />
            </div>
          ))}
          <div className="flex flex-wrap gap-2 pt-1">
            {files.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => open(a.label)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold ${
                  a.kind === "pdf" ? "bg-gold-400 text-ink hover:bg-gold-500" : "text-white ring-1 ring-white/25 hover:bg-white/10"
                }`}
              >
                {a.kind === "pdf" ? <Download size={16} aria-hidden /> : <ImageIcon size={16} aria-hidden />} {t(`assets.${a.label}`)}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
