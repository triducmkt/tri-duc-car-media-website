import type { CheckAxis } from "@/lib/shopCheck";

/** "Thư viện quà" — gifts that match each axis of the 60-second check
 *  (components/check/GiftReveal.tsx + the library on /kiem-tra-co-so).
 *  Copy: messages → gifts.items.<id>. Source packs for NotebookLM:
 *  content/notebooklm/<id>.md (index: content/notebooklm/README.md).
 *
 *  status "ready"   → `url` points at the file (public/gifts/… or a link) and
 *                     the visitor can open it after leaving name + Zalo.
 *  status "soon"    → still being made: the visitor leaves name + Zalo and
 *                     Trí Đức sends it when it is published (honest waitlist).
 *  The 15-minute diagnosis card is a real, existing offer (booking flow). */
export type GiftFormat = "ebook" | "podcast" | "infographic" | "poster" | "slides" | "checklist" | "card";

export const GIFT_MAP = {
  "nghi-3-ngay": { axis: "doi-ngu", format: "ebook", status: "soon", url: "" },
  "giu-khach-cu": { axis: "khach-cu", format: "checklist", status: "soon", url: "" },
  "dung-du-deu": { axis: "khach-moi", format: "slides", status: "soon", url: "" },
  "kenh-online-1-nguoi": { axis: "kenh", format: "infographic", status: "soon", url: "" },
  "so-lieu-1-trang": { axis: "so-lieu", format: "checklist", status: "soon", url: "" },
  "5-truc-poster": { axis: null, format: "poster", status: "soon", url: "" },
  "chu-co-so-hoi": { axis: null, format: "podcast", status: "soon", url: "" },
  "the-15-phut": { axis: null, format: "card", status: "ready", url: "/booking" },
} as const satisfies Record<string, { axis: CheckAxis | null; format: GiftFormat; status: "ready" | "soon"; url: string }>;

export type GiftId = keyof typeof GIFT_MAP;
export const GIFT_IDS = Object.keys(GIFT_MAP) as GiftId[];

/** The gift offered for the visitor's weakest axis. */
export function giftForAxis(axis: CheckAxis): GiftId {
  return GIFT_IDS.find((id) => GIFT_MAP[id].axis === axis) ?? "the-15-phut";
}
