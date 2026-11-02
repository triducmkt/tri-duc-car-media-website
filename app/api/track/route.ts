import { NextResponse } from "next/server";
import { z } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Receives batches from lib/tracking/engine.ts, adds what only the server can
 * see (IP, geo, user-agent), and forwards to the Google Apps Script web app
 * bound to the tracking spreadsheet (scripts/tracking/Code.gs).
 *
 * Env (Cloudflare Worker secrets / .env.local):
 *   TRACKING_WEBHOOK_URL — Apps Script web app /exec URL
 *   TRACKING_TOKEN       — shared secret, same value as Script Property TOKEN
 * Without them the batch is accepted and dropped, so the site never breaks.
 */
const primitive = z.union([z.string().max(400), z.number(), z.boolean()]);
const schema = z.object({
  v: z.literal(1),
  vid: z.string().max(64),
  sid: z.string().max(64),
  pvId: z.string().max(64),
  seq: z.number().int().min(0).max(100_000),
  path: z.string().max(300),
  layout: z.enum(["desktop", "tablet", "mobile"]),
  env: z.record(z.string(), primitive).nullable(),
  events: z.array(z.record(z.string(), primitive)).max(200),
  sensors: z.array(z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()])).max(5000),
  rows: z.array(z.tuple([z.number(), z.number()])).max(2000),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { TRACKING_WEBHOOK_URL, TRACKING_TOKEN } = process.env;
  if (!TRACKING_WEBHOOK_URL || !TRACKING_TOKEN) {
    return new NextResponse(null, { status: 204 });
  }

  const h = request.headers;
  let cf: Record<string, unknown> = {};
  try {
    cf = (getCloudflareContext().cf ?? {}) as Record<string, unknown>;
  } catch {
    /* local dev — no Cloudflare request metadata */
  }

  const server = {
    receivedAt: new Date().toISOString(),
    ip: h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0].trim() || "",
    country: String(cf.country ?? h.get("cf-ipcountry") ?? ""),
    region: String(cf.region ?? ""),
    city: String(cf.city ?? ""),
    postalCode: String(cf.postalCode ?? ""),
    latitude: String(cf.latitude ?? ""),
    longitude: String(cf.longitude ?? ""),
    asn: String(cf.asn ?? ""),
    asOrg: String(cf.asOrganization ?? ""),
    colo: String(cf.colo ?? ""),
    userAgent: (h.get("user-agent") || "").slice(0, 400),
    acceptLanguage: (h.get("accept-language") || "").slice(0, 100),
  };

  try {
    const r = await fetch(TRACKING_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: TRACKING_TOKEN, action: "ingest", server, batch: parsed.data }),
      redirect: "follow",
    });
    if (!r.ok) console.error("[api/track] sheet webhook status", r.status);
  } catch (error) {
    console.error("[api/track] sheet webhook failed:", error);
  }

  return new NextResponse(null, { status: 204 });
}
