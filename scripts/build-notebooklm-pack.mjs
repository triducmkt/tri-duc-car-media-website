/**
 * Builds the NotebookLM source pack for the gift library (lib/gifts.ts):
 *   content/notebooklm/README.md          — index: what to make, which tool, which files
 *   content/notebooklm/00-nen-chung.md    — shared brief (persona, voice, 5-axis framework, real numbers)
 *   content/notebooklm/<gift-id>.md       — per gift: brief + prompt to paste + source text
 * Source text comes only from the site's real content: Kiến thức articles
 * (content/fanpage-posts/posts.json) and published case studies (Sanity).
 * Run: node scripts/build-notebooklm-pack.mjs
 */
import fs from "fs";
import path from "path";

const OUT = "content/notebooklm";
const posts = JSON.parse(fs.readFileSync("content/fanpage-posts/posts.json", "utf8"));
const articles = Array.isArray(posts) ? posts : posts.posts;
const article = (slug) => articles.find((a) => a.slug === slug);

const query = encodeURIComponent(
  `*[_type=="caseStudy"]{"slug":slug.current,clientName,"title":title.vi,"summary":summary.vi,dataAsOf,"stats":stats[]{"label":label.vi,value,"note":note.vi},"body":body.vi}`,
);
const res = await fetch(`https://0lzmbuzo.apicdn.sanity.io/v2024-06-01/data/query/production?query=${query}`);
const cases = (await res.json()).result;
const caseBy = (slug) => cases.find((c) => c.slug === slug);

const blockText = (blocks = []) =>
  blocks
    .filter((b) => b._type === "block")
    .map((b) => {
      const text = (b.children || []).map((c) => c.text).join("");
      return b.style && /^h\d$/.test(b.style) ? `\n### ${text}` : b.listItem ? `- ${text}` : text;
    })
    .join("\n");

const articleText = (slug) => {
  const a = article(slug);
  if (!a) return "";
  const title = typeof a.title === "string" ? a.title : a.title?.vi;
  return `## Bài viết: ${title}\nNguồn: https://triduccar.media/vi/kien-thuc/${slug}\n\n${(a.body || []).join("\n")}\n`;
};
const caseText = (slug) => {
  const c = caseBy(slug);
  if (!c) return "";
  const stats = (c.stats || []).map((s) => `- ${s.label}: ${s.value}${s.note ? ` (${s.note})` : ""}`).join("\n");
  return `## Dự án thật: ${c.clientName} — ${c.title}\nNguồn: https://triduccar.media/vi/du-an/${slug} · Số liệu tới ${c.dataAsOf || "—"}\n\nTóm tắt: ${c.summary}\n\nSố liệu:\n${stats}\n\n${blockText(c.body)}\n`;
};

