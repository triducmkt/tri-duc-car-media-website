/**
 * One-off import: creates/updates the "AP Car Care" case study in Sanity,
 * uploading the client's real logo, a cover photo sourced from apcarcare.vn,
 * and three data-visualization charts, then writing a deep-dive on the
 * MQL -> SQL -> revenue funnel, returning-customer (CSKH) revenue share, and
 * follower/reach growth, all sourced from the "fanpage AP" tracking sheet
 * through August 2026. Also links out to AP's real Facebook, TikTok,
 * YouTube and Google Maps listings so readers can verify directly.
 *
 * Requires a real Sanity project with a write-capable API token (create one
 * at https://www.sanity.io/manage -> API -> Tokens -> "Editor" permission).
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-ap-car-care.mjs
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
    children: [
      {
        _type: "span",
        _key: key(),
        text,
        marks: strong ? ["strong"] : [],
      },
    ],
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
  block("Bối cảnh & mục tiêu", { style: "h3" }),
  block(
    "Đầu năm 2024, hệ thống AP Car Care có 2 chi nhánh tại Tân Phú và Quận 7 với dịch vụ đa dạng nhưng thương hiệu chưa nổi bật, chủ yếu dựa vào khách quen. Fanpage Facebook ít nội dung storytelling, chỉ đăng hình dịch vụ nên tương tác thấp.",
  ),
  block(
    "Mục tiêu đặt ra trong 3–6 tháng: tăng gấp đôi follower, tăng 150% khách mới, tăng doanh thu tối thiểu 50%, và xây nền content ổn định lâu dài để thương hiệu ghi nhớ trong tâm trí khách hàng.",
  ),
  block("Chiến lược triển khai", { style: "h3" }),
  block(
    "Định vị thương hiệu: “Chăm xe như chăm người thân” — kết hợp tay nghề detailing quốc tế, thái độ phục vụ thân thiện và mức giá hợp lý.",
  ),
  block("Ba trụ cột nội dung xuyên suốt:"),
  block("Giá trị hữu ích — mẹo chăm xe, bảo dưỡng.", { listItem: "bullet" }),
  block("Storytelling — câu chuyện khách hàng thật.", { listItem: "bullet" }),
  block("Minh chứng tay nghề — hình ảnh before/after, video kỹ thuật.", { listItem: "bullet" }),
  block(
    "Chiến thuật chính: storytelling chiếm 80% nội dung kết hợp feedback thật, đẩy mạnh video ngắn TikTok & Reels để tăng reach tự nhiên, kết hợp combo ưu đãi cho khách mới và chương trình giới thiệu bạn bè (referral) cho khách cũ.",
  ),

  block("Phễu chuyển đổi: từ tin nhắn đến khách hàng thật", { style: "h3" }),
  block(
    "Không chỉ dừng ở lượt xem hay follower, mỗi tháng đội ngũ theo dõi sát toàn bộ phễu: Lượt tiếp cận → MQL (tin nhắn quan tâm ghi nhận qua Harasocial) → SQL (khách đủ thông tin để chuyển cho tư vấn viên, ghi nhận qua Getfly) → Booking → Khách đến trải nghiệm → Doanh thu.",
  ),
  imageBlock(charts.mqlSql, "Phễu MQL → SQL và tỉ lệ chuyển đổi của AP Car Care, T3–T8/2026"),
  block(
    "Từ tháng 3 đến tháng 8/2026, mỗi tháng ghi nhận 570–830 MQL, trong đó 24–38% được chuyển thành SQL (156–216 khách/tháng) — tỉ lệ chuyển đổi dao động nhưng luôn ổn định quanh ngưỡng 1/4, cho thấy đây không phải may rủi mà là một quy trình lọc lead lặp lại được.",
    { listItem: "bullet" },
  ),
  block(
    "Ảnh chụp một tháng có đầy đủ dữ liệu phễu (T4/2026) để hình dung rõ hơn: 385.202 lượt tiếp cận → 216 SQL → 116 lịch hẹn (booking) → 391 khách đến (120 khách mới + 264 khách cũ quay lại + 7 khách giới thiệu) → 549 triệu đồng doanh thu từ khách mới trên tổng doanh thu tháng 1,2 tỷ đồng, với ROAS 40 lần trên chi phí quảng cáo và MKT ROI 42%.",
    { listItem: "bullet" },
  ),

  block("CSKH & khách quay lại: bệ đỡ doanh thu thật sự", { style: "h3" }),
  block(
    "Nếu chỉ chạy quảng cáo để có khách mới, doanh thu sẽ bấp bênh theo ngân sách ads. Vì vậy, một chỉ số được theo dõi riêng: tỉ trọng doanh thu đến từ khách cũ quay lại (đội CSKH gọi lại, nhắc lịch bảo dưỡng, remarketing đúng nhu cầu).",
  ),
  imageBlock(charts.cskh, "Tỉ trọng doanh thu từ khách quay lại trên tổng doanh thu AP Car Care, T3–T8/2026"),
  block(
    "Tỉ trọng này tăng từ 29% (T3/2026) lên đỉnh 72% (T7/2026) và duy trì quanh 60% vào T8/2026 — nghĩa là hơn một nửa doanh thu hằng tháng hiện đến từ những khách đã từng sử dụng dịch vụ, không phải khách mới hoàn toàn.",
    { listItem: "bullet" },
  ),
  block(
    "Một đợt remarketing thực tế trong tháng 7/2026 ghi nhận 33 lượt khách cũ chủ động nhắn tin lại qua Fanpage/Zalo khi nhận tin nhắn chăm sóc đúng nhu cầu, hơn 54% trong số đó hỏi về Phủ Ceramic — đúng dịch vụ có chu kỳ cần làm lại định kỳ, xác nhận nhắn đúng người, đúng lúc.",
    { listItem: "bullet" },
  ),

  block("Tăng trưởng follower & lượt tiếp cận (T1/2024 → T8/2026)", { style: "h3" }),
  imageBlock(charts.follower, "Follower Fanpage AP Car Care tăng từ 12.465 lên 30.464, T1/2024 → T8/2026"),
  block("Follower Fanpage tăng từ 12.465 lên 30.464 — gấp gần 2,5 lần (+144%).", { listItem: "bullet" }),
  block(
    "Đà tăng bứt phá rõ nhất trong giai đoạn T3 → T6/2026 (16.428 → 30.326), trùng thời điểm đẩy mạnh đồng bộ nội dung đa kênh — sau đó follower giữ ổn định quanh mốc 30K thay vì ảo do mua follow.",
    { listItem: "bullet" },
  ),
  block(
    "Khách hàng mới bình quân/tháng tăng từ 226 lên 619 (+174%), riêng T8/2026 ghi nhận 619 khách mới cùng 2.293 lượt tương tác nội dung (+25% so với T7/2026).",
    { listItem: "bullet" },
  ),
  block(
    "Doanh thu trung bình/tháng tăng từ khoảng 724 triệu (T1/2024) lên khoảng 1,04 tỷ đồng (T8/2026), tương đương +44%.",
    { listItem: "bullet" },
  ),
  block(
    "Tổng lượt tiếp cận T8/2026 đạt 544.269 lượt (+15% so với đầu năm 2026), tổng lượt xem nội dung đạt hơn 1,5 triệu lượt/tháng.",
    { listItem: "bullet" },
  ),
  block(
    "Một video hướng dẫn dán PPF đạt 480.000 lượt xem cùng hàng trăm bình luận, chia sẻ — thậm chí có khách ở Bình Dương, Đồng Nai chủ động chạy lên TP.HCM để trải nghiệm dịch vụ.",
    { listItem: "bullet" },
  ),

  block("Uy tín có thể kiểm chứng ngay trên Google Maps", { style: "h3" }),
  block(
    "Tính đến T3/2026 (thời điểm gần nhất có báo cáo đầy đủ), 2 chi nhánh AP Tân Phú và AP Quận 7 cộng lại đạt 822 lượt đánh giá Google Maps với điểm trung bình 4,9/5 sao — bạn có thể bấm vào các liên kết Google Maps ở đầu bài để xem trực tiếp đánh giá thật từ khách hàng.",
    { listItem: "bullet" },
  ),

  block("Khách hàng nói gì", { style: "h3" }),
  block(
    "“Nhân viên tư vấn nhiệt tình và có chuyên môn, giúp khách hàng tiết kiệm thời gian và lựa chọn được dịch vụ phù hợp nhất. Mức giá dịch vụ hợp lý, dịch vụ khách hàng nhận được xứng đáng với số tiền bỏ ra.” — PhiLong168, Local Guide trên Google Maps",
  ),
  block(
    "“Lâu rồi mới tìm được chỗ rửa xe ô tô gần đây ưng ý như vậy. Nhân viên vui vẻ, rửa cực kỳ sạch sẽ mà không phải chờ lâu. Giá lại hợp lý. Chắc chắn sẽ quay lại mỗi khi cần!” — Linh Kim, khách hàng trên Google Maps",
  ),

  block("Bài học & định hướng tiếp theo", { style: "h3" }),
  block("Content phải thật và gần gũi thì khách mới tin tưởng hơn quảng cáo thông thường.", {
    listItem: "bullet",
  }),
  block("Video hậu trường và mẹo chăm xe giúp khách hiểu và trân trọng tay nghề đội ngũ.", {
    listItem: "bullet",
  }),
  block("Chăm sóc khách cũ chính là “vũ khí bí mật” giữ doanh thu ổn định lâu dài — không phụ thuộc hoàn toàn vào ads.", {
    listItem: "bullet",
  }),
  block(
    "Trí Đức Car Media hiện vẫn đang trực tiếp phụ trách toàn bộ hoạt động truyền thông đa kênh của AP Car Care, song song đồng hành cùng Học viện Detailing Việt Nam — mảnh ghép đào tạo trong cùng hệ sinh thái AP do CEO Johnny Lộc Nguyễn sáng lập. Xem thêm câu chuyện xây dựng hệ sinh thái AP trong case study riêng.",
  ),
];

const bodyEn = (charts) => [
  block("Context & goals", { style: "h3" }),
  block(
    "At the start of 2024, the AP Car Care system had two branches in Tan Phu and District 7, offering a wide range of services but with a brand that hadn't yet stood out — the business relied mainly on repeat regulars. Its Facebook Page carried little storytelling, mostly posting straightforward service photos, which kept engagement low.",
  ),
  block(
    "The 3–6 month goals: double the follower count, grow new customers by 150%, increase revenue by at least 50%, and build a durable content foundation that would stick in customers' minds long-term.",
  ),
  block("Strategy", { style: "h3" }),
  block(
    "Brand positioning: “We care for your car like family” — pairing internationally trained detailing craftsmanship with a friendly service attitude and fair pricing.",
  ),
  block("Three content pillars ran throughout:"),
  block("Practical value — car care and maintenance tips.", { listItem: "bullet" }),
  block("Storytelling — real customer stories.", { listItem: "bullet" }),
  block("Proof of craft — before/after shots and technical videos.", { listItem: "bullet" }),
  block(
    "Core tactics: storytelling made up 80% of content, paired with genuine feedback; short-form TikTok and Reels videos drove organic reach; a first-visit bundle offer brought in new customers, and a referral voucher rewarded existing ones for introducing friends.",
  ),

  block("The conversion funnel: from a message to a real customer", { style: "h3" }),
  block(
    "Beyond views and followers, the team tracks the full funnel every month: Reach → MQL (interested messages logged via Harasocial) → SQL (qualified leads handed to a consultant, logged via Getfly) → Booking → Customer visit → Revenue.",
  ),
  imageBlock(charts.mqlSql, "AP Car Care's MQL → SQL funnel and conversion rate, Mar–Aug 2026"),
  block(
    "From March to August 2026, each month produced 570–830 MQLs, of which 24–38% converted into SQLs (156–216 per month) — a conversion rate that fluctuates but consistently hovers around one in four, showing this is a repeatable filtering process, not luck.",
    { listItem: "bullet" },
  ),
  block(
    "A snapshot of the one month with complete funnel data (Apr 2026) helps visualize it: 385,202 reach → 216 SQLs → 116 bookings → 391 customer visits (120 new + 264 returning + 7 referred) → 549 million VND in new-customer revenue out of 1.2 billion VND total monthly revenue, with 40x ROAS on ad spend and 42% marketing ROI.",
    { listItem: "bullet" },
  ),

  block("Customer care & repeat business: the real revenue backbone", { style: "h3" }),
  block(
    "Running ads for new customers alone makes revenue swing with the ad budget. So one metric gets tracked separately: the share of monthly revenue coming from returning customers (via the care team's follow-up calls, maintenance reminders, and needs-based remarketing).",
  ),
  imageBlock(charts.cskh, "Share of AP Car Care's monthly revenue coming from returning customers, Mar–Aug 2026"),
  block(
    "That share grew from 29% (Mar 2026) to a peak of 72% (Jul 2026) and held around 60% in Aug 2026 — meaning more than half of monthly revenue now comes from customers who've already used the service before, not brand-new ones.",
    { listItem: "bullet" },
  ),
  block(
    "One real remarketing round in July 2026 logged 33 returning customers messaging back on their own after a needs-based follow-up — over 54% asked about ceramic coating specifically, a service with a natural reapplication cycle, confirming the right message reached the right person at the right time.",
    { listItem: "bullet" },
  ),

  block("Follower & reach growth (Jan 2024 → Aug 2026)", { style: "h3" }),
  imageBlock(charts.follower, "AP Car Care Page followers grew from 12,465 to 30,464, Jan 2024 → Aug 2026"),
  block("Page followers grew from 12,465 to 30,464 — nearly 2.5x (+144%).", { listItem: "bullet" }),
  block(
    "The sharpest acceleration ran from Mar to Jun 2026 (16,428 → 30,326), coinciding with a synchronized multi-channel content push — followers then held steady around 30K rather than being inflated by purchased follows.",
    { listItem: "bullet" },
  ),
  block(
    "Average monthly new customers grew from 226 to 619 (+174%); August 2026 alone recorded 619 new customers and 2,293 content interactions (+25% month-over-month).",
    { listItem: "bullet" },
  ),
  block(
    "Average monthly revenue grew from roughly 724 million VND (Jan 2024) to roughly 1.04 billion VND (Aug 2026), a +44% increase.",
    { listItem: "bullet" },
  ),
  block(
    "August 2026 reach hit 544,269 (+15% versus the start of the year), with total content views exceeding 1.5 million per month.",
    { listItem: "bullet" },
  ),
  block(
    "A single PPF (paint protection film) tutorial video reached 480,000 views with hundreds of comments and shares — some customers from Binh Duong and Dong Nai now travel into Ho Chi Minh City specifically for the service.",
    { listItem: "bullet" },
  ),

  block("Trust you can verify on Google Maps", { style: "h3" }),
  block(
    "As of Mar 2026 (the most recent month with complete reporting), the Tan Phu and District 7 branches combined had 822 Google Maps reviews averaging 4.9/5 stars — click the Google Maps links at the top of this page to see the real reviews yourself.",
    { listItem: "bullet" },
  ),

  block("What customers say", { style: "h3" }),
  block(
    "“The staff are enthusiastic and knowledgeable, helping customers save time and choose the right service. Pricing is fair and the service is genuinely worth what you pay.” — PhiLong168, Local Guide on Google Maps",
  ),
  block(
    "“It's been a while since I found a car wash this good nearby. Friendly staff, extremely thorough cleaning, and no long wait. Fair pricing too. I'll definitely be back whenever I need it!” — Linh Kim, Google Maps review",
  ),

  block("Lessons & what's next", { style: "h3" }),
  block("Content has to feel real and relatable — that's what earns more trust than typical ads.", {
    listItem: "bullet",
  }),
  block("Behind-the-scenes footage and care tips help customers understand and value the team's craft.", {
    listItem: "bullet",
  }),
  block("Nurturing existing customers is the real secret weapon behind stable, recurring revenue — not sheer ad spend.", {
    listItem: "bullet",
  }),
  block(
    "Tri Duc Car Media still directly runs AP Car Care's full multi-channel media operation today, alongside Vietnam Detailing Academy — the training arm of the same AP ecosystem founded by CEO Johnny Loc Nguyen. See the dedicated case study on building the AP ecosystem for the full story.",
  ),
];

async function uploadImage(filename, altVi, altEn) {
  const filePath = path.join(__dirname, "assets", "ap-car-care", filename);
  const buffer = await readFile(filePath);
  const asset = await client.assets.upload("image", buffer, { filename });
  return {
    _type: "image",
    asset: { _type: "reference", _ref: asset._id },
    alt: { vi: altVi, en: altEn },
  };
}

async function uploadChart(filename) {
  const filePath = path.join(__dirname, "assets", "ap-car-care", filename);
  const buffer = await readFile(filePath);
  return client.assets.upload("image", buffer, { filename });
}

const [coverImage, clientLogo, chartFollower, chartMqlSql, chartCskh] = await Promise.all([
  uploadImage("cover.jpg", "Dịch vụ phủ ceramic kính lái tại AP Car Care", "Windshield ceramic coating service at AP Car Care"),
  uploadImage("logo.png", "Logo AP Car Care", "AP Car Care logo"),
  uploadChart("chart-follower-growth.png"),
  uploadChart("chart-mql-sql-funnel.png"),
  uploadChart("chart-cskh-revenue.png"),
]);

const charts = { follower: chartFollower, mqlSql: chartMqlSql, cskh: chartCskh };

const doc = {
  _type: "caseStudy",
  _id: "case-study-ap-car-care",
  title: {
    vi: "AP Car Care — Từ trung tâm detailing địa phương đến thương hiệu chăm sóc xe được tìm kiếm nhiều nhất TP.HCM",
    en: "AP Car Care — From a Neighborhood Detailing Shop to Ho Chi Minh City's Most-Searched Car Care Brand",
  },
  slug: { _type: "slug", current: "ap-car-care" },
  clientName: "AP Car Care",
  industry: {
    vi: "Chăm sóc & Detailing ô tô",
    en: "Automotive Detailing & Car Care",
  },
  summary: {
    vi: "Đồng hành cùng hệ thống AP Car Care (2 chi nhánh Tân Phú & Quận 7) từ 08/2023 đến nay: xây dựng thương hiệu “Chăm xe như chăm người thân”, tăng follower gấp 2,5 lần, doanh thu trung bình tháng lên hơn 1 tỷ đồng, và hơn 60% doanh thu hiện đến từ khách quay lại.",
    en: "Partnering with the AP Car Care system (2 branches in Tan Phu & District 7) since August 2023: building the “We care for your car like family” brand, growing followers 2.5x, average monthly revenue past 1 billion VND, and over 60% of revenue now from returning customers.",
  },
  isOngoing: true,
  dataAsOf: "08/2026",
  stats: [
    {
      _key: key(),
      label: { vi: "Follower Fanpage", en: "Page followers" },
      value: "30.464",
      note: { vi: "+144% so với T1/2024", en: "+144% vs. Jan 2024" },
    },
    {
      _key: key(),
      label: { vi: "Khách mới/tháng", en: "New customers/month" },
      value: "619",
      note: { vi: "+174% so với T1/2024", en: "+174% vs. Jan 2024" },
    },
    {
      _key: key(),
      label: { vi: "Doanh thu TB/tháng", en: "Avg. monthly revenue" },
      value: "1,04 tỷ đ",
      note: { vi: "+44% so với T1/2024", en: "+44% vs. Jan 2024" },
    },
    {
      _key: key(),
      label: { vi: "Doanh thu từ khách cũ", en: "Revenue from returning customers" },
      value: "60%",
      note: { vi: "T8/2026, đỉnh 72% vào T7", en: "Aug 2026, peaked at 72% in Jul" },
    },
    {
      _key: key(),
      label: { vi: "Tỉ lệ MQL → SQL", en: "MQL → SQL rate" },
      value: "25,6%",
      note: { vi: "Ổn định 24–38% mỗi tháng", en: "Stable 24–38% monthly" },
    },
    {
      _key: key(),
      label: { vi: "Đánh giá Google Maps", en: "Google Maps reviews" },
      value: "822 · 4,9★",
      note: { vi: "2 chi nhánh, T3/2026", en: "2 branches, Mar 2026" },
    },
  ],
  links: [
    { _key: key(), label: { vi: "Website AP Car Care", en: "AP Car Care website" }, url: "https://apcarcare.vn" },
    { _key: key(), label: { vi: "Fanpage Facebook", en: "Facebook Page" }, url: "https://www.facebook.com/apcarcare.vn" },
    { _key: key(), label: { vi: "TikTok", en: "TikTok" }, url: "https://www.tiktok.com/@apcarcare.vn" },
    { _key: key(), label: { vi: "YouTube", en: "YouTube" }, url: "https://www.youtube.com/@apcarcarevn" },
    {
      _key: key(),
      label: { vi: "Google Maps — AP Tân Phú", en: "Google Maps — AP Tan Phu" },
      url: "https://www.google.com/maps/search/?api=1&query=AP+Car+Care+2+L%C3%AA+L%C6%B0+Ph%C6%B0%E1%BB%9Dng+Ph%C3%BA+Th%E1%BB%8D+Ho%C3%A0+TP.HCM",
    },
    {
      _key: key(),
      label: { vi: "Google Maps — AP Quận 7", en: "Google Maps — AP District 7" },
      url: "https://www.google.com/maps/search/?api=1&query=AP+Car+Care+76+%C4%90%C6%B0%E1%BB%9Dng+s%E1%BB%91+39+Ph%C6%B0%E1%BB%9Dng+T%C3%A2n+H%C6%B0ng+Qu%E1%BA%ADn+7+TP.HCM",
    },
  ],
  body: { vi: bodyVi(charts), en: bodyEn(charts) },
  coverImage,
  clientLogo,
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
