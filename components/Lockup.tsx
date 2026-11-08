"use client";

import { useEffect, useRef } from "react";
import metrics from "@/lib/lockupMetrics.json";

/**
 * Lockup C — "2 giọng" heading. Rules: docs/DESIGN-CORE-RULES.md (V1–V10).
 *   accent  — Great Vibes calligraphy, lowercase as written. Its TALLEST
 *             stroke is 0.30 × the anchor's cap height (V1).
 *   anchor  — Playfair Display 900, uppercase, +3% tracking. One line (V8),
 *             fitted to the column: font-size = min(size max, column ÷ width).
 *             A "\n" in the copy is an intentional break (counted as an
 *             exception to V8 — max 10% of lockups).
 * Both numbers come from lib/lockupMetrics.json, generated from the real font
 * files by `npm run lockup:qc` — run it after ANY copy change (V9 QC loop).
 * One colour for both lines; no stroke, box or brand colour.
 *
 * Motion (same as video #12): anchor fades + rises + unblurs, then the accent
 * writes on left → right. reveal="load" plays on page load; reveal="view" the
 * first time it scrolls in (only if it starts below the fold).
 */
type Metrics = {
  fitSafety: number;
  anchors: Record<string, number>;
  accents: Record<string, { scale: number; em: number }>;
};
const M = metrics as Metrics;

export function Lockup({
  accent,
  anchor,
  as: Tag = "h2",
  size = "section",
  tone = "dark",
  align = "left",
  reveal = "view",
  className = "",
}: {
  accent: string;
  /** Copy as written; rendered uppercase. "\n" = intentional line break. */
  anchor: string;
  as?: "h1" | "h2";
  /** Largest anchor size: hero 96px · page 72px · title 64px · section 64px. */
  size?: "hero" | "page" | "title" | "section";
  /** Background the lockup sits on. */
  tone?: "dark" | "light";
  align?: "left" | "center";
  reveal?: "load" | "view";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);
  const anchorEm = M.anchors[anchor.toUpperCase()];
  const accentScale = M.accents[accent]?.scale;
  if (process.env.NODE_ENV !== "production" && (!anchorEm || !accentScale)) {
    console.warn(`[Lockup] "${accent} / ${anchor}" chưa có số đo — chạy npm run lockup:qc (V9).`);
  }

  useEffect(() => {
    const el = ref.current;
    if (!el || reveal !== "view") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;
    el.dataset.armed = "";
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        delete el.dataset.armed;
        el.dataset.play = "";
        io.disconnect();
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reveal]);

  const lines = anchor.split("\n");
  return (
    <div className="lockup-box" data-align={align}>
      <Tag
        ref={ref}
        className={`lockup lockup-${size} ${className}`}
        data-tone={tone}
        data-fit={anchorEm ? "" : undefined}
        data-play={reveal === "load" ? "" : undefined}
        style={{
          ["--anchor-em" as string]: anchorEm ?? undefined,
          ["--fit-safety" as string]: M.fitSafety,
          ["--accent-scale" as string]: accentScale ?? 0.34,
        }}
      >
        <span className="lockup-accent">{accent}</span>
        <span className="sr-only"> </span>
        <span className="lockup-anchor">
          {lines.map((ln, i) => (
            <span key={i} className="lockup-line">
              {ln}
            </span>
          ))}
        </span>
      </Tag>
    </div>
  );
}
