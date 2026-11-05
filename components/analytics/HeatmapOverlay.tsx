"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CM_PX, layoutBucket, type LayoutBucket } from "@/lib/tracking/grid";

type Metric = "clicks" | "hover" | "attention";
type HeatmapData = {
  ok: boolean;
  error?: string;
  /** [row, col, hoverMs, moves, clicks, sessions] per 1 cm sensor */
  cells: [number, number, number, number, number, number][];
  /** [row, viewMs] per 1 cm band */
  rows: [number, number][];
  pageviews: number;
  visitors: number;
  updatedAt: string;
};

const METRIC_LABEL: Record<Metric, string> = {
  clicks: "Lượt click",
  hover: "Thời gian rê chuột",
  attention: "Thời gian được xem",
};

/** Blue → green → yellow → red, alpha grows with intensity. */
function heatColor(t: number) {
  const hue = 240 * (1 - t);
  return `hsla(${hue}, 95%, 50%, ${0.18 + 0.55 * t})`;
}

/**
 * Owner-only view (enabled by ?td_heatmap=<key>): paints the 1 cm sensor grid
 * over the live page, coloured by the aggregated data from the Google Sheet.
 */
export function HeatmapOverlay({ accessKey, path, onExit }: { accessKey: string; path: string; onExit: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [metric, setMetric] = useState<Metric>("clicks");
  // Follow the real viewport until the owner picks a layout by hand.
  const [autoLayout, setAutoLayout] = useState<LayoutBucket>("desktop");
  const [manualLayout, setLayout] = useState<LayoutBucket | null>(null);
  const layout = manualLayout ?? autoLayout;
  const [data, setData] = useState<HeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    let cancelled = false;
    const qs = new URLSearchParams({ path, layout, key: accessKey });
    // Loading flag is UI state tied to this fetch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    fetch(`/api/heatmap?${qs}`)
      .then((r) => r.json())
      .then((d: HeatmapData) => !cancelled && setData(d))
      .catch(() => !cancelled && setData({ ok: false, error: "network", cells: [], rows: [], pageviews: 0, visitors: 0, updatedAt: "" }))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, layout, accessKey]);

  const measure = useCallback(() => {
    const el = document.documentElement;
    setSize({ w: el.scrollWidth, h: el.scrollHeight });
    setAutoLayout(layoutBucket(window.innerWidth));
  }, []);

  useEffect(() => {
    // ResizeObserver also fires once right after observe() → initial size.
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    return () => ro.disconnect();
  }, [measure, path]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.w) return;
    canvas.width = size.w;
    canvas.height = Math.min(size.h, 32000);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Faint 1 cm grid so every sensor is visible.
    ctx.strokeStyle = "rgba(10,111,184,0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= size.w; x += CM_PX) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, canvas.height);
    }
    for (let y = 0; y <= canvas.height; y += CM_PX) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(size.w, Math.round(y) + 0.5);
    }
    ctx.stroke();
    if (!data?.ok) return;

    if (metric === "attention") {
      const max = Math.max(1, ...data.rows.map((r) => r[1]));
      for (const [row, ms] of data.rows) {
        ctx.fillStyle = heatColor(Math.sqrt(ms / max));
        ctx.fillRect(0, row * CM_PX, size.w, CM_PX);
      }
      return;
    }
    const pick = (c: HeatmapData["cells"][number]) => (metric === "clicks" ? c[4] : c[2]);
    const max = Math.max(1, ...data.cells.map(pick));
    for (const c of data.cells) {
      const v = pick(c);
      if (!v) continue;
      ctx.fillStyle = heatColor(Math.sqrt(v / max));
      ctx.fillRect(c[1] * CM_PX, c[0] * CM_PX, CM_PX, CM_PX);
      if (metric === "clicks" && v / max > 0.15) {
        ctx.fillStyle = "rgba(0,0,0,0.75)";
        ctx.font = "600 11px system-ui";
        ctx.fillText(String(v), c[1] * CM_PX + 4, c[0] * CM_PX + 14);
      }
    }
  }, [data, metric, size]);

  const totalClicks = data?.cells.reduce((s, c) => s + c[4], 0) ?? 0;

  return createPortal(
    <>
      <canvas
        ref={canvasRef}
        aria-hidden
        style={{ position: "absolute", top: 0, left: 0, width: size.w, height: Math.min(size.h, 32000), zIndex: 9990, pointerEvents: "none" }}
      />
      <div className="fixed bottom-4 left-4 z-[9999] w-[19rem] rounded-2xl bg-ink/95 p-4 text-sm text-white shadow-2xl ring-1 ring-white/15">
        <div className="flex items-center justify-between">
          <p className="font-display font-semibold">Heatmap 1 cm — {path}</p>
          <button type="button" onClick={onExit} className="text-white/60 hover:text-white" aria-label="Thoát heatmap">
            ✕
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {(Object.keys(METRIC_LABEL) as Metric[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`rounded-lg px-2 py-1.5 text-xs font-semibold ${metric === m ? "bg-gold-500 text-ink" : "bg-white/10 hover:bg-white/15"}`}
            >
              {METRIC_LABEL[m]}
            </button>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5">
          {(["desktop", "tablet", "mobile"] as LayoutBucket[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLayout(l)}
              className={`rounded-lg px-2 py-1 text-xs ${layout === l ? "bg-brand-500" : "bg-white/10 hover:bg-white/15"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <div className="mt-3 h-2 rounded-full" style={{ background: `linear-gradient(90deg, ${heatColor(0)}, ${heatColor(0.5)}, ${heatColor(1)})` }} />
        <p className="mt-2 text-xs leading-relaxed text-white/65">
          {loading
            ? "Đang tải dữ liệu…"
            : data?.ok
              ? `${data.pageviews} lượt xem · ${data.visitors} khách · ${totalClicks} click · ${data.cells.length} sensor có dữ liệu · cập nhật ${data.updatedAt}`
              : `Không tải được dữ liệu (${data?.error ?? "?"}).`}
        </p>
        {layout !== autoLayout ? (
          <p className="mt-1 text-xs text-gold-400">Lưu ý: đang xem dữ liệu {layout} trên màn hình khác cỡ — vị trí có thể lệch.</p>
        ) : null}
      </div>
    </>,
    document.body,
  );
}
