/**
 * One-off import: creates/updates the "Khang Vu Auto Care" case study in
 * Sanity, uploading the client's real logo and a cover photo sourced from
 * khangvuautocare.vn, with results through August 2026.
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-khang-vu-auto-care.mjs
 */
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@sanity/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_TOKEN } = process.env;

if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error(
    "Missing NEXT_PUBLIC_SANITY_PROJECT_ID or SANITY_API_TOKEN. Set them in .env.local first (see .env.example).",
  );
  process.exit(1);
}

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  apiVersion: "2024-06-01",
  token: SANITY_API_TOKEN,
  useCdn: false,
});

let keyCounter = 0;
function key() {
  keyCounter += 1;
  return `k${keyCounter}${Math.random().toString(36).slice(2, 8)}`;
}

function block(text, { style = "normal", listItem, level, strong = false } = {}) {
  return {
    _type: "block",
    _key: key(),
    style,
    listItem,
    level,
    markDefs: [],
    children: [{ _type: "span", _key: key(), text, marks: strong ? ["strong"] : [] }],
  };
}

const bodyVi = [
  block("Bối cảnh", { style: "h3" }),
  block(
    "Khang Vũ Auto Care (Bình Dương) bắt đầu hợp tác với Trí Đức Car Media từ tháng 07/2026 — tháng đầu tiên triển khai đồng bộ cả ba nền tảng Facebook, TikTok và YouTube trong cùng một gói Marketing PRO.",
  ),
  block("Tăng trưởng qua từng tháng (T6 → T7 → T8/2026)", { style: "h3" }),
  block("Lượt xem Facebook: 292 → 1.722 (+490%) → 20.115 (+1.068% so với T7).", { listItem: "bullet" }),
  block("Thời gian xem Facebook: 11 phút 17 giây → 44 phút 30 giây → 1 ngày 1 giờ.", { listItem: "bullet" }),
  block("Lượt xem video TikTok: 1,3K → 2,9K → 4,8K, lượt thích tăng từ 16 lên 75 qua 2 tháng.", {
    listItem: "bullet",
  }),
  block(
    "YouTube khởi tạo kênh trong tháng 7: đạt 2.134 lượt xem, sang tháng 8 tăng lên 3.840 lượt xem và có thêm người đăng ký mới.",
    { listItem: "bullet" },
  ),
  block(
    "Tháng 8, Reels chiếm 89,1% tổng lượt xem Facebook, và 97,6% lượt xem đến từ người chưa từng theo dõi trang — nội dung đang tiếp cận đúng nhóm khách hàng mới thay vì chỉ vòng quanh khách cũ.",
    { listItem: "bullet" },
  ),
  block(
    "Khối lượng công việc tháng 8 hoàn thành đúng và vượt kế hoạch gói PRO: 12/12 bài viết, 4/4 video ngắn, 6/1 thiết kế hình ảnh.",
    { listItem: "bullet" },
  ),
  block(
    "Các từ khoá thương hiệu bắt đầu xuất hiện trong tìm kiếm TikTok: “Khang Vũ Auto Care”, “Khang Vũ ô tô”, “rửa xe hơi Bình Dương”.",
    { listItem: "bullet" },
  ),
  block("Định hướng tiếp theo", { style: "h3" }),
  block(
    "Tháng 7 là giai đoạn xây nền, tháng 8 đã cho thấy khả năng mở rộng độ phủ và tiếp cận khách hàng mới. Trọng tâm tháng 9 chuyển sang tối ưu chuyển đổi: tăng lời kêu gọi follow/inbox, xây dựng chuỗi nội dung before/after, video review khách hàng thực tế và mở rộng khai thác tìm kiếm địa phương quanh khu vực Bình Dương. Trí Đức Car Media hiện vẫn đang trực tiếp phụ trách toàn bộ hoạt động truyền thông của Khang Vũ Auto Care.",
  ),
];

