/** Resolved font-family stack for a font ROLE, for canvas / three.js text that
 *  can't use CSS classes. Browser-only. Families live in lib/fonts.ts. */
export type FontRole = "body" | "display" | "serif";

const FALLBACK: Record<FontRole, string> = {
  body: "system-ui, sans-serif",
  display: "system-ui, sans-serif",
  serif: "Georgia, serif",
};

export function fontStack(role: FontRole): string {
  const family = getComputedStyle(document.documentElement).getPropertyValue(`--tdcm-font-${role}`).trim();
  return family ? `${family}, ${FALLBACK[role]}` : FALLBACK[role];
}
