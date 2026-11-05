"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { TrackerEngine } from "@/lib/tracking/engine";
import { HeatmapOverlay } from "./HeatmapOverlay";

type Consent = "granted" | "denied" | null;
const CONSENT_KEY = "td_consent";
const HEATMAP_KEY = "td_heatmap";
/** Dispatch on window to reopen the consent banner (footer "Data privacy" link). */
export const CONSENT_OPEN_EVENT = "td:consent-open";

function readStorage(store: () => Storage, key: string) {
  try {
    return store().getItem(key);
  } catch {
    return null;
  }
}
function writeStorage(store: () => Storage, key: string, value: string | null) {
  try {
    if (value === null) store().removeItem(key);
    else store().setItem(key, value);
  } catch {
    /* storage blocked */
  }
}

/**
 * Mounted once in the locale layout. Three modes:
 *  - consent unknown → show banner, record nothing
 *  - consent granted → run TrackerEngine (1 cm sensor grid + events)
 *  - ?td_heatmap=<key> in the URL → owner view: draw the heatmap overlay
 *    instead of tracking (key is checked server-side by /api/heatmap).
 */
export function Tracker() {
  const t = useTranslations("tracking");
  const pathname = usePathname();
  const [consent, setConsent] = useState<Consent>(null);
  const [ready, setReady] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  // Phones get a one-line strip; the full explanation is one tap away.
  const [expanded, setExpanded] = useState(false);
  const [heatmapKey, setHeatmapKey] = useState<string | null>(null);
  const engineRef = useRef<TrackerEngine | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("td_heatmap");
    if (q) writeStorage(() => sessionStorage, HEATMAP_KEY, q);
    const key = q || readStorage(() => sessionStorage, HEATMAP_KEY);
    const stored = readStorage(() => localStorage, CONSENT_KEY) as Consent;
    // Reading browser-only storage has to happen after hydration.
    /* eslint-disable react-hooks/set-state-in-effect */
    setHeatmapKey(key);
    setConsent(stored);
    setBannerOpen(!stored && !key);
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
    const reopen = () => setBannerOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  // Engine lifecycle — only with consent and outside heatmap mode.
  const active = ready && consent === "granted" && !heatmapKey;
  useEffect(() => {
    if (!active) return;
    const engine = new TrackerEngine();
    engineRef.current = engine;
    engine.start(location.pathname);
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [active]);

  // Client-side navigation → new page view.
  useEffect(() => {
    const engine = engineRef.current;
    if (engine && active) engine.startPage(pathname);
  }, [pathname, active]);

  function decide(value: "granted" | "denied") {
    writeStorage(() => localStorage, CONSENT_KEY, value);
    if (value === "denied") {
      ["td_vid", "td_sid", "td_sid_at"].forEach((k) => writeStorage(() => localStorage, k, null));
    }
    setConsent(value);
    setBannerOpen(false);
  }

  if (!ready) return null;

  if (heatmapKey) {
    return (
      <HeatmapOverlay
        accessKey={heatmapKey}
        path={pathname}
        onExit={() => {
          writeStorage(() => sessionStorage, HEATMAP_KEY, null);
          location.href = location.pathname;
        }}
      />
    );
  }

  if (!bannerOpen) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("title")}
      className="fixed inset-x-3 bottom-[4.25rem] z-[60] mx-auto max-w-xl rounded-2xl bg-ink text-white shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)] ring-1 ring-white/10 sm:bottom-5 sm:left-5 sm:right-auto"
    >
      {/* Phone, collapsed: one short line + the two choices (~70px tall). */}
      <div className={expanded ? "hidden" : "flex items-center gap-2.5 px-3.5 py-2.5 sm:hidden"}>
        <p className="min-w-0 flex-1 text-xs leading-snug text-white/80">
          {t("short")}{" "}
          <button
            type="button"
            onClick={() => setExpanded(true)}
            aria-expanded={expanded}
            className="font-semibold text-brand-300 underline underline-offset-2"
          >
            {t("more")}
          </button>
        </p>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            onClick={() => decide("granted")}
            className="min-h-9 px-3.5 text-xs rounded-full bg-brand-500 font-bold text-ink hover:bg-brand-400"
          >
            {t("accept")}
          </button>
          <button
            type="button"
            onClick={() => decide("denied")}
            className="min-h-9 px-3.5 text-xs rounded-full font-semibold text-white ring-1 ring-inset ring-white/25 hover:bg-white/5"
          >
            {t("decline")}
          </button>
        </div>
      </div>

      {/* Full card: always from sm up; on phones after "Chi tiết". */}
      <div className={`p-5 ${expanded ? "block" : "hidden sm:block"}`}>
        <p className="font-display text-base font-semibold">{t("title")}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-white/70">{t("body")}</p>
        <details className="mt-2 text-sm text-white/60" open={expanded || undefined}>
          <summary className="cursor-pointer font-medium text-brand-300">{t("detailsToggle")}</summary>
          <p className="mt-2 leading-relaxed">{t("details")}</p>
        </details>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => decide("granted")}
            className="min-h-11 px-5 text-sm rounded-full bg-brand-500 font-bold text-ink hover:bg-brand-400"
          >
            {t("accept")}
          </button>
          <button
            type="button"
            onClick={() => decide("denied")}
            className="min-h-11 px-5 text-sm rounded-full font-semibold text-white ring-1 ring-inset ring-white/25 hover:bg-white/5"
          >
            {t("decline")}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Small footer button that lets visitors change their choice later. */
export function ConsentSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}
      className="text-left hover:text-white"
    >
      {label}
    </button>
  );
}
