import { Noto_Sans, Plus_Jakarta_Sans, Source_Serif_4 } from "next/font/google";

/**
 * MASTER FONT SYSTEM — the only place font families are chosen.
 *
 * Every component reaches a font through its ROLE, never its family name:
 *   Tailwind      `font-sans` (default body) · `font-display` · `font-serif`
 *   CSS / canvas  var(--tdcm-font-body) · var(--tdcm-font-display) · var(--tdcm-font-serif)
 * Swapping a family = change the loader below + its FONT_ROLES row; nothing else.
 * Rules, the vetted Vietnamese bench and how to audit: docs/font-system.md.
 * Audit: `npm run fonts:check` (fails on hard-coded families / old variables /
 * fonts without the `vietnamese` subset).
 *
 * next/font needs literal options at module scope, so the loaders and the
 * FONT_ROLES table are kept side by side — keep them in sync.
 */

// Body & UI — paragraphs, forms, buttons, nav. Noto Sans: Google's flagship
// Vietnamese-complete design; clearest stacked diacritics at 14–16 px and a
// tall x-height for 40–55 year-old readers.
export const fontBody = Noto_Sans({
  variable: "--tdcm-font-body",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Display — H1–H3, numbers, labels, eyebrows. Plus Jakarta Sans: modern,
// premium B2B voice; compact enough for long Vietnamese headlines.
export const fontDisplay = Plus_Jakarta_Sans({
  variable: "--tdcm-font-display",
  subsets: ["latin", "vietnamese"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

// Serif accent — brand statements & pull quotes only (hero line, founder name,
// section headings with `serif`). Source Serif 4: sturdy, low-contrast,
// optical sizes keep diacritics solid at 60 px+. Loaded as a variable font
// (no `weight`): next/font only allows `axes` on variable fonts.
export const fontSerif = Source_Serif_4({
  variable: "--tdcm-font-serif",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

/** Put on <html> so every role variable is defined site-wide. */
export const fontVariables = `${fontBody.variable} ${fontDisplay.variable} ${fontSerif.variable}`;

/** FIELD_MAP-style registry read by scripts/check-fonts.mjs and the docs. */
export const FONT_ROLES = {
  body: {
    family: "Noto Sans",
    cssVar: "--tdcm-font-body",
    tailwind: "font-sans",
    weights: ["400", "500", "600", "700"],
    use: "Đoạn văn, form, nút, menu, nhãn nhỏ",
    leading: "1.6 (đoạn văn) · 1.4 (UI)",
  },
  display: {
    family: "Plus Jakarta Sans",
    cssVar: "--tdcm-font-display",
    tailwind: "font-display",
    weights: ["500", "600", "700", "800"],
    use: "H1–H3, con số lớn, eyebrow, badge",
    leading: "≥ 1.15 (tiếng Việt có dấu chồng — không dùng leading-none cho chữ có dấu)",
  },
  serif: {
    family: "Source Serif 4",
    cssVar: "--tdcm-font-serif",
    tailwind: "font-serif",
    weights: ["variable 200–900", "opsz 8–60"],
    use: "Câu tuyên ngôn thương hiệu, tên founder, heading `serif`, trích dẫn",
    leading: "1.1–1.2",
  },
} as const;
