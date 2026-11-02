import { NextResponse } from "next/server";

/**
 * Owner-only heatmap data for components/analytics/HeatmapOverlay.tsx.
 * Checks `key` against HEATMAP_KEY, then asks the Apps Script web app for the
 * aggregated 1 cm sensor data of one page + layout bucket.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const { HEATMAP_KEY, TRACKING_WEBHOOK_URL, TRACKING_TOKEN } = process.env;

  if (!HEATMAP_KEY || url.searchParams.get("key") !== HEATMAP_KEY) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  if (!TRACKING_WEBHOOK_URL || !TRACKING_TOKEN) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const path = (url.searchParams.get("path") || "/").slice(0, 300);
  const layout = url.searchParams.get("layout") || "desktop";

  try {
    const r = await fetch(TRACKING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: TRACKING_TOKEN, action: "heatmap", path, layout }),
      redirect: "follow",
    });
    const data = await r.json();
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/heatmap] failed:", error);
    return NextResponse.json({ ok: false, error: "upstream_failed" }, { status: 502 });
  }
}
