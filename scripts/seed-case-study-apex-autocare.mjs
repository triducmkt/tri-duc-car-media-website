/**
 * One-off import: creates the "Apex Autocare" case study in Sanity,
 * uploading the client's real logo and storefront photo from
 * scripts/assets/apex-autocare/.
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-apex-autocare.mjs
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
    "Apex Autocare là trung tâm chăm sóc & nâng cấp ô tô chuyên nghiệp tại Rạch Giá, Kiên Giang. Trí Đức Car Media bắt đầu đồng hành từ tháng 07/2026 với gói Marketing PRO: nội dung Fanpage, video ngắn, thiết kế hình ảnh và tư vấn truyền thông định kỳ.",
  ),
  block("Kết quả sau 2 tháng triển khai (T7 → T8/2026)", { style: "h3" }),
  block("Facebook: lượt xem tăng từ 2.333 lên 9.084 (+289%).", { listItem: "bullet" }),
  block("Lượt xem từ 3 giây trở lên tăng từ 36 lên 356 (+889%) — nội dung giữ chân người xem tốt hơn hẳn.", {
    listItem: "bullet",
  }),
  block("TikTok: lượt xem video tăng từ 534 lên 1.000+ (+87,5%), lượt thích tăng từ 3 lên 23 (+666,7%).", {
    listItem: "bullet",
  }),
  block(
    "Khối lượng công việc tháng 8 đều hoàn thành và vượt kế hoạch gói PRO: 13/12 bài viết, 3/3 video ngắn, 5/1 thiết kế hình ảnh.",
    { listItem: "bullet" },
  ),
  block(
    "74,8% lượt truy cập TikTok đến từ mục Đề xuất (For You) — dấu hiệu thuật toán đã bắt đầu phân phối nội dung tốt tới người xem mới ngoài tệp follow sẵn có.",
    { listItem: "bullet" },
  ),
  block(
    "Các từ khoá tìm kiếm thương hiệu bắt đầu xuất hiện trên TikTok: “xe ô tô độ ở Rạch Giá”, “rửa xe ở Rạch Giá”, “phủ gầm ô tô” — cho thấy khách hàng địa phương đã bắt đầu chủ động tìm đến Apex Autocare thay vì chỉ tình cờ thấy quảng cáo.",
    { listItem: "bullet" },
  ),
  block("Định hướng tiếp theo", { style: "h3" }),
  block(
    "Hai tháng đầu tập trung xây nền nhận diện thương hiệu tại Rạch Giá. Giai đoạn tiếp theo chuyển trọng tâm sang chuyển đổi: tối ưu lời kêu gọi hành động (CTA) trong video, xây dựng chuỗi nội dung before/after và review khách hàng thực tế, đồng thời mở rộng khai thác tìm kiếm địa phương (local search).",
  ),
];

const bodyEn = [
  block("Context", { style: "h3" }),
  block(
    "Apex Autocare is a professional car care and detailing center in Rach Gia, Kien Giang. Tri Duc Car Media began the partnership in July 2026 with the Marketing PRO package: Facebook content, short-form video, visual design and ongoing communications advisory.",
  ),
  block("Results after 2 months (Jul → Aug 2026)", { style: "h3" }),
  block("Facebook views grew from 2,333 to 9,084 (+289%).", { listItem: "bullet" }),
  block("Views held for 3+ seconds grew from 36 to 356 (+889%) — content is holding attention far better.", {
    listItem: "bullet",
  }),
  block("TikTok video views grew from 534 to 1,000+ (+87.5%), likes grew from 3 to 23 (+666.7%).", {
    listItem: "bullet",
  }),
  block(
    "August's PRO-package workload was completed and exceeded target across the board: 13/12 posts, 3/3 short videos, 5/1 visual designs.",
    { listItem: "bullet" },
  ),
  block(
    "74.8% of TikTok traffic came from the For You feed — a sign the algorithm has started distributing content well beyond Apex's existing follower base.",
    { listItem: "bullet" },
  ),
  block(
    "Branded search terms started appearing on TikTok: “xe ô tô độ ở Rạch Giá”, “rửa xe ở Rạch Giá”, “phủ gầm ô tô” — local customers are beginning to actively search for Apex Autocare, not just stumble on an ad.",
    { listItem: "bullet" },
  ),
  block("What's next", { style: "h3" }),
  block(
    "The first two months focused on building brand awareness in Rach Gia. The next phase shifts toward conversion: stronger calls to action in video, a steady before/after and customer-review content series, and deeper local search coverage.",
  ),
];

async function uploadImage(filename, altVi, altEn) {
  const filePath = path.join(__dirname, "assets", "apex-autocare", filename);
  const buffer = await readFile(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: { vi: altVi, en: altEn },
  };
}

const [coverImage, clientLogo] = await Promise.all([
  uploadImage("storefront.webp", "Cửa hàng Apex Autocare tại Rạch Giá", "The Apex Autocare storefront in Rach Gia"),
  uploadImage("logo.webp", "Logo Apex Autocare", "Apex Autocare logo"),
]);

const doc = {
  _type: "caseStudy",
  _id: "case-study-apex-autocare",
  title: {
    vi: "Apex Autocare — Xây nền nhận diện thương hiệu tại Rạch Giá chỉ sau 2 tháng",
    en: "Apex Autocare — Building Local Brand Awareness in Rach Gia in Just 2 Months",
  },
  slug: { _type: "slug", current: "apex-autocare" },
  clientName: "Apex Autocare",
  industry: {
    vi: "Chăm sóc & Nâng cấp ô tô",
    en: "Car Care & Upgrades",
  },
  summary: {
    vi: "Đồng hành cùng Apex Autocare (Rạch Giá, Kiên Giang) từ 07/2026: lượt xem Facebook tăng 289%, TikTok bắt đầu được thuật toán phân phối tới khách hàng mới, và từ khoá thương hiệu bắt đầu xuất hiện trong tìm kiếm địa phương.",
    en: "Partnering with Apex Autocare (Rach Gia, Kien Giang) since July 2026: Facebook views up 289%, TikTok content starting to reach new audiences via the algorithm, and branded search terms beginning to appear locally.",
  },
  body: { vi: bodyVi, en: bodyEn },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
