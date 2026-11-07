/**
 * F3 (docs/brand-backlog.md) — hand-off between a dark (ink) and a light
 * section without a muddy grey band: the dark half eases ink → ink-soft, the
 * light half starts with a faint brand-blue tint, and a glowing brand
 * hairline sits exactly on the edge. Decorative only.
 *
 * - `to="light"`: dark section above, light section below.
 * - `to="dark"`:  light section above, dark section below.
 * - `light`: which light tone it meets ("paper" or "paper-soft").
 */
export function SectionSeam({
  to,
  light = "paper",
}: {
  to: "light" | "dark";
  light?: "paper" | "paper-soft";
}) {
  const lightColor = light === "paper" ? "var(--color-paper)" : "var(--color-paper-soft)";
  const dark = "var(--color-ink) 0%, var(--color-ink-soft) 50%";
  const lit = `color-mix(in srgb, var(--color-brand-50) 70%, ${lightColor}) 50%, ${lightColor} 100%`;
  const background =
    to === "light"
      ? `linear-gradient(to bottom, ${dark}, ${lit})`
      : `linear-gradient(to top, ${dark}, ${lit})`;

  return (
    <div aria-hidden className="relative h-14 sm:h-20" style={{ background }}>
      {/* glow + crisp line on the dark/light edge */}
      <span
        className="absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 opacity-60 blur-md"
        style={{ backgroundImage: "var(--gradient-hairline)" }}
      />
      <span
        className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
        style={{ backgroundImage: "var(--gradient-hairline)" }}
      />
    </div>
  );
}
