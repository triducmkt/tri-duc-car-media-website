# Hệ thống font chuẩn — Trí Đức Car Media (Master Font System)

> **Nguồn duy nhất:** `lib/fonts.ts`. Mọi agent đọc file này **trước khi sửa giao diện**,
> và chạy `npm run fonts:check` trước khi commit. Cập nhật: 2026-11-08 (bộ font v3).

## 1. Bộ font đang dùng (5 vai trò, 3 họ font)

Gốc là 2 giọng đã chốt ở logo v12a + lockup hero (`docs/DESIGN-CORE-RULES.md`): **Playfair Display** (giọng chính) và **Great Vibes** (giọng phụ). Thêm đúng **một** font sans để đọc và làm UI.

| Vai trò | Font | Biến CSS | Class Tailwind | Weight | Dùng cho |
|---|---|---|---|---|---|
| **body** | **Commissioner** (variable 100–900) | `--tdcm-font-body` | `font-sans` (mặc định của `<body>`) | đoạn văn 400 · menu/nhãn 600 · nút 700 | Đoạn văn, form, nút, menu |
| **display** | Commissioner (cùng file với body) | `--tdcm-font-display` | `font-display` | 600–800 | Con số, giá, chỉ số, eyebrow, nhãn, badge, canvas/three.js. **Không** dùng cho h1–h3 |
| **serif** | **Playfair Display** (variable 400–900 + italic) | `--tdcm-font-serif` | `font-serif` | tiêu đề 600–700 · trích dẫn italic | **Mọi tiêu đề h1–h3** (chữ thường đầu câu), `SectionHeading`, câu tuyên ngôn, trích dẫn |
| **lockup** | Playfair Display 900 (dùng chung file serif) | `--tdcm-font-serif` | `font-lockup` | 900 | **Chỉ** dòng chính IN HOA của lockup C, qua `<Lockup>` |
| **script** | **Great Vibes** | `--tdcm-font-script` | `font-script` | 400 | **Chỉ** dòng thư pháp của lockup C (và chữ "media" của logo) |

Great Vibes tải với `preload: false` (trang không có lockup không tải). Cỡ lockup không đặt tay: theo quy tắc V1/V1b/V8 trong `docs/DESIGN-CORE-RULES.md`, sinh bởi `npm run lockup:qc`.
Cả 3 họ đều **có subset `vietnamese`**, tự host qua `next/font`.

### Vì sao bộ v3 (08/11/2026)
- **Một giọng serif cho toàn web:** tiêu đề dùng cùng Playfair Display với lockup và logo → web, logo, video nói chung một ngôn ngữ chữ. Thứ bậc: lockup (900 IN HOA) > tiêu đề (700 chữ thường) > chữ thân sans.
- **Commissioner thay Mona Sans:** Mona Sans (font của GitHub) và các grotesk "an toàn" khác rất hay gặp ở web dựng bằng AI/template. Commissioner là grotesk tương phản thấp, có chút nét cổ điển hợp với Playfair, thiết kế có dấu tiếng Việt chồng gọn, ít web dùng.
- **Bỏ Source Serif 4:** 2 font serif khác nhau trên cùng trang làm loãng nhận diện; Playfair italic đảm nhận trích dẫn.
- Từ 4 họ font xuống 3 họ.

### Lịch sử quyết định
- **2026-11-08 (bộ v3, anh Đức: "dàn font phụ mới, premium, không giống trang AI"):** Mona Sans + Source Serif 4 → **Commissioner** (body, display) + **Playfair Display** (serif, mọi tiêu đề h1–h3); lockup dùng chung file Playfair; Great Vibes giữ. Đổi tiêu đề từng trang: trang chính (Trang chủ, Dịch vụ, Về Founder) trước, trang phụ (Dự án, Kiến thức, Đặt lịch, Kiểm tra 60s, Liên hệ, 404) sau.
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
