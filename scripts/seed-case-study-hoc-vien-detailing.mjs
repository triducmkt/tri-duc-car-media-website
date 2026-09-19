/**
 * One-off import: creates the "Học viện Detailing Việt Nam" case study in
 * Sanity, uploading the client's real logo and a cover photo sourced from
 * chamsocxehoi.edu.vn (on-site brand: "AP Education"), with results through
 * August 2026 from the "fanpage Học viện đào tạo" tracking sheet.
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-hoc-vien-detailing.mjs
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
    "Học viện Detailing Việt Nam (thương hiệu AP Education trên chamsocxehoi.edu.vn) đào tạo nghề chăm sóc & nâng cấp ô tô — detailing, dán PPF, phim cách nhiệt, âm thanh xe hơi — theo mô hình “học thực chiến, làm thực tế” gắn liền với hệ thống AP Car Care. Trí Đức Car Media bắt đầu quản lý fanpage từ đầu năm 2025 và mở rộng sang đa kênh (Fanpage + TikTok) từ đầu năm 2026.",
  ),
  block("Tăng trưởng qua từng giai đoạn (T1/2025 → T1/2026 → T8/2026)", { style: "h3" }),
  block("Follower Fanpage: 3.294 → 3.630 → 15.317 — gấp gần 4,7 lần kể từ khi bắt đầu hợp tác.", {
    listItem: "bullet",
  }),
  block(
    "Tổng lượt tiếp cận: từ 7.840 (T1/2026) vọt lên 528.465 (T8/2026) — gấp khoảng 67 lần chỉ trong 8 tháng đẩy mạnh đa kênh.",
    { listItem: "bullet" },
  ),
  block(
    "Học viên tiềm năng mới (lượt tư vấn/đăng ký mới): tăng từ 20 (T1/2025) lên 250 (T8/2026) — gấp hơn 12 lần.",
    { listItem: "bullet" },
  ),
  block(
    "Riêng tháng 8/2026 so với tháng 7/2026: lượt tiếp cận tăng thêm 18,5%, học viên tiềm năng mới tăng 37,4% (từ 182 lên 250), cho thấy đà tăng trưởng vẫn đang tiếp tục chứ chưa chững lại.",
    { listItem: "bullet" },
  ),
  block(
    "Tổng lượt xem nội dung T8/2026 đạt 922.015 lượt, với 1.627 lượt tương tác — phần lớn đến từ định dạng Reels ngắn giới thiệu quy trình detailing và hình ảnh học viên thực hành trên xe thật.",
    { listItem: "bullet" },
  ),
  block("Định hướng tiếp theo", { style: "h3" }),
  block(
    "Giai đoạn tới tập trung chuyển đổi lượt tiếp cận khổng lồ thành học viên ghi danh thực tế: tối ưu kịch bản tư vấn tuyển sinh, xây dựng chuỗi nội dung “góc nhìn học viên” (before/after tay nghề) và case học viên tốt nghiệp có việc làm ngay tại hệ thống AP Car Care. Trí Đức Car Media hiện vẫn đang trực tiếp phụ trách toàn bộ hoạt động truyền thông của Học viện Detailing Việt Nam.",
  ),
];

const bodyEn = [
  block("Context", { style: "h3" }),
  block(
    "Vietnam Detailing Academy (on-site brand: AP Education, at chamsocxehoi.edu.vn) trains professional automotive care skills — detailing, PPF, window tint, car audio — under a hands-on “train on real cars” model tied to the AP Car Care service network. Tri Duc Car Media took over the Fanpage in early 2025 and expanded into multi-channel (Fanpage + TikTok) from early 2026.",
  ),
  block("Growth by phase (Jan 2025 → Jan 2026 → Aug 2026)", { style: "h3" }),
  block("Page followers: 3,294 → 3,630 → 15,317 — nearly 4.7x since the partnership began.", {
    listItem: "bullet",
  }),
  block(
    "Total reach: from 7,840 (Jan 2026) to 528,465 (Aug 2026) — roughly a 67x jump in just 8 months of multi-channel push.",
    { listItem: "bullet" },
  ),
  block(
    "New prospective students (inquiries/leads): grew from 20 (Jan 2025) to 250 (Aug 2026) — over 12x.",
    { listItem: "bullet" },
  ),
  block(
    "August 2026 vs. July 2026 alone: reach grew a further 18.5%, and new leads grew 37.4% (from 182 to 250) — growth is still accelerating, not plateauing.",
    { listItem: "bullet" },
  ),
  block(
    "August 2026 total content views hit 922,015 with 1,627 interactions — mostly driven by short-form Reels showcasing the detailing process and students training on real cars.",
    { listItem: "bullet" },
  ),
  block("What's next", { style: "h3" }),
  block(
    "The next phase focuses on converting this reach into actual enrollments: refining the admissions-inquiry script, building a “student's-eye view” content series (skill before/after) and graduate success stories placed directly within the AP Car Care network. Tri Duc Car Media still directly runs Vietnam Detailing Academy's full media operation today.",
  ),
];

async function uploadImage(filename, altVi, altEn) {
  const filePath = path.join(__dirname, "assets", "hoc-vien-detailing", filename);
  const buffer = await readFile(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: { vi: altVi, en: altEn },
  };
}

const [coverImage, clientLogo] = await Promise.all([
  uploadImage(
    "cover.webp",
    "Học viên thực hành detailing trên xe thật tại AP Education",
    "Students practicing detailing on real cars at AP Education",
  ),
  uploadImage("logo.png", "Logo Học viện Detailing Việt Nam (AP Education)", "Vietnam Detailing Academy (AP Education) logo"),
]);

const doc = {
  _type: "caseStudy",
  _id: "case-study-hoc-vien-detailing-viet-nam",
  title: {
    vi: "Học viện Detailing Việt Nam — Lượt tiếp cận tăng gấp 67 lần, học viên tiềm năng tăng hơn 12 lần trong chưa đầy 2 năm",
    en: "Vietnam Detailing Academy — Reach Up 67x, New Student Leads Up 12x in Under Two Years",
  },
  slug: { _type: "slug", current: "hoc-vien-detailing-viet-nam" },
  clientName: "Học viện Detailing Việt Nam",
  industry: {
    vi: "Đào tạo nghề Chăm sóc & Detailing ô tô",
    en: "Automotive Detailing & Car Care Training",
  },
  summary: {
    vi: "Đồng hành cùng Học viện Detailing Việt Nam (AP Education) từ đầu 2025: follower Fanpage tăng gần 4,7 lần, lượt tiếp cận tăng gấp 67 lần và học viên tiềm năng mới tăng hơn 12 lần sau khi mở rộng đa kênh Fanpage + TikTok.",
    en: "Partnering with Vietnam Detailing Academy (AP Education) since early 2025: Fanpage followers grew nearly 4.7x, reach grew 67x, and new student leads grew over 12x after expanding to multi-channel Fanpage + TikTok.",
  },
  isOngoing: true,
  dataAsOf: "08/2026",
  stats: [
    {
      _key: key(),
      label: { vi: "Follower Fanpage", en: "Page followers" },
      value: "15.317",
      note: { vi: "+365% so với T1/2025", en: "+365% vs. Jan 2025" },
    },
    {
      _key: key(),
      label: { vi: "Lượt tiếp cận T8/2026", en: "Reach in Aug 2026" },
      value: "528.465",
      note: { vi: "Gấp ~67 lần so với T1/2026", en: "~67x vs. Jan 2026" },
    },
    {
      _key: key(),
      label: { vi: "Học viên tiềm năng mới", en: "New student leads" },
      value: "250",
      note: { vi: "+37,4% so với T7/2026", en: "+37.4% vs. Jul 2026" },
    },
    {
      _key: key(),
      label: { vi: "Lượt xem nội dung T8", en: "Aug content views" },
      value: "922.015",
      note: { vi: "1.627 lượt tương tác", en: "1,627 interactions" },
    },
  ],
  body: { vi: bodyVi, en: bodyEn },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
