/**
 * One-off import: creates the "Johnny Lộc Nguyễn — Hệ sinh thái AP" case
 * study in Sanity. This one is different from the others: it isn't a
 * monthly marketing report, it's the founder story of how Tri Duc Car Media
 * has partnered with CEO Johnny Loc Nguyen since 2023 — freeing him from
 * doing marketing execution himself so he could focus on leading the whole
 * AP ecosystem (AP Car Care, AP Market, AP Education, AP Service, AP Store)
 * and expanding it nationwide.
 *
 * Facts are sourced from apcarcare.vn's own "Về chúng tôi" pages (Giới
 * thiệu AP, Tầm nhìn 2030, CEO Johnny Lộc Nguyễn, Cơ cấu tổ chức, Văn hoá
 * doanh nghiệp) plus the real growth data already reported in the AP Car
 * Care and Vietnam Detailing Academy case studies, including the honest
 * dips (not just the highlights).
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-johnny-ap-ecosystem.mjs
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

const bodyVi = (imgs) => [
  block("Người đứng sau hệ sinh thái AP", { style: "h3" }),
  block(
    "Nguyễn Phước Lộc — được biết đến nhiều hơn với tên gọi Johnny Lộc Nguyễn — là kỹ sư ô tô tốt nghiệp Đại học Bách Khoa TP.HCM, khởi nghiệp từ một trung tâm chăm sóc xe nhỏ tại Đồng Nai vào năm 2012. Sau hơn một thập kỷ, anh đã xây dựng nên AP: một hệ sinh thái ô tô toàn diện gồm 5 mảnh ghép — AP Car Care (chăm sóc & detailing), AP Market (thương mại điện tử phụ kiện), AP Education (đào tạo nghề — chính là Học viện Detailing Việt Nam), AP Service (bảo dưỡng, sửa chữa) và AP Store (mua bán xe).",
  ),
  imageBlock(imgs.ecosystem, "Hệ sinh thái ô tô toàn diện AP — 5 mảnh ghép xoay quanh một chiếc xe (nguồn: apcarcare.vn)"),
  block(
    "Trí Đức Car Media bắt đầu đồng hành cùng anh Johnny từ năm 2023, đúng giai đoạn AP hoàn thiện mảnh ghép cuối (AP Store) và chuẩn hoá lại toàn bộ hệ thống thành AP Corporation. Đây không phải một hợp đồng dịch vụ ngắn hạn, mà là một mối quan hệ tư vấn — đồng hành xuyên suốt nhiều năm, đi qua cả những giai đoạn thuận lợi lẫn khó khăn.",
  ),

  block("“Giải phóng” một nhà sáng lập khỏi việc không thuộc vai trò của mình", { style: "h3" }),
  block(
    "Như phần lớn founder của các doanh nghiệp vừa và nhỏ đang tăng trưởng nhanh, giai đoạn đầu anh Johnny từng phải kiêm nhiệm rất nhiều việc lẽ ra thuộc về một bộ phận chuyên trách: tự lên ý tưởng nội dung, tự chỉnh sửa hình ảnh, tự theo dõi và trả lời tin nhắn trên fanpage, thậm chí tự mày mò chỉnh sửa website — bên cạnh vai trò điều hành toàn bộ hệ thống nhiều chi nhánh, nhiều mảng kinh doanh.",
  ),
  block(
    "Theo đúng cơ cấu tổ chức mà AP Corporation công bố, vị trí “CMO — Giám đốc Marketing” (phụ trách truyền thông, nội dung, quảng cáo, thiết kế) là một trong 5 khối chức năng chính dưới CEO, ngang hàng với COO, CFO, CHRO và CIO. Vai trò của Trí Đức Car Media trong suốt hành trình này chính là đảm nhiệm trọn vẹn khối CMO đó — từ chiến lược nội dung, sản xuất hình ảnh/video, đến vận hành quảng cáo và báo cáo số liệu hàng tháng — để anh Johnny không còn phải tự làm, mà có thể lùi lại một bước để nhìn toàn cục.",
  ),
  block(
    "Khi không còn phải tự tay thiết kế từng banner hay trực page mỗi tối, thời gian và năng lượng của một nhà sáng lập được trả lại đúng chỗ: xây chiến lược, đào tạo đội ngũ, phát triển hệ sinh thái, và quan trọng nhất — biết rõ việc gì nên buông, việc gì nên giữ.",
  ),

  block("Không phải hành trình chỉ toàn thành công", { style: "h3" }),
  block(
    "Một case study trung thực thì không chỉ kể phần đẹp. Trong suốt quá trình đồng hành, có những giai đoạn số liệu đi xuống rõ rệt trước khi bật lên trở lại — và chính những giai đoạn đó mới là lúc việc tư vấn, đề xuất, chỉnh sửa chiến lược giữa hai bên diễn ra nhiều nhất.",
  ),
  block(
    "Ở Học viện Detailing Việt Nam, lượng học viên tiềm năng mới từng đạt đỉnh 330 lượt/tháng (T6/2025) rồi giảm liên tục, chạm đáy chỉ 4 lượt vào T1/2026 — gần như về 0. Thay vì giữ nguyên cách làm cũ, đội ngũ cùng anh Johnny quyết định tái cấu trúc nội dung, mở rộng sang TikTok, và kiên trì thực hiện đều đặn suốt nhiều tháng cho đến khi con số phục hồi lên 250 lượt vào T8/2026.",
    { listItem: "bullet" },
  ),
  block(
    "Ở AP Car Care, ngay cả trong giai đoạn tăng trưởng tốt nhất, doanh thu tháng 8/2026 vẫn giảm khoảng 28% so với tháng 7/2026 (từ 1,32 tỷ xuống 948 triệu đồng) — một lời nhắc rằng tăng trưởng thực tế không phải một đường thẳng đi lên, mà là quá trình liên tục đo lường, phát hiện vấn đề và điều chỉnh.",
    { listItem: "bullet" },
  ),
  block(
    "Sự kiên trì bám số liệu thay vì chỉ tin vào cảm tính — kể cả khi số liệu không đẹp — là điều giữ cho mối quan hệ tư vấn này duy trì được hơn 2 năm, thay vì dừng lại sau vài tháng đầu khó khăn.",
    { listItem: "bullet" },
  ),

  block("Biz development: Nam tiến, Bắc tiến, và sắp tới là miền Trung", { style: "h3" }),
  imageBlock(imgs.timeline, "Hành trình xây dựng hệ sinh thái AP, 2012 → 2030"),
  block(
    "Tháng 10/2025, AP Education chính thức mở cơ sở đào tạo tại Bắc Ninh — bước đi đầu tiên đưa hệ sinh thái AP ra khỏi TP.HCM, có thể kiểm chứng trực tiếp trên Google Maps (xem liên kết bên dưới). Đây cũng là giai đoạn đội ngũ marketing dồn lực xây dựng lại nhận diện thương hiệu gần như từ đầu tại một thị trường hoàn toàn mới.",
    { listItem: "bullet" },
  ),
  block(
    "Bước sang năm 2026, anh Johnny tiếp tục hành trình biz development bằng việc khảo sát và tìm kiếm đối tác để mở học viện AP Education tại Đà Nẵng — nếu thành công, đây sẽ là cơ sở đào tạo thứ ba, phủ đều cả ba miền Nam – Bắc – Trung.",
    { listItem: "bullet" },
  ),

  block("Tầm nhìn 2030", { style: "h3" }),
  block(
    "AP đặt mục tiêu trở thành hệ thống chăm sóc xe hơi số 1 Việt Nam theo tiêu chuẩn quốc tế vào năm 2030, với khoảng 10 trung tâm trực dinh tại TP.HCM và hơn 20 trung tâm nhượng quyền tại các tỉnh thành — vận hành trên nền tảng văn hoá 3T (Tâm – Tầm – Tín), 3D (Đúng – Đủ – Đều) và 3C (Có trình độ – Có tác phong – Có trách nhiệm) mà anh Johnny xây dựng làm “hệ điều hành” chung cho toàn hệ thống, giúp mô hình có thể nhân bản chính xác ra nhiều địa phương mà vẫn giữ đúng chất lượng.",
  ),
  block(
    "Với AP Car Care và Học viện Detailing Việt Nam đã là hai case study minh chứng bằng số liệu thật cho hai mảnh ghép của hệ sinh thái này, câu chuyện phía sau — một nhà sáng lập được “giải phóng” khỏi vai trò không phù hợp để tập trung dẫn dắt cả hệ thống — chính là lý do cả hai cùng tăng trưởng bền vững thay vì chỉ tăng trưởng nhất thời.",
  ),
];

const bodyEn = (imgs) => [
  block("The person behind the AP ecosystem", { style: "h3" }),
  block(
    "Nguyen Phuoc Loc — better known as Johnny Loc Nguyen — is an automotive engineering graduate from Ho Chi Minh City University of Technology who started with a small car care shop in Dong Nai in 2012. Over a decade later, he has built AP: a full automotive ecosystem of five arms — AP Car Care (detailing & care), AP Market (accessories e-commerce), AP Education (training — the same Vietnam Detailing Academy featured in its own case study), AP Service (maintenance & repair), and AP Store (car buying & selling).",
  ),
  imageBlock(imgs.ecosystem, "AP's full automotive ecosystem — five arms around one car (source: apcarcare.vn)"),
  block(
    "Tri Duc Car Media began partnering with Johnny in 2023, right as AP completed its final piece (AP Store) and standardized the whole system under AP Corporation. This has never been a short-term service contract — it's an ongoing advisory relationship spanning years, through both smooth stretches and hard ones.",
  ),

  block("Freeing a founder from work that wasn't his to do", { style: "h3" }),
  block(
    "Like most founders of fast-growing SMEs, in the early stage Johnny had to wear far more hats than a single person should: coming up with content ideas himself, editing photos himself, monitoring and replying to Fanpage messages himself, even tinkering with the website himself — on top of running an entire multi-branch, multi-business system.",
  ),
  block(
    "Per AP Corporation's own published org chart, the “CMO — Marketing Director” seat (communications, content, ads, design) is one of five core functions under the CEO, alongside COO, CFO, CHRO and CIO. Tri Duc Car Media's role throughout this journey has been to fully own that CMO function — content strategy, photo/video production, ad operations, and monthly reporting — so Johnny no longer has to do it himself, and can step back to see the whole picture.",
  ),
  block(
    "Once he no longer had to design every banner or man the page every evening himself, a founder's time and energy went back where it belonged: building strategy, training the team, growing the ecosystem, and — most importantly — knowing what to let go of and what to hold onto.",
  ),

  block("Not a story of pure wins", { style: "h3" }),
  block(
    "An honest case study doesn't just tell the pretty parts. Across this partnership there have been stretches where the numbers clearly dropped before recovering — and those were exactly the moments when advising, proposing, and revising strategy between both sides happened the most.",
  ),
  block(
    "At Vietnam Detailing Academy, new prospective-student leads once peaked at 330/month (Jun 2025), then declined steadily, bottoming out at just 4 in Jan 2026 — nearly zero. Rather than sticking with the old approach, the team and Johnny rebuilt the content strategy, expanded into TikTok, and kept at it consistently for months until the number recovered to 250 by Aug 2026.",
    { listItem: "bullet" },
  ),
  block(
    "At AP Car Care, even during its best growth stretch, August 2026 revenue still dropped roughly 28% versus July 2026 (from 1.32 billion to 948 million VND) — a reminder that real growth isn't a straight line up, it's a continuous cycle of measuring, spotting problems, and adjusting.",
    { listItem: "bullet" },
  ),
  block(
    "Sticking with the data instead of only trusting gut feeling — even when the data isn't pretty — is what has kept this advisory relationship going for over two years, instead of ending after a few hard early months.",
    { listItem: "bullet" },
  ),

  block("Business development: south, north, and next, central Vietnam", { style: "h3" }),
  imageBlock(imgs.timeline, "The journey of building the AP ecosystem, 2012 → 2030"),
  block(
    "In October 2025, AP Education officially opened a training campus in Bac Ninh — the ecosystem's first step outside Ho Chi Minh City, verifiable directly on Google Maps (see the link below). That was also when the marketing team had to rebuild brand awareness almost from scratch in a brand-new market.",
    { listItem: "bullet" },
  ),
  block(
    "Moving into 2026, Johnny continues that business-development journey by scouting locations and partners to open an AP Education campus in Da Nang — if it goes through, this would be the third training campus, covering all three regions of Vietnam: South, North, and Central.",
    { listItem: "bullet" },
  ),

  block("2030 vision", { style: "h3" }),
  block(
    "AP aims to become Vietnam's #1 car care system by international standards by 2030, with around 10 flagship centers in Ho Chi Minh City and 20+ franchised centers across the provinces — all running on the 3T (Heart – Vision – Trust), 3D (Correct – Adequate – Consistent) and 3C (Skilled – Professional – Accountable) culture Johnny built as a shared “operating system” for the whole company, letting the model be replicated accurately in new locations without losing quality.",
  ),
  block(
    "With AP Car Care and Vietnam Detailing Academy already standing as two data-backed case studies for two arms of this ecosystem, the story behind them — a founder freed from a role that wasn't his, so he could focus on leading the whole system — is exactly why both are growing sustainably rather than just growing for a moment.",
  ),
];

async function uploadImage(filename, altVi, altEn) {
  const filePath = path.join(__dirname, "assets", "johnny-ap-ecosystem", filename);
  const buffer = await readFile(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: { vi: altVi, en: altEn },
  };
}

async function uploadPlain(filename) {
  const filePath = path.join(__dirname, "assets", "johnny-ap-ecosystem", filename);
  const buffer = await readFile(filePath);
  return client.assets.upload("image", buffer, { filename });
}

const [coverImage, clientLogo, ecosystemAsset, timelineAsset] = await Promise.all([
  uploadImage("portrait.jpg", "CEO Johnny Lộc Nguyễn — Nhà sáng lập hệ sinh thái AP", "CEO Johnny Loc Nguyen — Founder of the AP ecosystem"),
  uploadImage("logo.png", "Logo AP", "AP logo"),
  uploadPlain("ecosystem-diagram.png"),
  uploadPlain("timeline.png"),
]);

const imgs = { ecosystem: ecosystemAsset, timeline: timelineAsset };

const doc = {
  _type: "caseStudy",
  _id: "case-study-johnny-ap-ecosystem",
  title: {
    vi: "Johnny Lộc Nguyễn — Giải phóng nhà sáng lập, xây dựng hệ sinh thái AP từ một trung tâm chăm sóc xe thành 5 thương hiệu",
    en: "Johnny Loc Nguyen — Freeing a Founder, Building the AP Ecosystem From One Car Care Shop Into Five Brands",
  },
  slug: { _type: "slug", current: "johnny-loc-nguyen-he-sinh-thai-ap" },
  clientName: "Johnny Lộc Nguyễn — Hệ sinh thái AP",
  industry: {
    vi: "Đồng hành cùng nhà sáng lập & xây dựng hệ sinh thái thương hiệu",
    en: "Founder Partnership & Brand Ecosystem Building",
  },
  summary: {
    vi: "Từ 2023 đến nay, Trí Đức Car Media đồng hành cùng CEO Johnny Lộc Nguyễn — tư vấn, đề xuất và trực tiếp đảm nhiệm vai trò CMO — giúp anh tập trung dẫn dắt hệ sinh thái AP (Car Care, Market, Education, Service, Store) mở rộng ra Bắc Ninh (10/2025), hướng tới Đà Nẵng (2026) và tầm nhìn 10 chi nhánh toàn quốc vào 2030.",
    en: "Since 2023, Tri Duc Car Media has partnered with CEO Johnny Loc Nguyen — advising, proposing, and directly running the CMO function — freeing him to lead the AP ecosystem (Car Care, Market, Education, Service, Store) expanding into Bac Ninh (Oct 2025), scouting Da Nang next (2026), with a 2030 vision of 10 branches nationwide.",
  },
  isOngoing: true,
  dataAsOf: "09/2026",
  stats: [
    { _key: key(), label: { vi: "Năm bắt đầu đồng hành", en: "Partnership began" }, value: "2023" },
    { _key: key(), label: { vi: "Thương hiệu trong hệ sinh thái", en: "Brands in the ecosystem" }, value: "5" },
    { _key: key(), label: { vi: "Khu vực đã/đang mở rộng", en: "Regions expanded into" }, value: "Nam · Bắc · (Trung)" },
    { _key: key(), label: { vi: "Tầm nhìn 2030", en: "2030 vision" }, value: "10 chi nhánh" },
  ],
  links: [
    { _key: key(), label: { vi: "Facebook cá nhân Johnny Lộc Nguyễn", en: "Johnny Loc Nguyen's Facebook" }, url: "https://www.facebook.com/johnny.loc.nguyen.2024/" },
    { _key: key(), label: { vi: "Website AP Car Care", en: "AP Car Care website" }, url: "https://apcarcare.vn" },
    { _key: key(), label: { vi: "Website Học viện AP Education", en: "AP Education website" }, url: "https://chamsocxehoi.edu.vn" },
    {
      _key: key(),
      label: { vi: "Đọc thêm: Giới thiệu AP", en: "Read more: Introducing AP" },
      url: "https://apcarcare.vn/blogs/ve-chung-toi-ap-car-care/gioi-thieu-ve-ap-toan-canh-he-sinh-thai-va-chien-luoc-van-hanh-khep",
    },
    {
      _key: key(),
      label: { vi: "Đọc thêm: CEO Johnny Lộc Nguyễn", en: "Read more: CEO Johnny Loc Nguyen" },
      url: "https://apcarcare.vn/blogs/ve-chung-toi-ap-car-care/ceo-johnny-loc-nguyen-nguoi-dan-duong-cua-mot-giac-mo-mang-ten-ap",
    },
    {
      _key: key(),
      label: { vi: "Đọc thêm: Tầm nhìn 2030", en: "Read more: 2030 Vision" },
      url: "https://apcarcare.vn/blogs/ve-chung-toi-ap-car-care/tam-nhin-2030-khat-vong-chinh-phuc-thi-truong-toan-quoc",
    },
    {
      _key: key(),
      label: { vi: "Google Maps — Học viện AP Bắc Ninh", en: "Google Maps — AP Bac Ninh campus" },
      url: "https://www.google.com/maps/search/?api=1&query=AP+Car+Care+92+Ho%C3%A0ng+Hoa+Th%C3%A1m+Ph%C6%B0%E1%BB%9Dng+V%C3%B5+C%C6%B0%E1%BB%9Dng+B%E1%BA%AFc+Ninh",
    },
  ],
  body: { vi: bodyVi(imgs), en: bodyEn(imgs) },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
