/**
 * One-off import: creates/updates the "Học viện Detailing Việt Nam" case
 * study in Sanity, uploading the client's real logo, a cover photo sourced
 * from chamsocxehoi.edu.vn (on-site brand: "AP Education"), and two
 * data-visualization charts, then writing a deep-dive on follower/reach
 * growth and new-student-lead volume sourced from the "fanpage Học viện đào
 * tạo" tracking sheet through August 2026. Also links out to the academy's
 * real Facebook, TikTok, YouTube and its Bắc Ninh branch on Google Maps so
 * readers can verify directly.
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

function imageBlock(asset, caption) {
  return {
    _type: "image",
    _key: key(),
    asset: { _type: "reference", _ref: asset._id },
    caption,
  };
}

const bodyVi = (charts) => [
  block("Bối cảnh", { style: "h3" }),
  block(
    "Học viện Detailing Việt Nam (thương hiệu AP Education trên chamsocxehoi.edu.vn) đào tạo nghề chăm sóc & nâng cấp ô tô — detailing, dán PPF, phim cách nhiệt, âm thanh xe hơi — theo mô hình “học thực chiến, làm thực tế” gắn liền với hệ thống AP Car Care do CEO Johnny Lộc Nguyễn sáng lập. Trí Đức Car Media bắt đầu quản lý fanpage từ đầu năm 2025.",
  ),
  block(
    "Tháng 10/2025, học viện mở thêm cơ sở tại Bắc Ninh — đánh dấu bước ngoặt Nam tiến ra Bắc của cả hệ sinh thái AP, và cũng là giai đoạn đội ngũ marketing bắt đầu dồn lực đẩy mạnh nội dung đa kênh (Fanpage + TikTok) để xây nhận diện tại thị trường mới.",
  ),

  block("Phễu marketing: khác với AP Car Care, học viện đo bằng lượt tiếp cận & lead tư vấn", { style: "h3" }),
  block(
    "Vì đào tạo là ngành có chu kỳ quyết định dài hơn dịch vụ chăm sóc xe, học viện chưa vận hành đủ dữ liệu MQL/SQL/doanh thu tự động như AP Car Care. Chỉ số marketing chính được theo dõi là: Lượt tiếp cận → Lượt tương tác nội dung → Học viên tiềm năng mới (lượt để lại thông tin tư vấn) — bước chuyển từ lead sang học viên chính thức do đội tuyển sinh trực tiếp quản lý.",
  ),
  imageBlock(charts.growth, "Follower và tổng lượt tiếp cận của Học viện Detailing Việt Nam, T1/2025 → T8/2026"),
  block("Follower Fanpage: 3.294 (T1/2025) → 15.317 (T8/2026) — gấp gần 4,7 lần kể từ khi bắt đầu hợp tác.", {
    listItem: "bullet",
  }),
  block(
    "Tổng lượt tiếp cận gần như đi ngang quanh 55.000–70.000/tháng suốt cuối 2025 đến đầu 2026, rồi bứt phá mạnh từ T5/2026 (294.795) đến T8/2026 (528.465) — gấp khoảng 67 lần so với T1/2026 (7.840), đúng giai đoạn đẩy mạnh TikTok song song Fanpage.",
    { listItem: "bullet" },
  ),
  block(
    "Riêng tháng 8/2026 so với tháng 7/2026: lượt tiếp cận tăng thêm 18,5%, cho thấy đà tăng trưởng vẫn tiếp diễn chứ không phải một đợt tăng đột biến rồi tắt.",
    { listItem: "bullet" },
  ),

  block("Học viên tiềm năng mới: đi qua một giai đoạn trầm lắng rồi bứt phá thật", { style: "h3" }),
  imageBlock(charts.leads, "Học viên tiềm năng mới mỗi tháng của Học viện Detailing Việt Nam, T1/2025 → T8/2026"),
  block(
    "Số liệu không đi lên một mạch: sau khi đạt đỉnh 330 lượt vào T6/2025, lượng học viên tiềm năng mới giảm dần và chạm đáy chỉ 4 lượt vào T1/2026 — giai đoạn giao mùa giữa chiến lược cũ và việc tái cấu trúc nội dung đa kênh.",
    { listItem: "bullet" },
  ),
  block(
    "Từ T2/2026, con số phục hồi và tăng đều đặn: 163 → 164 → 177 → 162 → 178 → 182 → 250 (T8/2026) — học viên tiềm năng mới tăng 37,4% chỉ trong tháng 8 so với tháng 7, và gấp hơn 12 lần so với T1/2025 (20 lượt).",
    { listItem: "bullet" },
  ),
  block(
    "Tổng lượt xem nội dung T8/2026 đạt 922.015 lượt với 1.627 lượt tương tác — phần lớn đến từ định dạng Reels ngắn giới thiệu quy trình detailing và hình ảnh học viên thực hành trên xe thật, đúng tinh thần “học thực chiến” của học viện.",
    { listItem: "bullet" },
  ),

  block("Định hướng tiếp theo", { style: "h3" }),
  block(
    "Giai đoạn tới tập trung chuyển đổi lượt tiếp cận khổng lồ thành học viên ghi danh thực tế: tối ưu kịch bản tư vấn tuyển sinh, xây dựng chuỗi nội dung “góc nhìn học viên” (before/after tay nghề) và case học viên tốt nghiệp có việc làm ngay tại hệ thống AP Car Care — đặc biệt tại cơ sở Bắc Ninh vừa mở và trong bối cảnh AP đang khảo sát mở học viện tại Đà Nẵng.",
  ),
  block(
    "Trí Đức Car Media hiện vẫn đang trực tiếp phụ trách toàn bộ hoạt động truyền thông của Học viện Detailing Việt Nam. Xem thêm hành trình xây dựng cả hệ sinh thái AP — từ AP Car Care đến AP Education — trong case study riêng về CEO Johnny Lộc Nguyễn.",
  ),
];

const bodyEn = (charts) => [
  block("Context", { style: "h3" }),
  block(
    "Vietnam Detailing Academy (on-site brand: AP Education, at chamsocxehoi.edu.vn) trains professional automotive care skills — detailing, PPF, window tint, car audio — under a hands-on “train on real cars” model tied to the AP Car Care network founded by CEO Johnny Loc Nguyen. Tri Duc Car Media took over the Fanpage in early 2025.",
  ),
  block(
    "In October 2025, the academy opened a second location in Bac Ninh — marking the AP ecosystem's first move north — and that's also when the marketing team began pushing multi-channel content (Fanpage + TikTok) harder to build awareness in the new market.",
  ),

  block("A different funnel from AP Car Care: reach and inquiry leads, not MQL/SQL", { style: "h3" }),
  block(
    "Because training has a longer decision cycle than a one-off car service, the academy doesn't yet run the same automated MQL/SQL/revenue tracking as AP Car Care. The core marketing metrics are: Reach → Content engagement → New prospective-student leads (inquiry submissions) — the step from lead to enrolled student is owned directly by the admissions team.",
  ),
  imageBlock(charts.growth, "Vietnam Detailing Academy's followers and total reach, Jan 2025 → Aug 2026"),
  block("Page followers: 3,294 (Jan 2025) → 15,317 (Aug 2026) — nearly 4.7x since the partnership began.", {
    listItem: "bullet",
  }),
  block(
    "Total reach stayed roughly flat around 55,000–70,000/month through late 2025 into early 2026, then broke out sharply from May 2026 (294,795) to August 2026 (528,465) — about 67x versus January 2026 (7,840), right as TikTok ramped up alongside the Fanpage.",
    { listItem: "bullet" },
  ),
  block(
    "August 2026 vs. July 2026 alone: reach grew a further 18.5%, showing this is sustained growth, not a one-off spike that faded.",
    { listItem: "bullet" },
  ),

  block("New student leads: a real dip, then a real recovery", { style: "h3" }),
  imageBlock(charts.leads, "Vietnam Detailing Academy's new prospective-student leads per month, Jan 2025 → Aug 2026"),
  block(
    "The numbers didn't climb in a straight line: after peaking at 330 in Jun 2025, new leads declined steadily and bottomed out at just 4 in Jan 2026 — the transition period between the old strategy and rebuilding multi-channel content.",
    { listItem: "bullet" },
  ),
  block(
    "From Feb 2026 onward, the number recovered and grew steadily: 163 → 164 → 177 → 162 → 178 → 182 → 250 (Aug 2026) — new leads grew 37.4% in August alone versus July, and over 12x versus Jan 2025 (20).",
    { listItem: "bullet" },
  ),
  block(
    "August 2026 total content views hit 922,015 with 1,627 interactions — mostly driven by short-form Reels showcasing the detailing process and students training on real cars, true to the academy's hands-on ethos.",
    { listItem: "bullet" },
  ),

  block("What's next", { style: "h3" }),
  block(
    "The next phase focuses on converting this massive reach into actual enrollments: refining the admissions-inquiry script, building a “student's-eye view” content series (skill before/after), and graduate success stories placed directly within the AP Car Care network — especially at the newly opened Bac Ninh location, while AP explores opening an academy in Da Nang.",
  ),
  block(
    "Tri Duc Car Media still directly runs Vietnam Detailing Academy's full media operation today. See the dedicated case study on CEO Johnny Loc Nguyen for the full story of building the AP ecosystem, from AP Car Care to AP Education.",
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

async function uploadChart(filename) {
  const filePath = path.join(__dirname, "assets", "hoc-vien-detailing", filename);
  const buffer = await readFile(filePath);
  return client.assets.upload("image", buffer, { filename });
}

const [coverImage, clientLogo, chartGrowth, chartLeads] = await Promise.all([
  uploadImage(
    "cover.webp",
    "Học viên thực hành detailing trên xe thật tại AP Education",
    "Students practicing detailing on real cars at AP Education",
  ),
  uploadImage("logo.png", "Logo Học viện Detailing Việt Nam (AP Education)", "Vietnam Detailing Academy (AP Education) logo"),
  uploadChart("chart-growth.png"),
  uploadChart("chart-leads.png"),
]);

const charts = { growth: chartGrowth, leads: chartLeads };

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
    vi: "Đồng hành cùng Học viện Detailing Việt Nam (AP Education) từ đầu 2025: follower Fanpage tăng gần 4,7 lần, lượt tiếp cận tăng gấp 67 lần sau khi mở rộng đa kênh Fanpage + TikTok, và học viên tiềm năng mới phục hồi từ đáy 4 lượt (T1/2026) lên 250 lượt (T8/2026).",
    en: "Partnering with Vietnam Detailing Academy (AP Education) since early 2025: Fanpage followers grew nearly 4.7x, reach grew 67x after expanding to multi-channel Fanpage + TikTok, and new student leads recovered from a low of 4 (Jan 2026) to 250 (Aug 2026).",
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
  links: [
    { _key: key(), label: { vi: "Website Học viện", en: "Academy website" }, url: "https://chamsocxehoi.edu.vn" },
    { _key: key(), label: { vi: "Fanpage Facebook", en: "Facebook Page" }, url: "https://www.facebook.com/chamsocxehoi.edu.vn" },
    { _key: key(), label: { vi: "TikTok", en: "TikTok" }, url: "https://www.tiktok.com/@hocviendetailingvn" },
    { _key: key(), label: { vi: "YouTube", en: "YouTube" }, url: "https://www.youtube.com/@Hocviendetailingvn" },
    {
      _key: key(),
      label: { vi: "Google Maps — Cơ sở Bắc Ninh", en: "Google Maps — Bac Ninh campus" },
      url: "https://www.google.com/maps/search/?api=1&query=AP+Car+Care+92+Ho%C3%A0ng+Hoa+Th%C3%A1m+Ph%C6%B0%E1%BB%9Dng+V%C3%B5+C%C6%B0%E1%BB%9Dng+B%E1%BA%AFc+Ninh",
    },
  ],
  body: { vi: bodyVi(charts), en: bodyEn(charts) },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
