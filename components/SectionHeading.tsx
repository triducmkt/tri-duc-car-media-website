import { Lockup } from "@/components/Lockup";

type Align = "left" | "center";

export function SectionHeading({
  eyebrow,
  heading,
  sub,
  align = "left",
  tone = "light",
  serif = false,
  as: Tag = "h2",
  accent,
  accentScale,
}: {
  eyebrow?: string;
  heading: string;
  sub?: string;
  align?: Align;
  tone?: "light" | "dark";
  /** Use the serif accent role (font-serif, see lib/fonts.ts) instead of the display role. */
  serif?: boolean;
  /** Heading level — "h1" when this is the page's main heading (one per page, for SEO). */
  as?: "h1" | "h2";
  /** Calligraphy line → renders `heading` as a Lockup C (components/Lockup.tsx).
   *  Only for 2–3 key sections (docs/typography-lockup.md). */
  accent?: string;
  /** Lockup accent size ÷ anchor size (see components/Lockup.tsx). */
  accentScale?: number;
}) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const subColor = tone === "dark" ? "text-white/70" : "text-ink-muted";
  const eyebrowColor = tone === "dark" ? "text-brand-300" : "text-brand-600";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        <span className={`text-sm font-bold uppercase tracking-[0.14em] ${eyebrowColor}`}>
          {eyebrow}
        </span>
      ) : null}
      {accent ? (
        <Lockup accent={accent} anchor={heading} as={Tag} tone={tone} align={align} accentScale={accentScale} />
      ) : (
        <Tag
          className={`${serif ? "font-serif" : "font-display"} text-3xl font-bold tracking-tight sm:text-4xl`}
        >
          {heading}
        </Tag>
      )}
      {sub ? <p className={`text-base leading-relaxed sm:text-lg ${subColor}`}>{sub}</p> : null}
    </div>
  );
}