const bodyEn = [
  block("Context", { style: "h3" }),
  block(
    "Khang Vu Auto Care (Binh Duong) began working with Tri Duc Car Media in July 2026 — the first month running Facebook, TikTok and YouTube together under one Marketing PRO package.",
  ),
  block("Month-over-month growth (Jun → Jul → Aug 2026)", { style: "h3" }),
  block("Facebook views: 292 → 1,722 (+490%) → 20,115 (+1,068% vs. July).", { listItem: "bullet" }),
  block("Facebook watch time: 11m17s → 44m30s → 1 day 1 hour.", { listItem: "bullet" }),
  block("TikTok video views: 1.3K → 2.9K → 4.8K, with likes growing from 16 to 75 over two months.", {
    listItem: "bullet",
  }),
  block(
    "YouTube launched in July with 2,134 views; by August that grew to 3,840 views plus new subscribers.",
    { listItem: "bullet" },
  ),
  block(
    "In August, Reels drove 89.1% of all Facebook views, and 97.6% of views came from people who weren't yet following the page — content is reaching genuinely new audiences, not just circling existing followers.",
    { listItem: "bullet" },
  ),
  block(
    "August's PRO-package workload met or exceeded every target: 12/12 posts, 4/4 short videos, 6/1 visual designs.",
    { listItem: "bullet" },
  ),
  block(
    "Branded search terms started showing up on TikTok: “Khang Vũ Auto Care”, “Khang Vũ ô tô”, “rửa xe hơi Bình Dương”.",
    { listItem: "bullet" },
  ),
  block("What's next", { style: "h3" }),
  block(
    "If July was about building the foundation, August showed the ability to expand reach and win new customers. September shifts focus to conversion: stronger follow/inbox calls to action, a before/after and customer-review content series, and deeper local search coverage around Binh Duong. Tri Duc Car Media still directly runs Khang Vu Auto Care's full media operation today.",
  ),
];

async function uploadImage(filename, altVi, altEn) {
  const filePath = path.join(__dirname, "assets", "khang-vu-auto-care", filename);
  const buffer = await readFile(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: { vi: altVi, en: altEn },
  };
}

const [coverImage, clientLogo] = await Promise.all([
  uploadImage("cover.png", "Khang Vũ Detailing Center về đêm", "Khang Vu Detailing Center storefront at night"),
  uploadImage("logo.jpeg", "Logo Khang Vũ Auto Care", "Khang Vu Auto Care logo"),
]);

const doc = {
  _type: "caseStudy",
  _id: "case-study-khang-vu-auto-care",
  title: {
    vi: "Khang Vũ Auto Care — Xây nền tảng truyền thông đa kênh ngay từ tháng đầu triển khai",
    en: "Khang Vu Auto Care — Building a Multi-Channel Media Foundation From Month One",
  },
  slug: { _type: "slug", current: "khang-vu-auto-care" },
  clientName: "Khang Vũ Auto Care",
  industry: {
    vi: "Chăm sóc & Rửa xe ô tô",
    en: "Car Care & Wash",
  },
  summary: {
    vi: "Đồng hành cùng Khang Vũ Auto Care (Bình Dương) từ 07/2026: lượt xem Facebook tăng từ 292 lên hơn 20.000 chỉ sau 2 tháng, đồng bộ triển khai Facebook, TikTok và YouTube ngay từ tháng đầu tiên.",
    en: "Partnering with Khang Vu Auto Care (Binh Duong) since July 2026: Facebook views grew from 292 to over 20,000 in just 2 months, running Facebook, TikTok and YouTube together from month one.",
  },
  isOngoing: true,
  dataAsOf: "08/2026",
  stats: [
    {
      _key: key(),
      label: { vi: "Lượt xem Facebook", en: "Facebook views" },
      value: "20.115",
      note: { vi: "+1.068% so với T7/2026", en: "+1,068% vs. Jul 2026" },
    },
    {
      _key: key(),
      label: { vi: "Lượt xem video TikTok", en: "TikTok video views" },
      value: "4,8K",
      note: { vi: "+64,3% so với T7/2026", en: "+64.3% vs. Jul 2026" },
    },
    {
      _key: key(),
      label: { vi: "Lượt xem YouTube", en: "YouTube views" },
      value: "3.840",
      note: { vi: "+80% so với T7/2026", en: "+80% vs. Jul 2026" },
    },
    {
      _key: key(),
      label: { vi: "Khối lượng nội dung T8", en: "Aug content output" },
      value: "12/12",
      note: { vi: "Bài viết hoàn thành đúng kế hoạch PRO", en: "Posts delivered on PRO plan target" },
    },
  ],
  body: { vi: bodyVi, en: bodyEn },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
