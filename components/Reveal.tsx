"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Fades + lifts children into place the first time they scroll into view.
 * Static cards across the site were flat next to SystemHero/Diagnostic's
 * constant motion — this gives them a one-time entrance instead of a
 * competing, continuous animation. Skips straight to visible under
 * prefers-reduced-motion.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms for grids of siblings. */
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Always rendered fully visible; the hidden pre-reveal state is applied
  // only under motion-safe, so prefers-reduced-motion users never see it
  // (and never depend on JS state for their first paint).
  return (
    <div
      ref={ref}
      className={`translate-y-0 opacity-100 transition-all duration-700 ease-out ${
        visible ? "" : "motion-safe:translate-y-6 motion-safe:opacity-0"
      } ${className}`}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
