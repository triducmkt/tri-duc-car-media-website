# Nhu cầu thiết kế & phong cách mong muốn — anh Đức

> Ghi lại nguyên ý anh Đức để mọi agent **đối chiếu** khi review / cải tiến website.
> Thứ tự ưu tiên khi mâu thuẫn: lời anh Đức mới nhất → `docs/DESIGN-CORE-RULES.md` → file này.
> Ảnh tham khảo: [`design/references/2026-11-12-business-suite-style.png`](../design/references/2026-11-12-business-suite-style.png) (icon Business Suite: dải xanh nhạt → đậm trên khối trắng bo tròn, nền mesh pastel phía sau).

---

## 1. Brief ngày 12/11/2026 (nguyên văn ý anh Đức)

> "A thích màu xanh với phong cách thiết kế này. A muốn áp dụng cho website triduccar.media."

Phong cách hợp với triduccar.media: hơi hướng công nghệ, hiện đại, tạo cảm giác tin cậy rất cao. Hợp với agency tư vấn quản trị, hệ thống marketing và coaching doanh nghiệp B2B. Phối màu: dải gradient xanh dương đậm/nhạt rực rỡ trên nền trắng sắc nét, phía sau là nền mờ (mesh gradient) êm dịu.

### 1.1 Tổng quan
- **Vibe:** Modern Minimalist, Tech-Forward, Corporate Trust, chút Glassmorphism.
- **Ngành:** tư vấn dịch vụ ô tô B2B, hệ thống marketing, vận hành doanh nghiệp.
- **Cảm hứng:** giao diện app hiện đại. Thẻ trắng sạch đặt trên nền gradient dịu, điểm nhấn là dải xanh dương rực.

### 1.2 Bảng màu
- **Gradient thương hiệu:**
  - Deep Royal Blue `#015CE0`: điểm nhấn mạnh, đuôi dải màu.
  - Bright Tech Blue `#4285F4` (hoặc `#00C6FF`): đầu dải màu.
  - Dùng dải nhạt → đậm cho nút CTA chính, icon dịch vụ, đường viền nổi bật.
- **Nền:**
  - Off-white `#F8F9FA` / trắng `#FFFFFF` cho thẻ nội dung.
  - Nền không gian: mesh gradient pastel (tím nhạt, xanh dương nhạt, hồng phấn) cho Hero hoặc Footer.
- **Chữ:**
  - Tiêu đề H1–H3: đen đậm `#1A1A1A`.
  - Đoạn phụ: xám đậm `#4A4A4A` / `#6B7280`.

### 1.3 Thành phần giao diện
- **Hình khối:** bo tròn kiểu "squircle", `border-radius` 16–24px cho nút, khung ảnh, thẻ dịch vụ.
- **Đổ bóng:** mờ, rộng (`0 10px 30px rgba(0,0,0,0.05)`); thẻ trắng như đang nổi nhẹ trên nền.
- **Kính mờ:** navbar / pop-up nền trắng trong suốt `rgba(255,255,255,0.7)` + `backdrop-filter: blur(12px)`.

### 1.4 Dàn trang gợi ý
- **Hero:** nền mesh gradient dịu, tiêu đề đen đậm lớn ở giữa, nút "Nhận tư vấn" / "Khám phá SME OS" gradient xanh rất nổi.
- **Dịch vụ:** nền off-white. Các gói dịch vụ nằm trong thẻ trắng bo tròn, bóng nhẹ, icon gradient xanh.
- **Khoảng trắng:** padding/margin lớn giữa các phần, web "dễ thở", tập trung nội dung chuyên môn.

---

## 2. Đối chiếu với website hiện tại (Claude Code, 12/11/2026)

| Hạng mục | Brief | Web trước 12/11 | Quyết định |
|---|---|---|---|
| Gradient nút CTA | `#4285F4` → `#015CE0` (nhạt → đậm) | `#6EA6F7` → `#4285F4` → `#2F6FE0` (dọc) | ✅ Đổi sang `#4285F4` → `#015CE0` chéo 135°. Thêm token `brand-800 #015CE0` |
| Icon dịch vụ | Gradient xanh | Ô xanh nhạt 10% + icon xanh | ✅ Ô icon gradient `#4285F4` → `#015CE0`, icon trắng |
| Thẻ nội dung | Trắng, bo 16–24px, bóng rất nhẹ `0 10px 30px` 5% | Trắng, bo 16px, viền gradient xanh → lá + bóng ám xanh khá đậm | ✅ Thẻ trắng sạch, viền mảnh trung tính, bóng mềm. Viền xanh chỉ hiện khi rê chuột ("đường viền nổi bật") |
| Nền khối sáng | Mesh pastel tím / xanh / hồng | Loang xanh dương + xanh lá rất nhẹ | ✅ Đổi loang sang mesh pastel: xanh nhạt, tím nhạt, hồng phấn (màu trang trí, thuộc 5% "màu khác") |
| Navbar | Kính mờ trắng 70% + blur 12px | Đã có `header-glass` (trắng 72% + blur 16px) | ✓ Giữ |
| Chữ tiêu đề | Đen `#1A1A1A` | Ink `#0B1220` (đen ám xanh navy) | ✓ Giữ ink: gần như đen, đồng bộ logo |
| Chữ phụ | `#4A4A4A` / `#6B7280` | `#4B5568` | ✓ Giữ, đã trong khoảng |
| Khoảng trắng | Lớn | Section 80–112px | ✓ Giữ |
| **Hero** | Nền mesh sáng, chữ đen giữa trang | **Nền navy tối + video tư liệu**, chữ trắng, lockup Playfair + thư pháp | ⏳ **Chờ anh Đức chốt.** Đổi hero sang nền sáng là thay đổi lớn: lockup đang tối ưu cho nền tối, và quy cách màu có "đen 30%" |
| Footer | Có thể mesh pastel | Navy tối + dải gradient | ⏳ Chờ chốt cùng hero |
| Font | (brief không nêu) | Playfair Display + Great Vibes + Commissioner | ✓ Giữ (đã chốt 08/11) |

**Màu mới được phép** (thêm vào `docs/color-system.md`, `scripts/check-colors.mjs`):
- `brand-800 #015CE0`;
- 3 màu mesh trang trí `#E6EEFF` (xanh nhạt), `#EEE8FF` (tím nhạt), `#FDEAF2` (hồng phấn). Chỉ dùng làm nền loang, không dùng cho chữ, nút hay icon.
