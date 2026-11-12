import { getTranslations } from "next-intl/server";
import { Droplets, Leaf, Megaphone, PenLine, Sprout, TrendingUp } from "lucide-react";
import { Container } from "@/components/Container";
import { Reveal } from "@/components/Reveal";

/** About page #thuong-hieu — the brand story: the animated logo (video loop,
 *  the "cây mọc" motion from design/logo-tri-duc-media), what the name and each
 *  part of the logo mean, the slogan and the mission. Vision (#tam-nhin) and
 *  core values (#gia-tri) follow directly on the same page.
 *  Copy: messages → brand. Source of truth for the design: design/logo-tri-duc-media/. */
const NAME_ICONS = [PenLine, Megaphone];
const LOGO_ICONS = [Leaf, TrendingUp, Droplets, Sprout];

export async function BrandStory() {
  const t = await getTranslations("brand");
  const nameItems = t.raw("name.items") as { title: string; body: string }[];
  const logoItems = t.raw("logo.items") as { title: string; body: string }[];

  return (
    <section id="thuong-hieu" className="surface-light py-20 sm:py-28">
      <Container className="flex flex-col gap-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <span className="eyebrow-pill" data-tone="light">{t("eyebrow")}</span>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">{t("heading")}</h2>
          <p className="text-lg leading-relaxed text-ink-muted">{t("sub")}</p>
        </div>

        {/* The animated logo, as a looping muted video (plays inline on phones). */}
        <Reveal>
          <figure className="mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_80px_-40px_rgba(11,18,32,0.35)] ring-1 ring-black/5">
            <video
              className="aspect-video w-full"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster="/brand/motion/logo-motion-16x9-poster.png"
              aria-label={t("videoAria")}
            >
              <source src="/brand/motion/logo-motion-16x9.mp4" type="video/mp4" />
            </video>
            <figcaption className="border-t border-black/5 px-6 py-4 text-center text-sm text-ink-muted">{t("videoCaption")}</figcaption>
          </figure>
        </Reveal>

        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          {/* The name */}
          <div className="flex flex-col gap-6">
            <h3 className="font-serif text-2xl font-semibold text-ink">{t("name.heading")}</h3>
            {nameItems.map((item, i) => {
              const Icon = NAME_ICONS[i] ?? PenLine;
              return (
                <Reveal key={item.title} delay={i * 80} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon size={20} aria-hidden />
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                    <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* The logo */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element -- small static SVG mark */}
              <img src="/brand/mark.svg" alt="" aria-hidden className="h-14 w-14" />
              <h3 className="font-serif text-2xl font-semibold text-ink">{t("logo.heading")}</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {logoItems.map((item, i) => {
                const Icon = LOGO_ICONS[i] ?? Leaf;
                return (
                  <Reveal key={item.title} delay={i * 80}>
                    <div className="card-premium flex h-full flex-col gap-2.5 rounded-2xl p-6">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl icon-gradient">
                        <Icon size={19} aria-hidden />
                      </span>
                      <p className="font-display text-base font-semibold text-ink">{item.title}</p>
                      <p className="text-sm leading-relaxed text-ink-muted">{item.body}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </div>

        {/* Slogan + mission; vision and core values continue right below. */}
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.75rem] bg-ink text-white ring-1 ring-white/10 sm:grid-cols-2">
            <div className="flex flex-col gap-3 border-b border-white/10 p-8 sm:border-b-0 sm:border-r sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-400">{t("sloganLabel")}</span>
              <p className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{t("slogan")}</p>
              <p className="text-sm leading-relaxed text-white/65">{t("sloganBody")}</p>
            </div>
            <div className="flex flex-col gap-3 p-8 sm:p-10">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-300">{t("missionLabel")}</span>
              <p className="font-serif text-3xl font-bold leading-tight sm:text-4xl">{t("mission")}</p>
              <p className="text-sm leading-relaxed text-white/65">{t("missionBody")}</p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
