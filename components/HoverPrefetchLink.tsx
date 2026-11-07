"use client";

import { useState, type ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Locale-aware Link that prefetches only when the visitor shows intent
 * (hover, keyboard focus, touch) instead of whenever it scrolls into view.
 * Each prefetch is a Worker request, and header/footer render ~25 links per
 * page — on Cloudflare Workers Free (100k requests/day) that exhausted the
 * quota (hq/lesson.md ERR-WEB-009). Use for site-wide nav, header, footer.
 */
export function HoverPrefetchLink({ onMouseEnter, onFocus, onTouchStart, ...props }: ComponentProps<typeof Link>) {
  const [active, setActive] = useState(false);
  return (
    <Link
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={(e) => {
        setActive(true);
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        setActive(true);
        onFocus?.(e);
      }}
      onTouchStart={(e) => {
        setActive(true);
        onTouchStart?.(e);
      }}
    />
  );
}
