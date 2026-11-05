import type { CheckAxis } from "@/lib/shopCheck";

/** "Thư viện quà" — gifts that match each axis of the 60-second check
 *  (components/check/GiftReveal + GiftContent, library on /kiem-tra-co-so).
 *  Copy: messages → gifts.items.<id>, asset labels → gifts.assets.<label>.
 *  Source packs for NotebookLM: content/notebooklm/<id>.md (README.md = index).
 *
 *  status "ready" → `assets` open on the page once the visitor leaves name +
 *                   Zalo (or taps "send via Zalo"); `href` for the booking card.
 *  status "soon"  → still being made: honest waitlist, sent on Zalo when published.
 *  Files live on the Sanity CDN (scripts: upload via SANITY_API_TOKEN); originals
 *  are backed up in hq/backups/gifts/<id>/. */
export type GiftFormat = "ebook" | "podcast" | "infographic" | "poster" | "slides" | "checklist" | "card";
export type GiftAsset = {
  kind: "pdf" | "image" | "video" | "audio";
  /** messages → gifts.assets.<label> */
  label: string;
  url: string;
  poster?: string;
  /** Videos: 16:9 instead of the default vertical 9:16. */
  landscape?: boolean;
};
type Gift = { axis: CheckAxis | null; format: GiftFormat; status: "ready" | "soon"; assets: GiftAsset[]; href?: "/booking" };

const CDN = "https://cdn.sanity.io/files/0lzmbuzo/production";

export const GIFT_MAP = {
  "nghi-3-ngay": {
    axis: "doi-ngu",
    format: "ebook",
    status: "ready",
    assets: [
      { kind: "video", label: "video60", url: `${CDN}/3ae46c2747ad99f2e6df68e60faa4e4e790c143d.mp4`, poster: `${CDN}/5f74ef429989f20c8eb23744ee3619b1cea5c4ed.jpg` },
      { kind: "audio", label: "audioShort", url: `${CDN}/4614ea2e5418a96e73739cf04dc5b0ea3837d327.m4a` },
      { kind: "audio", label: "audioLong", url: `${CDN}/d32951f78fb52618bfe979ceece5ddfe42468238.m4a` },
      { kind: "pdf", label: "ebook", url: `${CDN}/aa7fd6d6ed022be8bb6908ce29c1ca9004f73124.pdf` },
      { kind: "image", label: "infographic", url: `${CDN}/d2dfd51deda2dbdbb0a7cdaaf2ee2cab74255986.jpg` },
    ],
  },
  "giu-khach-cu": {
    axis: "khach-cu",
    format: "checklist",
    status: "ready",
    assets: [
      { kind: "video", label: "video7", url: `${CDN}/b5159fed8fa17218546dc55c79004974dd5e6143.mp4`, poster: `${CDN}/c09c1710c438bd5104005229aa19206884718da9.jpg`, landscape: true },
      { kind: "audio", label: "audio14", url: `${CDN}/712c8e4bf85179f116be3848f21b99e4bb95a567.m4a` },
      { kind: "pdf", label: "checklist12", url: `${CDN}/cf95ceec2243a7eadd33f428a91d99580a83c5f6.pdf` },
      { kind: "image", label: "infographic", url: `${CDN}/07e640d5bec0fd11d4930cce077d935c5b2131ed.jpg` },
    ],
  },
  "dung-du-deu": {
    axis: "khach-moi",
    format: "slides",
    status: "ready",
    assets: [
      { kind: "video", label: "video6", url: `${CDN}/a4fb423714874b0ab79395ac1246af3614e7c1d0.mp4`, poster: `${CDN}/55b170a4c038e27f0f5b418dd9466a54d5c39eb0.jpg`, landscape: true },
      { kind: "audio", label: "audio16", url: `${CDN}/98feb1c3c149185df36464ee7421ab32f2f0b6d6.m4a` },
      { kind: "pdf", label: "slides11", url: `${CDN}/672a2f8a87258e0fc2958897450e05c8fa5204e8.pdf` },
      { kind: "image", label: "infographic", url: `${CDN}/5c8e06658a1e991ff3a4a28f4f7754cf32ea3e0c.jpg` },
    ],
  },
  "kenh-online-1-nguoi": { axis: "kenh", format: "infographic", status: "soon", assets: [] },
  "so-lieu-1-trang": { axis: "so-lieu", format: "checklist", status: "soon", assets: [] },
  "5-truc-poster": { axis: null, format: "poster", status: "soon", assets: [] },
  "chu-co-so-hoi": { axis: null, format: "podcast", status: "soon", assets: [] },
  "the-15-phut": { axis: null, format: "card", status: "ready", assets: [], href: "/booking" },
} as const satisfies Record<string, Gift>;

export type GiftId = keyof typeof GIFT_MAP;
export const GIFT_IDS = Object.keys(GIFT_MAP) as GiftId[];

/** The gift offered for the visitor's weakest axis. */
export function giftForAxis(axis: CheckAxis): GiftId {
  return GIFT_IDS.find((id) => GIFT_MAP[id].axis === axis) ?? "the-15-phut";
}

export function giftAssets(id: GiftId): readonly GiftAsset[] {
  return GIFT_MAP[id].assets;
}
