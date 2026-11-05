/**
 * Services, prices and combos — single source for the Dịch vụ price table
 * (components/services/PriceStudio.tsx), each service page
 * (app/[locale]/services/[slug]) and the footer links.
 *
 * PRICES: Trí Đức Media had no public price list (hq/07-STRATEGY-ANALYSIS-2026.md §5).
 * On 2026-11-05 anh Đức asked to publish prices: where no price exists, take the
 * market average and set Trí Đức at the HIGH end, marked `estimated` (shown with *)
 * and a note to confirm with the founder. Market basis per service is in
 * `basis` (sources: hq/07-STRATEGY-ANALYSIS-2026.md, section 2026-11-05 vòng 4).
 * 2026-11-05: anh Đức confirmed all these prices ("Prices are fine") → estimated:false,
 * no * on the site. Set `estimated: true` again for any new, unconfirmed price.
 * Order of SERVICES = order of messages → services.items (5 pillars).
 */

export type Locale = "vi" | "en";
type L = { vi: string; en: string };
type LL = { vi: string[]; en: string[] };

export type Price = {
  amount: number; // VND, before VAT
  unit: "month" | "once";
  /** Minimum contract length, months (monthly services). */
  minMonths?: number;
  /** Optional recurring part (e.g. SME OS subscription). */
  plus?: { amount: number; unit: "month" };
  estimated: boolean;
};

export type Service = {
  slug: string;
  short: L; // short name for chips / tower labels
  name: L;
  pitch: L; // one line under the name
  fit: L;
  includes: LL;
  steps: LL;
  measure: L; // how results are measured
  basis: L; // market basis for the price (shown on the service page)
  price: Price;
};