const SHARED = `# Nền chung — dán vào MỌI notebook (nguồn số 1)

## Ai là người nghe / đọc
Chủ cơ sở dịch vụ 30–55 tuổi ở các quận trung tâm TP.HCM: chủ xưởng / gara ô tô, tiệm chăm sóc xe, spa, phòng gym, trung tâm đào tạo.
Họ bận, đọc trên điện thoại, nghe trên đường đi làm, tin người làm thật hơn lý thuyết. Nỗi đau thường gặp:
- Không rời cơ sở được ngày nào; nghỉ 3 ngày là rối, nhân viên việc gì cũng hỏi.
- Quảng cáo tốn tiền mà khách không đều; khách cũ làm xong là đi.
- Thuê người làm marketing / content rồi mà vẫn phải tự nhắc mọi việc.
- Không rõ tháng này lời bao nhiêu, khách đến từ kênh nào.

## Người nói
Tăng Trí Đức — founder Công ty TNHH Trí Đức Car Media (MST 0319761584, TP.HCM). Xuất phát từ ngành dịch vụ & ô tô,
tư vấn – thiết kế – vận hành Marketing, Sales, CSKH và chuẩn hóa vận hành cho SME. Triết lý: "Giải phóng người chủ.
Nâng tầm doanh nghiệp." — mỗi cơ sở cần một hệ thống, không phải một ông chủ ôm hết việc. Có xuất hóa đơn VAT.

## Giọng
Tiếng Việt đời thường, xưng "anh chị" với người nghe, câu ngắn, ví dụ từ xưởng xe / spa / gym. Không thuật ngữ khó,
không hứa hẹn kết quả, không bịa số liệu: chỉ dùng số trong các nguồn kèm theo.

## Khung 5 trục sức khỏe cơ sở (dùng trên web: triduccar.media/vi/kiem-tra-co-so)
1. Khách mới — mỗi tuần khách mới có tìm đến đều không?
2. Khách quay lại — khách cũ có quay lại mà không cần nhắc?
3. Đội ngũ tự chạy — chủ nghỉ 3 ngày thì cơ sở thế nào?
4. Kênh online — fanpage, Google, TikTok có đều và ra khách không?
5. Nắm số liệu — có biết rõ doanh thu, chi phí, khách từ đâu tới?
Mỗi trục chấm 0–3: (0) gần như chưa có → (3) tốt và đều.

## Quy tắc hình ảnh (rút kinh nghiệm từ món "Nghỉ 3 ngày")
- KHÔNG vẽ mã QR (AI vẽ QR giả, không quét được). Chỉ ghi đường link dạng chữ; Trí Đức sẽ chèn QR thật sau.
- KHÔNG vẽ chân dung / khuôn mặt người thật (Tăng Trí Đức, Johnny Lộc Nguyễn, chủ tiệm). Dùng biểu tượng hoặc hình minh hoạ chung.
- KHÔNG thêm nhãn, tên bộ phận, toạ độ, số liệu hay tên viết tắt không có trong nguồn.

## Ưu đãi có thật (được nhắc)
- Kiểm tra cơ sở 60 giây, miễn phí: triduccar.media/vi/kiem-tra-co-so
- Buổi chẩn đoán 15 phút miễn phí với founder (đặt lịch: triduccar.media/vi/dat-lich-tu-van, Zalo 076.991.8685)
KHÔNG tự đặt ra giảm giá / voucher khác.

## Số liệu thật được phép dùng (từ dự án đã đăng)
${cases
  .map((c) => `- ${c.clientName} (tới ${c.dataAsOf || "—"}): ${c.summary}`)
  .join("\n")}
`;

