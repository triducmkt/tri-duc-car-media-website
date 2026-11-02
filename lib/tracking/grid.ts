/**
 * Virtual 1 cm sensor grid shared by the tracker (components/analytics/Tracker.tsx),
 * the heatmap overlay and the Google Sheet (scripts/tracking/Code.gs).
 *
 * CSS defines 1cm = 96px / 2.54 ≈ 37.795 CSS px. Every page is divided into
 * cells of that size measured from the document's top-left corner; each cell
 * is one "sensor" with id `r{row}c{col}`. Sensors are computed from pointer
 * coordinates, never rendered as DOM nodes (a long page has 10k+ cells).
 *
 * Layout differs between screen sizes, so every sensor reading is tagged with
 * a layout bucket — heatmaps must only be compared within one bucket.
 */
export const CM_PX = 96 / 2.54;

export type LayoutBucket = "desktop" | "tablet" | "mobile";

export function layoutBucket(viewportWidth: number): LayoutBucket {
  if (viewportWidth >= 1024) return "desktop";
  if (viewportWidth >= 640) return "tablet";
  return "mobile";
}

export function cellOf(pageX: number, pageY: number) {
  return { row: Math.max(0, Math.floor(pageY / CM_PX)), col: Math.max(0, Math.floor(pageX / CM_PX)) };
}

/** Custom DOM event components dispatch to log business events (form submits,
 *  survey answers…). The tracker listens for it; nothing happens without consent. */
export const TRACK_EVENT = "td:track";

export function trackEvent(type: string, props: Record<string, string | number | boolean> = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(TRACK_EVENT, { detail: { type, props } }));
}