export const SERVICES: Service[] = [
  {
    slug: "he-thong-marketing-sales-cskh",
    short: { vi: "Hệ thống MKT–Sales–CSKH", en: "MKT–Sales–CS system" },
    name: {
      vi: "Tư vấn & Triển khai Hệ thống Marketing – Sales – CSKH",
      en: "Marketing – Sales – Customer Care System",
    },
    pitch: {
      vi: "Khách tìm thấy, được tư vấn đúng kịch bản, rồi quay lại — chạy đều mỗi tuần mà không cần chủ cầm tay.",
      en: "Customers find you, get consistent advice, and come back — every week, without the owner holding every hand.",
    },
    fit: {
      vi: "Cơ sở dịch vụ doanh thu 100 triệu – 1 tỷ/tháng, marketing đang rời rạc hoặc phụ thuộc chủ.",
      en: "Service businesses with 100M – 1B VND/month revenue whose marketing is ad-hoc or owner-dependent.",
    },
    includes: {
      vi: [
        "Hành trình khách: quảng cáo → nhắn tin → chốt lịch → quay lại",
        "Nội dung đều mỗi tuần trên Fanpage, TikTok, Zalo OA",
        "Kịch bản tư vấn & chăm sóc khách cho nhân viên",
        "Nhắc lịch, chăm khách cũ, xin đánh giá Google Maps",
        "Báo cáo số liệu hằng tháng: tiếp cận, tin nhắn, lịch hẹn, khách quay lại",
      ],
      en: [
        "Customer journey: ads → messages → booking → return visit",
        "Weekly content on Facebook, TikTok, Zalo OA",
        "Sales & care scripts for your staff",
        "Reminders, win-back of old customers, Google Maps reviews",
        "Monthly report: reach, messages, bookings, returning customers",
      ],
    },
    steps: {
      vi: ["Tuần 1–2: chẩn đoán & dựng hành trình khách", "Tháng 1: nội dung + kịch bản chạy thử", "Tháng 2–3: tối ưu theo số liệu, đào tạo người tiếp nhận"],
      en: ["Weeks 1–2: diagnosis & customer journey", "Month 1: content + scripts go live", "Months 2–3: optimise by numbers, train the person who takes over"],
    },
    measure: {
      vi: "Đo bằng lượt tiếp cận, tin nhắn quan tâm, lịch hẹn và tỉ lệ khách quay lại — báo cáo mỗi tháng.",
      en: "Measured by reach, qualified messages, bookings and returning-customer rate — reported monthly.",
    },
    basis: {
      vi: "Phòng marketing thuê ngoài gói trung cấp tại Việt Nam khoảng 13–25 triệu/tháng (trung bình ~20 triệu). Trí Đức đặt mức cao vì làm cả Sales & CSKH, không chỉ đăng bài.",
      en: "Mid-tier outsourced marketing departments in Vietnam run about 13–25M VND/month (avg ~20M). Trí Đức is priced at the high end because it covers sales & customer care, not only posting.",
    },
    price: { amount: 28_000_000, unit: "month", minMonths: 3, estimated: false },
  },
  {
    slug: "thuong-hieu-ca-nhan-chu-doanh-nghiep",
    short: { vi: "Thương hiệu người chủ", en: "Owner's personal brand" },
    name: {
      vi: "Xây dựng Thương hiệu Cá nhân cho Chủ doanh nghiệp",
      en: "Personal Brand for the Business Owner",
    },
    pitch: {
      vi: "Khách tin người trước khi tin tiệm. Người chủ có câu chuyện, có video, có mặt đều đặn trên mạng.",
      en: "Customers trust people before shops. The owner gets a story, videos and a steady online presence.",
    },
    fit: {
      vi: "Chủ cơ sở muốn khách tìm đến vì tin mình, không chỉ vì giá; sẵn sàng quay 1 buổi mỗi tuần.",
      en: "Owners who want customers to come for trust, not just price; can film one session a week.",
    },
    includes: {
      vi: [
        "Định vị & câu chuyện riêng của người chủ",
        "Kịch bản + quay dựng video ngắn hằng tuần",
        "Lịch nội dung Facebook, TikTok, YouTube Shorts",
        "Hướng dẫn trả lời bình luận, tin nhắn theo giọng của chủ",
        "Báo cáo tăng trưởng kênh mỗi tháng",
      ],
      en: [
        "Positioning & the owner's own story",
        "Weekly short-video scripts, filming and editing",
        "Content calendar for Facebook, TikTok, YouTube Shorts",
        "Guide for replying in the owner's voice",
        "Monthly channel growth report",
      ],
    },
    steps: {
      vi: ["Tuần 1: phỏng vấn & định vị", "Tháng 1: 1 buổi quay/tuần, đăng đều", "Tháng 2–3: nhân bản định dạng hiệu quả nhất"],
      en: ["Week 1: interview & positioning", "Month 1: one filming session a week", "Months 2–3: scale the formats that work"],
    },
    measure: {
      vi: "Đo bằng lượt xem, người theo dõi mới, tin nhắn nhắc tên người chủ.",
      en: "Measured by views, new followers and messages that mention the owner by name.",
    },
    basis: {
      vi: "Chăm sóc fanpage cao cấp ~8–11 triệu/tháng, cộng quay dựng video ngắn; trung bình ~15 triệu/tháng. Đơn vị cao cấp chào tới 60–65 triệu/tháng.",
      en: "Premium page management ~8–11M VND/month plus short-video production; avg ~15M/month. Premium firms quote up to 60–65M/month.",
    },
    price: { amount: 22_000_000, unit: "month", minMonths: 3, estimated: false },
  },
  {
    slug: "chuan-hoa-sop-dao-tao-doi-ngu",
    short: { vi: "SOP & đào tạo đội ngũ", en: "SOPs & team training" },
    name: { vi: "Chuẩn hóa SOP & Đào tạo Đội ngũ", en: "SOPs & Team Training" },
    pitch: {
      vi: "Ai vào cũng làm được: mỗi vị trí có quy trình, có bài kiểm tra, chủ không phải nhắc lại.",
      en: "Anyone can do the job: every role has a procedure and a check, so the owner stops repeating himself.",
    },
    fit: {
      vi: "Cơ sở 3–30 nhân viên, mỗi người làm một kiểu, chủ vắng là chậm.",
      en: "Businesses with 3–30 staff where everyone works differently and things slow down when the owner is away.",
    },
    includes: {
      vi: [
        "Đến tận cơ sở quan sát & phỏng vấn từng vị trí",
        "Bộ ~10 SOP (quy trình chuẩn) cho các vị trí chính",
        "Checklist ca, mẫu báo cáo, hạn mức tự quyết của trưởng ca",
        "2 buổi đào tạo thực chiến + bài kiểm tra cho nhân viên",
        "1 tháng theo dõi áp dụng sau bàn giao",
      ],
      en: [
        "On-site observation & interviews for each role",
        "~10 SOPs for the key roles",
        "Shift checklists, report templates, decision limits for shift leads",
        "2 hands-on training sessions + staff tests",
        "1 month of follow-up after hand-over",
      ],
    },
    steps: {
      vi: ["Tuần 1–2: quan sát & phỏng vấn", "Tuần 3–5: viết SOP, duyệt cùng chủ", "Tuần 6–8: đào tạo, kiểm tra, theo dõi áp dụng"],
      en: ["Weeks 1–2: observe & interview", "Weeks 3–5: write SOPs, review with the owner", "Weeks 6–8: train, test, follow up"],
    },
    measure: {
      vi: "Đo bằng số việc chủ còn phải tự xử lý mỗi tuần và điểm kiểm tra của nhân viên.",
      en: "Measured by how many issues still reach the owner each week and staff test scores.",
    },
    basis: {
      vi: "Thị trường quốc tế: thư viện 10 SOP + đào tạo ~3.000 USD; tư vấn trong nước cho SME ước khoảng 30–35 triệu trọn gói.",
      en: "International: a 10-SOP library + training ~3,000 USD; local SME consulting estimated at about 30–35M VND per package.",
    },
    price: { amount: 45_000_000, unit: "once", estimated: false },
  },
  {
    slug: "setup-phong-marketing-in-house",
    short: { vi: "Phòng Marketing in-house", en: "In-house marketing team" },
    name: { vi: "Setup & Đồng hành Phòng Marketing In-house", en: "In-house Marketing Team Setup" },
    pitch: {
      vi: "Dựng đội marketing của riêng anh chị: tuyển đúng người, giao đúng việc, có quy trình phối hợp.",
      en: "Build your own marketing team: the right hires, clear roles and a working rhythm.",
    },
    fit: {
      vi: "Cơ sở muốn tự chủ marketing lâu dài, ngân sách nuôi 1–4 nhân sự marketing.",
      en: "Businesses that want long-term in-house marketing and can fund 1–4 marketing staff.",
    },
    includes: {
      vi: [
        "Cơ cấu phòng, mô tả công việc, KPI từng vị trí",
        "Đăng tuyển, lọc hồ sơ, phỏng vấn cùng chủ",
        "Bộ quy trình & công cụ làm việc của phòng",
        "Kèm cặp đội mới trong 2 tháng đầu",
        "Bàn giao lịch họp & báo cáo hằng tuần cho chủ",
      ],
      en: [
        "Team structure, job descriptions, KPIs per role",
        "Job posts, screening, interviews with the owner",
        "Team processes & tool stack",
        "Coaching the new team for the first 2 months",
        "Weekly meeting & reporting rhythm for the owner",
      ],
    },
    steps: {
      vi: ["Tuần 1–2: thiết kế phòng & tuyển dụng", "Tháng 1: nhận người, đào tạo quy trình", "Tháng 2: kèm cặp, bàn giao"],
      en: ["Weeks 1–2: design & hiring", "Month 1: onboarding & process training", "Month 2: coaching & hand-over"],
    },
    measure: {
      vi: "Đo bằng việc đội tự ra kế hoạch tháng, tự báo cáo đúng hạn, không cần chủ nhắc.",
      en: "Measured by the team planning its own month and reporting on time without reminders.",
    },
    basis: {
      vi: "Một đội marketing nội bộ 4 người tại Việt Nam tốn khoảng 60–100 triệu/tháng; phí setup trọn gói của agency ước 40–45 triệu.",
      en: "A 4-person in-house marketing team in Vietnam costs about 60–100M VND/month; agency setup packages are estimated at 40–45M.",
    },
    price: { amount: 60_000_000, unit: "once", estimated: false },
  },
  {
    slug: "nen-tang-so-sme-os",
    short: { vi: "Nền tảng số SME OS", en: "SME OS platform" },
    name: { vi: "Triển khai nền tảng số SME OS", en: "SME OS Digital Platform" },
    pitch: {
      vi: "Khách, lịch hẹn, doanh thu về một chỗ. Chủ xem báo cáo trên điện thoại, ở đâu cũng biết tiệm đang thế nào.",
      en: "Customers, bookings and revenue in one place. The owner checks the report on the phone, from anywhere.",
    },
    fit: {
      vi: "Cơ sở đang ghi chép rời rạc (sổ, Excel, Zalo) và muốn có số liệu để vắng mặt yên tâm.",
      en: "Businesses keeping records in notebooks, Excel and Zalo that want numbers they can trust when away.",
    },
    includes: {
      vi: [
        "Khảo sát dữ liệu & quy trình đang dùng",
        "Cấu hình khách hàng, lịch hẹn, doanh thu, kho theo ngành",
        "Chuyển dữ liệu cũ sang hệ thống",
        "Đào tạo nhân viên & bảng số liệu cho chủ",
        "Thuê bao: lưu trữ, cập nhật, hỗ trợ (tới 15 người dùng)",
      ],
      en: [
        "Survey of current data & processes",
        "Set up customers, bookings, revenue and stock for your trade",
        "Migrate existing data",
        "Staff training & an owner dashboard",
        "Subscription: hosting, updates, support (up to 15 users)",
      ],
    },
    steps: {
      vi: ["Tuần 1: khảo sát", "Tuần 2–3: cấu hình & chuyển dữ liệu", "Tuần 4: đào tạo & chạy thật"],
      en: ["Week 1: survey", "Weeks 2–3: configure & migrate", "Week 4: train & go live"],
    },
    measure: {
      vi: "Đo bằng tỉ lệ đơn/lịch hẹn được ghi vào hệ thống và báo cáo tuần chủ nhận đúng hạn.",
      en: "Measured by the share of orders/bookings logged and the weekly report arriving on time.",
    },
    basis: {
      vi: "Phần mềm quản trị SME tại Việt Nam: phí triển khai khoảng 5–30 triệu, thuê bao ~150.000đ/người/tháng (15 người ≈ 2,3 triệu/tháng).",
      en: "SME management software in Vietnam: implementation about 5–30M VND, subscription ~150,000 VND/user/month (15 users ≈ 2.3M/month).",
    },
    price: { amount: 30_000_000, unit: "once", plus: { amount: 3_000_000, unit: "month" }, estimated: false },
  },
];

