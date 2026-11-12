import { useTranslations } from "next-intl";
import { MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Lockup } from "@/components/Lockup";

/**
 * TRIAL light hero (docs/DESIGN-BRIEF.md, brief 12/11/2026): pastel mesh
 * background, centred dark lockup, gradient CTA, real footage stills as
 * floating white "app cards". Shown only on /preview/hero-light — the live
 * homepage still uses FootageHero (dark). Same copy and lockup rules (V1b).
 */
const ZALO_URL = "https://zalo.me/0769918685";
// Real stills of the 12/09/2025 working session (scripts/build-hero-frames.mjs).
const STILLS = ["/hero/d/001.webp", "/hero/d/040.webp", "/hero/d/085.webp"];

export function LightHero() {
  const tHero = useTranslations("systemHero");
  const t = useTranslations("reel");

  return (
    <section aria-label={tHero("ariaLabel")} className="hero-mesh relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center gap-7 px-6 text-center lg:px-8">
        <span className="eyebrow-pill" data-tone="light">
          {tHero("open.eyebrow")}
        </span>
        <div className="w-full max-w-3xl">
          <Lockup
            as="h1"
            size="hero"
            tone="light"
            align="center"
            reveal="load"
            accent={tHero("open.accent")}
            anchor={tHero("open.lockupAnchor")}
          />
        </div>
        <p className="max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">{tHero("open.sub")}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gradient inline-flex items-center gap-2 rounded-full bg-brand-500 px-6 py-3.5 text-sm font-bold text-white"
          >
            <MessageCircle className="h-4 w-4" aria-hidden /> {t("ctaZalo")}
          </a>
          <Link
            href="/booking"
            className="card-premium inline-flex items-center rounded-full px-6 py-3.5 text-sm font-semibold text-ink"
          >
            {t("ctaBook")}
          </Link>
        </div>

        {/* Real footage stills as floating white cards */}
        <div className="relative mt-6 grid w-full max-w-4xl grid-cols-3 items-end gap-3 sm:gap-6">
          {STILLS.map((src, i) => (
            <figure
              key={src}
              className={`card-premium is-static overflow-hidden rounded-3xl p-1.5 sm:p-2 ${
                i === 1 ? "-translate-y-6 sm:-translate-y-10" : i === 0 ? "-rotate-2" : "rotate-2"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="aspect-[3/4] w-full rounded-[1.25rem] object-cover" loading={i === 1 ? "eager" : "lazy"} />
            </figure>
          ))}
        </div>
        <p className="text-xs text-ink-muted">{tHero("footageNote")}</p>
      </div>
    </section>
  );
}
