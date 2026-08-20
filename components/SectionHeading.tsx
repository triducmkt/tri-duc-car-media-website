type Align = "left" | "center";

export function SectionHeading({
  eyebrow,
  heading,
  sub,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  heading: string;
  sub?: string;
  align?: Align;
  tone?: "light" | "dark";
}) {
  const alignClass = align === "center" ? "items-center text-center mx-auto" : "items-start text-left";
  const subColor = tone === "dark" ? "text-white/70" : "text-ink-muted";
  const eyebrowColor = tone === "dark" ? "text-brand-300" : "text-brand-600";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        <span className={`text-sm font-semibold uppercase tracking-[0.14em] ${eyebrowColor}`}>
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
        {heading}
      </h2>
      {sub ? <p className={`text-base leading-relaxed sm:text-lg ${subColor}`}>{sub}</p> : null}
    </div>
  );
}
