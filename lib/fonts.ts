import { Mona_Sans, Source_Serif_4 } from "next/font/google";

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

// Body & UI — paragraphs, forms, buttons, nav. Mona Sans: crisp grotesque with
// firm 600–800 weights for nav and buttons; clean stacked Vietnamese diacritics.
// Variable (wght 200–900, wdth 75–125) so every weight is available.
export const fontBody = Mona_Sans({
  variable: "--tdcm-font-body",
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
  display: "swap",
});

// Display — H1–H3, numbers, labels, eyebrows. Same family as body (one premium
// sans voice site-wide); headings get weight 700–800 and the serif does the
// contrast. Identical files to fontBody, so the browser downloads them once.
export const fontDisplay = Mona_Sans({
  variable: "--tdcm-font-display",
  subsets: ["latin", "vietnamese"],
  axes: ["wdth"],
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
    family: "Mona Sans",
    cssVar: "--tdcm-font-body",
    tailwind: "font-sans",
    weights: ["variable 200–900", "wdth 75–125"],
    use: "Đoạn văn 400, nhãn/menu 600, nút 700",
    leading: "1.6 (đoạn văn) · 1.4 (UI)",
  },
  display: {
    family: "Mona Sans",
    cssVar: "--tdcm-font-display",
    tailwind: "font-display",
    weights: ["variable 200–900", "wdth 75–125"],
    use: "H1–H3 700–800, con số lớn, eyebrow 700, badge",
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
