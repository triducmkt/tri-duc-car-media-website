# Hệ thống font chuẩn — Trí Đức Car Media (Master Font System)

> **Nguồn duy nhất:** `lib/fonts.ts`. Mọi agent đọc file này **trước khi sửa giao diện**,
> và chạy `npm run fonts:check` trước khi commit. Cập nhật: 2026-11-03.

## 1. Bộ font đang dùng (3 vai trò)

| Vai trò | Font | Biến CSS | Class Tailwind | Weight | Dùng cho |
|---|---|---|---|---|---|
| **body** | Noto Sans | `--tdcm-font-body` | `font-sans` (mặc định của `<body>`) | 400 · 500 · 600 · 700 | Đoạn văn, form, nút, menu, nhãn nhỏ |
| **display** | Plus Jakarta Sans | `--tdcm-font-display` | `font-display` | 500 · 600 · 700 · 800 | H1–H3, con số lớn, eyebrow, badge, canvas/three.js |
| **serif** | Source Serif 4 (variable, trục `opsz`) | `--tdcm-font-serif` | `font-serif` | variable 200–900 (+ italic) | Câu tuyên ngôn thương hiệu, tên founder, `SectionHeading serif`, trích dẫn |

Cả 3 font đều **có subset `vietnamese`** trên Google Fonts, tự host qua `next/font`
(không gọi Google lúc chạy, không nháy font).

### Vì sao chọn bộ này (thay Inter + Be Vietnam Pro + Playfair Display)
- **Nhất quán:** trước đây 1 trang trộn 3 họ chữ (H1 Playfair, H3 Be Vietnam Pro, nút Inter).
  Giờ mỗi vai trò đúng 1 font, gọi qua vai trò.
- **Noto Sans (body):** Google thiết kế với tiếng Việt đầy đủ. Dấu chồng (ế, ữ, ặ) rõ nhất
  ở cỡ 14–16 px, x-height cao, dễ đọc với chủ doanh nghiệp 40–55 tuổi.
- **Plus Jakarta Sans (display):** giọng B2B hiện đại, cao cấp, gọn hơn Be Vietnam Pro nên tiêu đề
  tiếng Việt dài ít xuống dòng. Dấu chữ hoa (Ấ, Ổ, Ữ) đặt gọn. Khác font của đối thủ trực tiếp
  (Base.vn và MISA dùng Inter, MONA dùng Be Vietnam Pro).
- **Source Serif 4 (serif):** nét chắc, tương phản thấp, mang giọng "báo cáo tư vấn" đáng tin.
  Playfair tương phản quá cao, nét mảnh làm dấu tiếng Việt mờ ở cỡ nhỏ và trông như "tạp chí thời trang".

## 2. Quy tắc dùng (bắt buộc)
1. **Không bao giờ ghi tên font** trong component/CSS. Dùng class `font-sans` / `font-display` /
   `font-serif`, hoặc `var(--tdcm-font-body|display|serif)` trong CSS module.
2. **Canvas / three.js** (không dùng được class): `fontStack("display" | "body" | "serif")` từ `lib/fontStack.ts`.
3. **Không import `next/font`** ngoài `lib/fonts.ts`.
4. **Line-height cho chữ có dấu:** tiêu đề tiếng Việt ≥ `1.15` (`leading-tight` hoặc thoáng hơn).
   `leading-none` chỉ dùng cho con số / chữ không dấu.
5. **Eyebrow chữ hoa:** `text-xs font-semibold uppercase tracking-[0.14em–0.2em]`. Dấu chữ hoa cần
   khoảng thở: không đặt eyebrow sát tiêu đề với `leading-none`.
6. **Serif chỉ để nhấn:** tối đa 1 câu serif mỗi màn hình. Không dùng serif cho đoạn văn hay nút.
7. **Weight:** chỉ dùng các weight đã nạp ở bảng trên (weight khác sẽ bị trình duyệt giả lập, chữ xấu).
8. **Trục `axes` (vd `opsz`) chỉ dùng với font variable:** khi khai báo `axes` thì KHÔNG khai báo `weight` (next/font báo lỗi "Axes can only be defined for variable fonts", cả trang trắng).

## 3. Cách đổi font sau này
1. Chọn font trong "băng ghế dự bị" (mục 4) hoặc font Google khác có subset `vietnamese`.
2. Sửa loader tương ứng trong `lib/fonts.ts` (giữ nguyên tên `variable`) và dòng `FONT_ROLES` cùng vai trò.
3. `npm run fonts:check`, rồi `npm run build`, rồi xem lại trang chủ, Dịch vụ, Dự án, Đặt lịch, Founder
   (desktop và mobile 375px).
4. Không cần sửa component nào: mọi nơi đã gọi qua vai trò.

## 4. Băng ghế dự bị — font đã kiểm tra có tiếng Việt (2026-11-03)
Đã xác minh subset `vietnamese` trong dữ liệu font của Next.js và render thử câu
"TƯ VẤN · ẤN TƯỢNG · Ưu tiên, Ổn định, Ữ ẵ ỗ ợ".

| Vai trò | Font | Nhận xét khi render |
|---|---|---|
| display | **Manrope** | Gần Jakarta, hơi "kỹ thuật"; dấu gọn |
| display | **Mona Sans** | Grotesk sắc, giọng tech/SaaS; có trục độ rộng |
| display | **Inter Tight** | Gọn nhất, hợp tiêu đề rất dài |
| display | Montserrat | Rộng, dấu đẹp nhưng phổ biến ở SME VN (ít khác biệt) |
| display | Be Vietnam Pro | Font cũ: thiết kế cho tiếng Việt, rộng, đậm |
| display | Lexend / Bricolage Grotesque | Quá rộng / quá cá tính cho tư vấn B2B |
| body | **Inter** | Font body cũ: sắc, trung tính |
| body | **Source Sans 3** | Gọn, rất dễ đọc khi chữ dày |
| body | Public Sans / Nunito Sans | Trung tính / mềm, thân thiện |
| serif | **Newsreader** | Báo chí thanh lịch, dấu tốt |
| serif | **Literata** | Chắc, kiểu sách |
| serif | Lora / Fraunces / Noto Serif Display | Mềm / cá tính / tương phản cao |
| serif | Playfair Display | Font cũ: tương phản rất cao, dấu mảnh ở cỡ nhỏ |

## 5. Kiểm tra tự động — `npm run fonts:check`
Script `scripts/check-fonts.mjs` sẽ báo lỗi (exit 1) nếu:
- Font trong `lib/fonts.ts` thiếu subset `vietnamese`, không có tiếng Việt trên Google, sai tên biến
  vai trò, nạp weight không tồn tại, hoặc lệch bảng `FONT_ROLES`.
- Trong `app/`, `components/`, `lib/` có: `import next/font`, tên font Google ghi cứng, biến cũ
  (`--font-inter`, `--font-be-vietnam-pro`, `--font-playfair`, `--td-sans`, `--td-serif`), hoặc
  `font-family` không đi qua vai trò.
