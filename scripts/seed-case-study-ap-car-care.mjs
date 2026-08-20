/**
 * One-off import: creates the "AP Car Care" case study in Sanity.
 *
 * Requires a real Sanity project with a write-capable API token (create one
 * at https://www.sanity.io/manage -> API -> Tokens -> "Editor" permission).
 *
 * Usage (Node 20+, no extra install needed):
 *   node --env-file=.env.local scripts/seed-case-study-ap-car-care.mjs
 */
import { createClient } from "@sanity/client";

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

const bodyVi = [
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
  block("Kết quả theo số liệu (T1/2024 → T6/2025)", { style: "h3" }),
  block("Follower Fanpage tăng từ 12.465 lên 15.962 (+28%).", { listItem: "bullet" }),
  block("Tiếp cận tự nhiên tăng từ 10.945 lên 53.659 — gấp gần 5 lần.", { listItem: "bullet" }),
  block("Khách hàng mới tăng từ 226 lên 320 mỗi kỳ (+41,5%).", { listItem: "bullet" }),
  block(
    "Doanh thu trung bình tăng từ khoảng 526 triệu/tháng (12/2024) lên khoảng 836 triệu/tháng (T6/2025), tương đương +46% so với cùng kỳ năm trước; riêng T10/2025 ghi nhận doanh thu thực hơn 1 tỷ đồng.",
    { listItem: "bullet" },
  ),
  block(
    "Tỉ lệ khách quay lại sau 6 tháng đạt khoảng 45%, cao gấp đôi so với trước khi triển khai chiến dịch — khách hàng trung thành hiện đóng góp khoảng 65% doanh thu.",
    { listItem: "bullet" },
  ),
  block(
    "Một video hướng dẫn dán PPF đạt 480.000 lượt xem cùng hàng trăm bình luận, chia sẻ — thậm chí có khách ở Bình Dương, Đồng Nai chủ động chạy lên TP.HCM để trải nghiệm dịch vụ.",
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
  block("Chăm sóc khách cũ chính là “vũ khí bí mật” giữ doanh thu ổn định lâu dài.", {
    listItem: "bullet",
  }),
  block(
    "AP Car Care hiện đang mở rộng mảng đào tạo detailing chuyên nghiệp, duy trì đều đặn video ngắn để giữ reach tự nhiên cao, và triển khai dịch vụ chăm sóc xe tận nhà cho tệp khách bận rộn.",
  ),
];

const bodyEn = [
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
  block("Results by the numbers (Jan 2024 → Jun 2025)", { style: "h3" }),
  block("Page followers grew from 12,465 to 15,962 (+28%).", { listItem: "bullet" }),
  block("Organic reach grew from 10,945 to 53,659 — nearly a 5x increase.", { listItem: "bullet" }),
  block("New customers grew from 226 to 320 per period (+41.5%).", { listItem: "bullet" }),
  block(
    "Average monthly revenue grew from roughly 526 million VND (Dec 2024) to roughly 836 million VND (Jun 2025), a +46% year-over-year increase; October 2025 alone recorded actual revenue of over 1 billion VND.",
    { listItem: "bullet" },
  ),
  block(
    "The 6-month repeat-customer rate reached roughly 45%, double the pre-campaign rate — loyal customers now account for about 65% of revenue.",
    { listItem: "bullet" },
  ),
  block(
    "A single PPF (paint protection film) tutorial video reached 480,000 views with hundreds of comments and shares — some customers from Binh Duong and Dong Nai now travel into Ho Chi Minh City specifically for the service.",
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
  block("Nurturing existing customers is the real secret weapon behind stable, recurring revenue.", {
    listItem: "bullet",
  }),
  block(
    "AP Car Care is now expanding into professional detailing training, keeping up a steady cadence of short-form video to sustain organic reach, and rolling out an at-home car care service for busy customers.",
  ),
];

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
    vi: "Đồng hành cùng hệ thống AP Car Care (2 chi nhánh Tân Phú & Quận 7) từ 08/2023 đến nay: xây dựng thương hiệu “Chăm xe như chăm người thân”, tăng 46% doanh thu và gấp đôi tỉ lệ khách quay lại chỉ sau hơn 1 năm triển khai marketing đa kênh.",
    en: "Partnering with the AP Car Care system (2 branches in Tan Phu & District 7) since August 2023: building the “We care for your car like family” brand, growing revenue by 46% and doubling the repeat-customer rate within just over a year of multi-channel marketing.",
  },
  body: { vi: bodyVi, en: bodyEn },
  publishedAt: new Date().toISOString(),
};

const result = await client.createOrReplace(doc);
console.log(`Done — case study created/updated: ${result._id}`);
console.log("Cover image wasn't uploaded automatically — add one from the Studio (/studio) if you have a good hero photo of the branches.");
