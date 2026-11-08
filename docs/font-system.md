# Hệ thống font chuẩn — Trí Đức Car Media (Master Font System)

> **Nguồn duy nhất:** `lib/fonts.ts`. Mọi agent đọc file này **trước khi sửa giao diện**,
> và chạy `npm run fonts:check` trước khi commit. Cập nhật: 2026-11-03.

## 1. Bộ font đang dùng (3 vai trò)

| Vai trò | Font | Biến CSS | Class Tailwind | Weight | Dùng cho |
|---|---|---|---|---|---|
| **body** | Mona Sans (variable, trục `wdth`) | `--tdcm-font-body` | `font-sans` (mặc định của `<body>`) | đoạn văn 400 · menu/nhãn 600 · nút 700 | Đoạn văn, form, nút, menu, nhãn nhỏ |
| **display** | Mona Sans (cùng họ với body) | `--tdcm-font-display` | `font-display` | tiêu đề 700–800 · eyebrow 700 | H1–H3, con số lớn, eyebrow, badge, canvas/three.js |
| **serif** | Source Serif 4 (variable, trục `opsz`) — **giữ nguyên, anh Đức đã duyệt** | `--tdcm-font-serif` | `font-serif` | variable 200–900 (+ italic) | Câu tuyên ngôn thương hiệu, `SectionHeading serif`, trích dẫn |
| **lockup** (từ 08/11/2026) | Playfair Display 900 | `--tdcm-font-lockup` | `font-lockup` | 900 | **Chỉ** dòng chính của lockup C, qua `<Lockup>` (`components/Lockup.tsx`) |
| **script** (từ 08/11/2026) | Great Vibes | `--tdcm-font-script` | `font-script` | 400 | **Chỉ** dòng thư pháp của lockup C, qua `<Lockup>` |

Hai vai trò lockup/script tải với `preload: false`: trang không có lockup không tải file font này.
Quy cách lockup và chỗ được dùng: `docs/typography-lockup.md` mục 11.

Cả 3 font đều **có subset `vietnamese`** trên Google Fonts, tự host qua `next/font`
(không gọi Google lúc chạy, không nháy font).

### Lịch sử quyết định
- **2026-11-03 (sáng):** Inter + Be Vietnam Pro + Playfair Display → Noto Sans + Plus Jakarta Sans + Source Serif 4.
- **2026-11-03 (chiều), phản hồi anh Đức:** serif Source Serif 4 "đã chuẩn doanh nghiệp B2B" nên **giữ**.
  Hai font không chân (Noto Sans, Plus Jakarta) "chưa premium, thiếu đậm ở nút bấm và thanh menu", nên
  thay cả hai bằng **Mona Sans**. Đồng thời menu lên 600, nút lên 700, thanh hành động mobile 650.

### Vì sao Mona Sans
- Grotesk sắc, nét đậm 700–800 chắc, tạo cảm giác "pro / premium" như các thương hiệu công nghệ lớn
  (là font thương hiệu của GitHub). Dùng một họ sans cho toàn site nên giọng thống nhất; serif tạo tương phản.
- Gọn bề ngang: menu không xuống dòng, tiêu đề tiếng Việt dài ít dòng hơn Montserrat.
- Dấu tiếng Việt (Ấ, Ổ, Ữ, ặ) gọn, rõ ở cả cỡ 14 px.
- Là font variable (wght 200–900, wdth 75–125): có đủ mọi độ đậm, không bị trình duyệt giả lập đậm.
- Đã so cùng thanh menu, nút, tiêu đề thật của site với Montserrat (quá rộng, menu xuống dòng),
  Inter Tight (đoạn văn chật), Hanken Grotesk, Manrope (tròn, kém premium), Archivo.
- **Source Serif 4 (serif):** nét chắc, tương phản thấp, mang giọng "báo cáo tư vấn" đáng tin.

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
| display | **Inter Tight** | Gọn, mạnh, chuyên nghiệp; đoạn văn hơi chật nên chỉ hợp tiêu đề |
| display | **Hanken Grotesk** | Grotesk sạch, đậm đẹp; ứng viên thay Mona Sans |
| display | Montserrat | Đậm, sang nhưng rất rộng (menu, tiêu đề xuống dòng); phổ biến ở SME VN |
| display | Manrope | Tròn, "kỹ thuật", kém premium (anh Đức đánh giá) |
| display | Plus Jakarta Sans | Đã dùng sáng 2026-11-03; anh Đức thấy chưa premium, thiếu đậm |
| body | Noto Sans | Đã dùng sáng 2026-11-03; rất dễ đọc nhưng nhạt |
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