/** One entry per gift in lib/gifts.ts (ids must match). */
const GIFTS = [
  {
    id: "nghi-3-ngay",
    title: "Nghỉ 3 ngày, cơ sở vẫn chạy",
    format: "Cẩm nang (ebook PDF 8–12 trang)",
    insight: "Chủ không rời cơ sở được; nhân viên việc gì cũng hỏi.",
    tools: ["Báo cáo (Report) → tuỳ chỉnh → xuất Google Docs → tải PDF", "Tổng quan bằng âm thanh (Audio Overview) 8–10 phút làm bản nghe kèm"],
    prompt:
      "Viết cẩm nang tiếng Việt tên “Nghỉ 3 ngày, cơ sở vẫn chạy” cho chủ xưởng xe, spa, gym 30–55 tuổi. Bố cục: (1) 3 câu tự kiểm tra; (2) vì sao chủ càng giỏi cơ sở càng phụ thuộc; (3) 3 bước chuẩn hóa vận hành, mỗi bước có việc làm ngay trong tuần; (4) ví dụ từ ca hệ sinh thái AP; (5) checklist 1 trang để in; (6) lời mời làm Kiểm tra 60 giây và buổi chẩn đoán 15 phút miễn phí. Câu ngắn, xưng “anh chị”. Chỉ dùng số liệu có trong nguồn.",
    articles: ["he-thong-van-hanh-khi-chu-vang-mat", "chuan-hoa-van-hanh-co-so-dich-vu", "bay-tu-doanh-chu-co-so-dich-vu", "ap-luc-nguoi-lam-chu-doanh-nghiep"],
    cases: ["johnny-loc-nguyen-he-sinh-thai-ap"],
  },
  {
    id: "giu-khach-cu",
    title: "7 việc giữ khách cũ quay lại",
    format: "Checklist + infographic dọc 1 trang",
    insight: "Khách làm xong là đi; phải gọi nhắc mới quay lại.",
    tools: ["Infographic (dạng dọc, tiếng Việt)", "Báo cáo ngắn dạng checklist để in"],
    prompt:
      "Tạo infographic dọc tiếng Việt “7 việc giữ khách cũ quay lại” cho cơ sở dịch vụ (xưởng xe, spa, gym). Mỗi việc 1 dòng tiêu đề + 1 câu làm thế nào + thời điểm (ngay sau dịch vụ / 3 ngày / 30 ngày…). Dẫn chứng: AP Car Care có hơn 60% doanh thu từ khách quay lại (số liệu trong nguồn). Cuối: “Kiểm tra cơ sở 60 giây — triduccar.media/vi/kiem-tra-co-so”. Không thêm số liệu ngoài nguồn.",
    articles: ["chuan-hoa-kenh-online-ap-car-care"],
    cases: ["ap-car-care"],
  },
  {
    id: "dung-du-deu",
    title: "Marketing “Đúng – Đủ – Đều”",
    format: "Slide 10–12 trang (PDF)",
    insight: "Quảng cáo tốn tiền mà khách mới không đều.",
    tools: ["Bản trình bày (Slide Deck)", "Video tổng quan (Video Overview) 3–5 phút để đăng YouTube/Facebook"],
    prompt:
      "Tạo bộ slide tiếng Việt “Marketing Đúng – Đủ – Đều cho xưởng xe, spa, gym”: vì sao quảng cáo càng chạy càng đắt mà không ra đơn; Đúng (đúng khách, đúng kênh), Đủ (bao nhiêu nội dung/tuần là đủ), Đều (giữ nhịp thế nào khi chủ bận); ví dụ Khang Vũ Auto Care (lượt xem Facebook 292 → hơn 20.000 sau 2 tháng) và Apex Autocare; slide cuối mời Kiểm tra 60 giây (ghi link bằng chữ: triduccar.media/vi/kiem-tra-co-so — không vẽ mã QR) và buổi chẩn đoán 15 phút miễn phí (Zalo 076.991.8685). Mỗi slide tối đa 25 chữ + 1 hình minh hoạ. Không vẽ khuôn mặt người thật, không thêm số liệu hay nhãn ngoài nguồn.",
    articles: ["marketing-dung-du-deu-xuong-xe-spa-gym", "quang-cao-khong-ra-don-nguyen-nhan", "he-thong-marketing-cho-chu-co-so"],
    cases: ["khang-vu-auto-care", "apex-autocare"],
  },
  {
    id: "kenh-online-1-nguoi",
    title: "Kênh online khi chỉ có 1 người làm",
    format: "Infographic 1 trang + sơ đồ tư duy",
    insight: "Thuê 1 người content mà kênh vẫn thất thường.",
    tools: ["Infographic", "Sơ đồ tư duy (Mind Map) chụp lại làm hình đăng fanpage"],
    prompt:
      "Tạo infographic tiếng Việt “Kênh online khi cơ sở chỉ có 1 người làm”: mỗi tuần đăng gì (bao nhiêu bài/video), ở đâu (Facebook, TikTok, YouTube, Google), ai duyệt, chủ chỉ cần làm gì 15 phút/tuần. Dẫn chứng từ Học viện Detailing Việt Nam và bài “Một nhân sự content có thật sự phải làm tất cả?”. Chỉ dùng số liệu trong nguồn.",
    articles: ["nhan-su-content-lam-gi", "chuan-hoa-kenh-online-ap-car-care"],
    cases: ["hoc-vien-detailing-viet-nam"],
  },
  {
    id: "so-lieu-1-trang",
    title: "Bảng số liệu tuần 1 trang",
    format: "Checklist + mẫu bảng (in / Google Sheet)",
    insight: "Không rõ tháng này lời bao nhiêu, khách đến từ đâu.",
    tools: ["Báo cáo (Report) dạng hướng dẫn + bảng mẫu", "Gửi lại cho Claude để dựng file Google Sheet mẫu"],
    prompt:
      "Viết hướng dẫn tiếng Việt “Bảng số liệu tuần 1 trang” cho chủ cơ sở dịch vụ: 8–10 con số nên ghi mỗi tuần (doanh thu, số khách mới/cũ, khách từ kênh nào, chi phí quảng cáo, chi phí lớn…), cách đọc trong 10 phút, 3 dấu hiệu cần hành động ngay, và lúc nào nên mở chi nhánh thứ hai. Kèm bảng mẫu dạng cột. Chỉ dùng số liệu trong nguồn.",
    articles: ["mo-chi-nhanh-thu-hai-khi-nao", "chuan-hoa-van-hanh-co-so-dich-vu"],
    cases: ["ap-car-care"],
  },
  {
    id: "5-truc-poster",
    title: "Poster 5 trục sức khỏe cơ sở",
    format: "Poster A3 dọc để in treo quầy",
    insight: "Chủ và quản lý không có chung thước đo.",
    tools: ["Infographic (dạng poster dọc)"],
    prompt:
      "Tạo poster dọc tiếng Việt “5 trục sức khỏe cơ sở” theo khung trong nguồn “Nền chung”: mỗi trục 1 câu hỏi + thang 0–3 có mô tả ngắn từng mức; ô ghi điểm từng tháng; dòng cuối “Làm online: triduccar.media/vi/kiem-tra-co-so”. Ít chữ, dễ đọc từ 2 mét.",
    articles: ["he-thong-van-hanh-khi-chu-vang-mat"],
    cases: [],
  },
  {
    id: "chu-co-so-hoi",
    title: "Podcast: Chủ cơ sở hỏi – anh Đức trả lời",
    format: "Chuỗi audio 5 tập × 8–12 phút",
    insight: "Không có thời gian đọc; nghe trên đường đi làm.",
    tools: ["Tổng quan bằng âm thanh (Audio Overview) — mỗi tập 1 notebook / 1 trục, ngôn ngữ Tiếng Việt, chế độ “Deep dive”"],
    prompt:
      "Tạo tập podcast tiếng Việt dạng 2 người trò chuyện cho chủ xưởng xe, spa, gym. Chủ đề tập: <điền trục, vd “Nghỉ 3 ngày mà cơ sở vẫn chạy”>. Mở đầu bằng 1 câu hỏi thật của chủ cơ sở, giải thích bằng ví dụ trong nguồn, kết thúc bằng 3 việc làm ngay tuần này và lời mời làm Kiểm tra 60 giây. Không bịa số liệu.",
    articles: articles.map((a) => a.slug),
    cases: cases.map((c) => c.slug),
  },
];

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "00-nen-chung.md"), SHARED);
for (const g of GIFTS) {
  const sources = [...g.articles.map(articleText), ...g.cases.map(caseText)].filter(Boolean).join("\n---\n\n");
  fs.writeFileSync(
    path.join(OUT, `${g.id}.md`),
    `# ${g.title}\n\n- **Định dạng:** ${g.format}\n- **Nỗi đau khách:** ${g.insight}\n- **Tạo bằng NotebookLM:** ${g.tools.join("; ")}\n- **Nguồn cần tải lên:** \`00-nen-chung.md\` + file này\n- **Trên web:** quà trong Thư viện quà (lib/gifts.ts id \`${g.id}\`), hiện ở kết quả Kiểm tra 60 giây\n\n## Prompt dán vào NotebookLM\n\n> ${g.prompt}\n\n## Văn bản nguồn\n\n${sources}`,
  );
}
console.log(`wrote ${GIFTS.length + 1} files to ${OUT}`);
