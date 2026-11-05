/**
 * Month-by-month numbers behind each case study, for the 3D growth skyline
 * (components/case-studies/GrowthSkyline.tsx). Every value is copied from the
 * case study text itself (scripts/seed-case-study-*.mjs, i.e. the monthly
 * reports sent to the client) — never estimated. A case without a series
 * simply shows no skyline. Add a new case: add its slug here.
 */
export type GrowthPoint = { vi: string; en: string; value: number };
export type GrowthSeries = {
  key: string;
  vi: string;
  en: string;
  points: GrowthPoint[];
  /** Show "×N" from first to last point (only where the first month is a fair baseline). */
  multiplier?: boolean;
  /** Context the reader needs to read the chart honestly. */
  note?: { vi: string; en: string };
};

const m = (vi: string, en: string, value: number): GrowthPoint => ({ vi, en, value });

export const CASE_GROWTH: Record<string, GrowthSeries[]> = {
  "khang-vu-auto-care": [
    {
      key: "fb",
      vi: "Lượt xem Facebook",
      en: "Facebook views",
      multiplier: true,
      points: [m("T6/2026", "Jun 2026", 292), m("T7/2026", "Jul 2026", 1722), m("T8/2026", "Aug 2026", 20115)],
      note: { vi: "T6 là tháng trước khi bắt đầu đồng hành.", en: "June is the month before we started." },
    },
    {
      key: "tiktok",
      vi: "Lượt xem video TikTok",
      en: "TikTok video views",
      points: [m("T6/2026", "Jun 2026", 1300), m("T7/2026", "Jul 2026", 2900), m("T8/2026", "Aug 2026", 4800)],
    },
    {
      key: "youtube",
      vi: "Lượt xem YouTube",
      en: "YouTube views",
      points: [m("T7/2026", "Jul 2026", 2134), m("T8/2026", "Aug 2026", 3840)],
      note: { vi: "Kênh YouTube được tạo trong tháng 7.", en: "The YouTube channel was created in July." },
    },
  ],
  "apex-autocare": [
    {
      key: "fb",
      vi: "Lượt xem Facebook",
      en: "Facebook views",
      points: [m("T7/2026", "Jul 2026", 2333), m("T8/2026", "Aug 2026", 9084)],
    },
    {
      key: "fb3s",
      vi: "Lượt xem từ 3 giây trở lên",
      en: "3-second+ views",
      points: [m("T7/2026", "Jul 2026", 36), m("T8/2026", "Aug 2026", 356)],
    },
  ],
  "hoc-vien-detailing-viet-nam": [
    {
      key: "leads",
      vi: "Học viên tiềm năng mới mỗi tháng",
      en: "New prospective students per month",
      points: [
        m("T1/2026", "Jan 2026", 4),
        m("T2/2026", "Feb 2026", 163),
        m("T3/2026", "Mar 2026", 164),
        m("T4/2026", "Apr 2026", 177),
        m("T5/2026", "May 2026", 162),
        m("T6/2026", "Jun 2026", 178),
        m("T7/2026", "Jul 2026", 182),
        m("T8/2026", "Aug 2026", 250),
      ],
      note: {
        vi: "T1/2026 là đáy của giai đoạn tái cấu trúc nội dung; đỉnh cũ là 330 (T6/2025).",
        en: "Jan 2026 was the low point of the content restructure; the earlier peak was 330 (Jun 2025).",
      },
    },
  ],
  "ap-car-care": [
    {
      key: "followers",
      vi: "Follower Fanpage",
      en: "Page followers",
      points: [
        m("T1/2024", "Jan 2024", 12465),
        m("T3/2026", "Mar 2026", 16428),
        m("T6/2026", "Jun 2026", 30326),
        m("T8/2026", "Aug 2026", 30464),
      ],
      note: { vi: "Các mốc cách nhau không đều, lấy theo bài viết.", en: "Milestones are unevenly spaced, as in the article." },
    },
  ],
};
