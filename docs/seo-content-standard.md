# Tiêu chuẩn SEO cho bài viết "Kiến thức" — Trí Đức Car Media

> Áp dụng cho mọi bài trong `/kien-thuc`, gồm bài chuyển từ fanpage
> https://www.facebook.com/triduccar.media. Script `npm run blog:check` kiểm tra tự động
> các mục đánh dấu ⚙️. Bài không đạt thì **không được nhập** vào website. Cập nhật: 2026-11-03.

## 1. Chân dung người đọc & ý định tìm kiếm
- Chủ SME / hộ kinh doanh 30–55 tuổi ở TP.HCM, tìm cách **bớt ôm việc, có khách đều, vận hành không phụ thuộc chủ**.
- Mỗi bài trả lời **một câu hỏi** người đọc gõ lên Google, ví dụ "cách chuẩn hóa quy trình tiệm rửa xe",
  "thuê phòng marketing thuê ngoài giá bao nhiêu". Câu trả lời nằm ngay trong 2–3 câu đầu.

## 2. Từ khóa
- ⚙️ **1 từ khóa chính** (`focusKeyword`), 2–4 từ, tiếng Việt có dấu, đúng cách khách hàng nói.
- ⚙️ Từ khóa chính có trong: **SEO title, meta description, đoạn mở đầu và slug** (bản không dấu).
- 2–6 từ khóa phụ / thẻ (`tags`) ⚙️, rải tự nhiên trong H2 và thân bài. Không nhồi: từ khóa chính
  xuất hiện khoảng 3–6 lần trong một bài 600–1.000 chữ.

## 3. Thẻ tiêu đề & mô tả
| Thành phần | Quy chuẩn |
|---|---|
| H1 (tiêu đề bài) ⚙️ | ≤ 90 ký tự, có lợi ích hoặc con số, viết hoa kiểu câu (không VIẾT HOA TOÀN BỘ như caption Facebook) |
| SEO title ⚙️ | ≤ 60 ký tự, từ khóa đứng đầu. Ví dụ: "Chuẩn hóa quy trình SME: 3 việc làm trong tháng 11" |
| Meta description ⚙️ | 120–160 ký tự, có từ khóa và lời hứa / kêu gọi hành động |
| Slug ⚙️ | không dấu, chữ thường, nối bằng `-`, ≤ 8 từ, có từ khóa: `chuan-hoa-quy-trinh-sme-thang-11` |
| Sapo (excerpt) ⚙️ | ≥ 80 ký tự, tóm tắt "đọc xong được gì", dùng trên thẻ bài và Open Graph |

## 4. Cấu trúc nội dung
- ⚙️ **≥ 300 chữ** (mục tiêu 600–1.000). Caption Facebook ngắn được **mở rộng**: thêm bối cảnh, ví dụ từ dự án
  thật (AP Car Care, Khang Vũ, Apex…), các bước làm cụ thể.
- ⚙️ **≥ 2 thẻ H2**, chia theo ý: Vấn đề → Nguyên nhân → Cách làm (các bước) → Kết quả / ví dụ → Bước tiếp theo.
  H3 cho bước con. Không nhảy cấp (H2 rồi mới đến H3).
- ⚙️ Đoạn văn **≤ 90 chữ**, mỗi đoạn một ý. Ưu tiên gạch đầu dòng cho danh sách, checklist.
- Đoạn mở đầu ⚙️ có từ khóa chính và trả lời thẳng câu hỏi.
- Kết bài: tóm tắt 1–2 câu. CTA "Đặt lịch 1-1 miễn phí / Nhắn Zalo" đã gắn sẵn ở cuối mọi bài.

## 5. Hình ảnh
- ⚙️ Ảnh bìa bắt buộc, **alt ≥ 10 ký tự**: mô tả đúng nội dung ảnh, có từ khóa khi tự nhiên.
- Ảnh trong bài lấy từ chính bài fanpage, mỗi ảnh có alt + chú thích ⚙️.
- Ảnh được nén và đổi cỡ tự động qua Sanity CDN (WebP/AVIF), có `width/height` để không xô lệch layout.

## 6. Liên kết
- ⚙️ **Nội bộ:** mỗi bài ≥ 2 liên kết nội bộ phù hợp (viết dạng `[chữ](/vi/dich-vu)` trong posts.json): trang Dịch vụ, Dự án / case study liên quan, Đặt lịch.
  Khối "Bài viết liên quan" (cùng chuyên mục) tự hiển thị.
- **Bài gốc:** ⚙️ `sourceUrl` trỏ về bài trên fanpage (hiện link "Xem bài gốc") để Google và người đọc thấy nguồn gốc.

## 7. Kỹ thuật (đã dựng sẵn trong code)
- `<title>` + meta description riêng từng bài; canonical; hreflang vi/en + x-default.
- Open Graph (ảnh 1200×630) và Twitter card khi chia sẻ Zalo / Facebook.
- JSON-LD **BlogPosting** (tác giả, ngày đăng, ngày sửa, ảnh, chuyên mục, `isBasedOn` = bài fanpage)
  + **BreadcrumbList**. Toàn site có JSON-LD **Organization** (tên pháp lý, MST, địa chỉ, fanpage).
- Breadcrumb hiển thị, ngày đăng, thời gian đọc, tác giả (E-E-A-T: kinh nghiệm thật của founder).
- Bài tự vào `sitemap.xml`.

## 8. Quy trình chuyển bài fanpage thành bài SEO
1. Lấy nội dung gốc + ảnh + ngày đăng + link bài.
2. Chọn ý định tìm kiếm và từ khóa chính, đặt chuyên mục.
3. Viết lại: tiêu đề kiểu câu (bỏ viết hoa toàn bộ và emoji ở tiêu đề), mở rộng thành bài có H2 / bước làm / ví dụ.
   **Giữ nguyên ý, số liệu và giọng của anh Đức**; không bịa số liệu. Hashtag thành `tags`; SĐT / Zalo trong caption
   được thay bằng khối CTA chuẩn.
4. Ghi vào `content/fanpage-posts/posts.json`, ảnh vào `content/fanpage-posts/images/`.
5. `npm run blog:check` phải xanh hết, rồi `npm run blog:import`.
6. **Bắt buộc deploy lại** (push lên `main` hoặc chạy lại workflow Deploy). Các trang build tĩnh nên bài mới chỉ hiện sau khi build. Build ở máy local: xóa `.next/cache/fetch-cache` trước (cache dữ liệu Sanity 1 năm), máy ít RAM dùng `NEXT_BUILD_CPUS=2`.
