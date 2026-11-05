import { COMPANY } from "@/lib/company";

/** Channel hub (components/channels/ChannelOrbit.tsx): every way to reach
 *  Trí Đức, one entry per orbit node. Order = orbit order = tab order.
 *  Copy lives in messages → channels.items.<key>. */
export type ChannelKey = "video" | "facebook" | "zalo" | "phone" | "visit";

export const CHANNEL_MAP: Record<ChannelKey, { color: string; href: string; external: boolean }> = {
  video: { color: "#ff4d4d", href: COMPANY.youtube, external: true },
  facebook: { color: "#4285f4", href: COMPANY.fanpage, external: true },
  zalo: { color: "#6ea6f7", href: COMPANY.zalo, external: true },
  phone: { color: "#45d17f", href: `tel:${COMPANY.phone}`, external: false },
  visit: { color: "#8fb6f9", href: "/booking", external: false },
};

export const CHANNEL_KEYS = Object.keys(CHANNEL_MAP) as ChannelKey[];

/** Video topics shown as chips above the player (messages → channels.topics). */
export const VIDEO_TOPICS = ["van-hanh", "khach-hang", "dong-tien", "marketing"] as const;
export type VideoTopic = (typeof VIDEO_TOPICS)[number];

export type ChannelVideo = {
  id: string;
  title: string;
  /** YouTube or Facebook link; empty when the video is an uploaded file. */
  url?: string;
  fileUrl?: string;
  vertical: boolean;
  topic?: VideoTopic;
  views?: string;
};

export type VideoSource =
  | { kind: "youtube"; id: string }
  | { kind: "facebook"; url: string }
  | { kind: "file"; url: string }
  | null;

export function videoSource(v: ChannelVideo): VideoSource {
  if (v.fileUrl) return { kind: "file", url: v.fileUrl };
  if (!v.url) return null;
  const yt = v.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([\w-]{11})/);
  if (yt) return { kind: "youtube", id: yt[1] };
  if (/facebook\.com|fb\.watch/.test(v.url)) return { kind: "facebook", url: v.url };
  return null;
}

/** Shown until videos are added in Sanity Studio (document type "Video").
 *  Real shorts from youtube.com/@TangTriDuc1989, views as of 03/11/2026. */
export const FALLBACK_VIDEOS: ChannelVideo[] = [
  ["n-y9EeRB1vs", "Nếu anh nghỉ 3 ngày mà cơ sở rối…", "van-hanh", "401"],
  ["OgsVdCY19eQ", "Làm sao giảm rủi ro vận hành khi quản lý gara?", "van-hanh", "4,2 N"],
  ["Zp9CRKhpc0g", "Khách chỉ nhớ ông chủ, vậy nhân viên làm gì?", "van-hanh", "2,3 N"],
  ["bxaR93LxLaQ", "Chủ lớn tuổi phải lăn lộn mãi đến khi nào?", "van-hanh", "2,1 N"],
  ["Rle8SJZRdhk", "Bứt phá quy mô khi sếp dám “bước lùi một bước”", "van-hanh", "1,1 N"],
  ["sJp0BnLZHy8", "Làm gì khi khách quen im lặng?", "khach-hang", "2,7 N"],
  ["6C9JT43xoyY", "Bí quyết nào giúp cơ sở mới thu hút nhiều khách?", "khach-hang", "2,2 N"],
  ["SlI-Dj_UOA8", "Vì sao khách nhớ tiệm, còn tiệm lại quên khách?", "khach-hang", "1,7 N"],
  ["YWOUSsBkvts", "Mất khách âm thầm phải làm sao?", "khach-hang", "1,1 N"],
  ["knXL0GsSkcw", "Làm sao bán dịch vụ có lời, không lỗ?", "dong-tien", "3,5 N"],
  ["gbsLQeMM-xk", "Cách giữ dòng tiền luôn mượt cho cơ sở mới mở", "dong-tien", "1,8 N"],
  ["c1Za9oqI0rE", "Cơ sở mới nên ghi chú doanh thu ra sao?", "dong-tien", "1,8 N"],
  ["JvPS-uwpKIQ", "Vì sao nhiều cơ sở mới gãy dòng tiền rồi giải tán?", "dong-tien", "1,4 N"],
  ["HKDYTKSra_E", "Trung tâm mới mở có nên làm marketing ngay?", "marketing", "1,4 N"],
  ["8c-0tAae82c", "Marketing “Đúng – Đủ – Đều” cho xưởng xe, spa, gym", "marketing", "101"],
  ["SbDeYSONFm4", "Một người content có thật sự phải làm tất cả?", "marketing", "262"],
  ["ZlwMnhPUFQ4", "Điều tôi quan tâm không phải gói 8 triệu", "marketing", "271"],
].map(([id, title, topic, views]) => ({
  id,
  title,
  url: `https://www.youtube.com/shorts/${id}`,
  vertical: true,
  topic: topic as VideoTopic,
  views,
}));
