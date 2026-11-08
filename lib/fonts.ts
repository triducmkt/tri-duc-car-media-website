import { Commissioner, Great_Vibes, Playfair_Display } from "next/font/google";

/**
 * MASTER FONT SYSTEM — the only place font families are chosen.
 *
 * Every component reaches a font through its ROLE, never its family name:
 *   Tailwind      `font-sans` (default body) · `font-display` · `font-serif`
 *                 · `font-lockup` · `font-script`
 *   CSS / canvas  var(--tdcm-font-body) · var(--tdcm-font-display) · var(--tdcm-font-serif)
 * Swapping a family = change the loader below + its FONT_ROLES row; nothing else.
 * Rules, the vetted Vietnamese bench and how to audit: docs/font-system.md.
 * Audit: `npm run fonts:check` (fails on hard-coded families / old variables /
 * fonts without the `vietnamese` subset).
 *
 * v3 (2026-11-08, anh Đức: "dàn font phụ mới, premium, không giống trang AI"):
 * the whole site is built from the two voices chốt in logo v12a + the hero
 * lockup — Playfair Display (first voice) and Great Vibes (second voice) — plus
 * ONE quiet sans for reading and UI. Three families in total (was four).
 *
 * next/font needs literal options at module scope, so the loaders and the
 * FONT_ROLES table are kept side by side — keep them in sync.
 */

// Body & UI — paragraphs, forms, buttons, nav. Commissioner: low-contrast
// grotesk with a faint classical stress that sits well next to Playfair's
// transitional forms; designed with full Vietnamese stacked diacritics; rarely
// used, so the site does not read as a template. Variable wght 100–900.
export const fontBody = Commissioner({
  variable: "--tdcm-font-body",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Display — numbers, prices, stats, eyebrows, labels, badges, small UI titles.
// Same family as body (identical files, downloaded once); weights 600–800.
// Real headings (h1–h3) use the serif role, not this one.
export const fontDisplay = Commissioner({
  variable: "--tdcm-font-display",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

// Serif — ALL page / section / card headings (h1–h3, sentence case, 600–700),
// brand statements, pull quotes (italic). Playfair Display = the first voice of
// lockup C and of the logo, so headings and lockups speak one serif language.
// Variable wght 400–900 + italic; the lockup role reuses these same files at 900.
export const fontSerif = Playfair_Display({
  variable: "--tdcm-font-serif",
  subsets: ["latin", "vietnamese"],
  style: ["normal", "italic"],
  display: "swap",
});

// Script — the second voice of lockup C (components/Lockup.tsx) and the logo's
// "media". Only through <Lockup>. preload: false — pages without a lockup never
// download it.
export const fontScript = Great_Vibes({
  variable: "--tdcm-font-script",
  subsets: ["latin", "vietnamese"],
  weight: ["400"],
  display: "swap",
  preload: false,
});

/** Put on <html> so every role variable is defined site-wide. */
export const fontVariables = `${fontBody.variable} ${fontDisplay.variable} ${fontSerif.variable} ${fontScript.variable}`;

/** FIELD_MAP-style registry read by scripts/check-fonts.mjs and the docs. */
export const FONT_ROLES = {
  body: {
    family: "Commissioner",
    cssVar: "--tdcm-font-body",
    tailwind: "font-sans",
    weights: ["variable 100–900"],
    use: "Đoạn văn 400, nhãn/menu 600, nút 700",
    leading: "1.6 (đoạn văn) · 1.4 (UI)",
  },
  display: {
    family: "Commissioner",
    cssVar: "--tdcm-font-display",
    tailwind: "font-display",
    weights: ["variable 100–900"],
    use: "Con số, giá, chỉ số, eyebrow, nhãn, badge, tiêu đề UI nhỏ (600–800). KHÔNG dùng cho h1–h3",
    leading: "1.2–1.4",
  },
  serif: {
    family: "Playfair Display",
    cssVar: "--tdcm-font-serif",
    tailwind: "font-serif",
    weights: ["variable 400–900", "italic"],
    use: "Mọi tiêu đề h1–h3 (chữ thường đầu câu, 600–700), câu tuyên ngôn, trích dẫn (italic)",
    leading: "≥ 1.15 (dấu chồng tiếng Việt)",
  },
  lockup: {
    family: "Playfair Display",
    cssVar: "--tdcm-font-serif",
    tailwind: "font-lockup",
    weights: ["900"],
    use: "Dòng chính của lockup C (IN HOA, giãn chữ +3%) — chỉ qua <Lockup>; dùng chung file với vai trò serif",
    leading: "1.18",
  },
  script: {
    family: "Great Vibes",
    cssVar: "--tdcm-font-script",
    tailwind: "font-script",
    weights: ["400"],
    use: "Dòng thư pháp của lockup C (chữ thường như gõ) — chỉ qua <Lockup>",
    leading: "1",
  },
} as const;