export const serviceBySlug = (slug: string) => SERVICES.find((s) => s.slug === slug);

/** A combo part: a service, and for monthly services how many months. */
type Part = { slug: string; months?: number };
export type Combo = {
  key: string;
  step: L; // "Bậc 1"
  name: L; // matches messages → ladder.levels names
  duration: L;
  fit: L;
  parts: Part[];
  /** null = quoted after diagnosis ("Liên hệ"). */
  price: number | null;
  estimated: boolean;
};

export const COMBOS: Combo[] = [
  {
    key: "tu-do-30-ngay",
    step: { vi: "Bậc 1", en: "Step 1" },
    name: { vi: "Tự Do 30 Ngày", en: "30-Day Freedom" },
    duration: { vi: "3–4 tháng", en: "3–4 months" },
    fit: { vi: "Doanh thu 100–300 triệu/tháng · 3–15 nhân viên", en: "100–300M VND/month · 3–15 staff" },
    parts: [
      { slug: "he-thong-marketing-sales-cskh", months: 3 },
      { slug: "chuan-hoa-sop-dao-tao-doi-ngu" },
      { slug: "nen-tang-so-sme-os", months: 3 },
    ],
    price: 135_000_000,
    estimated: false,
  },
  {
    key: "tu-do-1-quy",
    step: { vi: "Bậc 2", en: "Step 2" },
    name: { vi: "Tự Do 1 Quý", en: "1-Quarter Freedom" },
    duration: { vi: "6–9 tháng", en: "6–9 months" },
    fit: { vi: "Doanh thu 300 triệu – 1 tỷ/tháng", en: "300M – 1B VND/month" },
    parts: [
      { slug: "he-thong-marketing-sales-cskh", months: 6 },
      { slug: "thuong-hieu-ca-nhan-chu-doanh-nghiep", months: 3 },
      { slug: "chuan-hoa-sop-dao-tao-doi-ngu" },
      { slug: "setup-phong-marketing-in-house" },
      { slug: "nen-tang-so-sme-os", months: 6 },
    ],
    price: 309_000_000,
    estimated: false,
  },
  {
    key: "tu-do-1-nam",
    step: { vi: "Bậc 3", en: "Step 3" },
    name: { vi: "Tự Do 1 Năm", en: "1-Year Freedom" },
    duration: { vi: "12–18 tháng", en: "12–18 months" },
    fit: { vi: "Trên 1 tỷ/tháng hoặc nhiều chi nhánh", en: "Over 1B VND/month or several branches" },
    parts: [
      { slug: "he-thong-marketing-sales-cskh", months: 12 },
      { slug: "thuong-hieu-ca-nhan-chu-doanh-nghiep", months: 6 },
      { slug: "chuan-hoa-sop-dao-tao-doi-ngu" },
      { slug: "setup-phong-marketing-in-house" },
      { slug: "nen-tang-so-sme-os", months: 12 },
    ],
    price: 499_000_000,
    estimated: false,
  },
  {
    key: "tu-do-hoan-toan",
    step: { vi: "Bậc 4", en: "Step 4" },
    name: { vi: "Tự Do Hoàn Toàn", en: "Full Freedom" },
    duration: { vi: "18–36 tháng", en: "18–36 months" },
    fit: { vi: "Chuỗi cơ sở có lợi nhuận ổn định", en: "Profitable multi-site chains" },
    parts: [],
    price: null,
    estimated: false,
  },
];

/** List value of one combo part (what it would cost bought separately). */
export function partValue(p: Part) {
  const s = serviceBySlug(p.slug);
  if (!s) return 0;
  const { price } = s;
  if (price.unit === "month") return price.amount * (p.months ?? price.minMonths ?? 1);
  return price.amount + (price.plus ? price.plus.amount * (p.months ?? 0) : 0);
}
export const comboListTotal = (c: Combo) => c.parts.reduce((sum, p) => sum + partValue(p), 0);

/** "28.000.000đ" / "28,000,000 VND" */
export function formatVnd(n: number, locale: Locale) {
  return locale === "vi" ? `${new Intl.NumberFormat("vi-VN").format(n)}đ` : `${new Intl.NumberFormat("en-US").format(n)} VND`;
}
/** "28 triệu" / "28M" for tight labels. */
export function shortVnd(n: number, locale: Locale) {
  const m = Math.round(n / 1_000_000);
  return locale === "vi" ? `${m} triệu` : `${m}M`;
}

/** True while any listed price is still a market estimate (shows * + footnote). */
export const HAS_ESTIMATES = SERVICES.some((s) => s.price.estimated) || COMBOS.some((x) => x.estimated);
