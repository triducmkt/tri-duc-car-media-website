"use client";

import { useEffect, useRef } from "react";

/**
 * Lockup C — "2 giọng" heading (docs/typography-lockup.md, anh Đức chốt
 * 05/11/2026; backlog F4–F7). Same build as video template
 * TPL_EDITORIAL_DUAL_TYPE_12:
 *   accent  — Great Vibes calligraphy, lowercase as written, tucked onto the
 *             top of the anchor (≈ 25% visual weight)
 *   anchor  — Playfair Display 900, uppercase, +3% tracking, leading 1.18
 *             (≈ 75%)
 * One colour for both lines (white on dark with a soft 40% diffused shadow;
 * ink on light, no shadow). No stroke, no box, no brand colour.
 *
 * Motion (same as video): anchor fades + rises + unblurs (700 ms, delay
 * 350 ms), then the accent writes on left → right (900 ms, delay 650 ms).
 * `reveal="load"` plays on page load (hero); `reveal="view"` plays the first
 * time the heading scrolls into view — only if it starts below the fold, so
 * nothing ever disappears in front of the reader. prefers-reduced-motion:
 * shown at rest, no motion. Styles: `.lockup*` in app/globals.css.
 *
 * Use sparingly: hero, page titles and at most 2–3 home sections.
 */
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
  anchor: string;
  as?: "h1" | "h2";
  /** hero: home hero · page: short page titles (about) · title: long page
   *  titles (service names) · section: home sections. */
  size?: "hero" | "page" | "title" | "section";
  /** Background the lockup sits on. */
  tone?: "dark" | "light";
  align?: "left" | "center";
  reveal?: "load" | "view";
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || reveal !== "view") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen at hydration → leave it at rest (no flash).
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

  return (
    <Tag
      ref={ref}
      className={`lockup lockup-${size} ${className}`}
      data-tone={tone}
      data-align={align}
      data-play={reveal === "load" ? "" : undefined}
    >
      <span className="lockup-accent">{accent}</span>
      <span className="sr-only"> </span>
      <span className="lockup-anchor">{anchor}</span>
    </Tag>
  );
}
