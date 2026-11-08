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
}) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const subColor = tone === "dark" ? "text-white/70" : "text-ink-muted";
  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        // F9: eyebrow as a pill (.eyebrow-pill in app/globals.css)
        <span className="eyebrow-pill" data-tone={tone}>
          {eyebrow}
        </span>
      ) : null}
      {accent ? (
        <Lockup accent={accent} anchor={heading} as={Tag} tone={tone} align={align} />
      ) : (
        <Tag
          className={`font-serif text-3xl font-bold sm:text-4xl ${serif ? "" : ""}`.trim()}
        >
          {heading}
        </Tag>
      )}
      {sub ? <p className={`text-base leading-relaxed sm:text-lg ${subColor}`}>{sub}</p> : null}
    </div>
  );
}
