# Quy cách màu sắc — Trí Đức Media (Color System)

> **Quy cách chung của toàn dự án** — anh Đức chốt 2026-11-05. Mọi agent đọc file này
> **trước khi sửa giao diện** và chạy `npm run colors:check` trước khi commit.
> Nguồn token duy nhất: `app/globals.css` (`:root`).

## 1. Tỉ lệ màu

| Màu | Mã | Tỉ lệ | Token Tailwind | Dùng cho |
|---|---|---|---|---|
| **Xanh dương (chủ đạo)** | `#4285F4` | **30%** | `brand-50…700` (`brand-500` = #4285F4) | Nút chính, link, eyebrow, điểm nhấn, số liệu nổi bật, hiệu ứng 3D |
| **Đen** | `#0B1220` (ink) | **30%** | `ink`, `ink-soft`, `ink-muted` | Section nền tối, chữ chính |
| **Trắng** | `#FFFFFF` | **25%** | `paper`, `paper-soft` | Section nền sáng, chữ trên nền tối |
| **Xanh lá** | `#17A85A` | **10%** | `leaf-400/500/600` | Chỉ khi mang nghĩa **tích cực**: tăng trưởng, tiết kiệm, thành công, đang hoạt động, dấu tích |
| **Màu khác** | — | **5%** | `mesh-sky #E6EEFF` · `mesh-lilac #EEE8FF` · `mesh-blush #FDEAF2` (từ 12/11/2026) | Trang trí hoặc điểm nhấn thật cần thiết. 3 màu mesh pastel **chỉ** làm nền loang của khối sáng. Đỏ chỉ cho cảnh báo / lỗi / điểm yếu |

**Bổ sung 12/11/2026 (brief anh Đức, `docs/DESIGN-BRIEF.md`):** `brand-800 #015CE0` (Deep Royal Blue) là đuôi của dải gradient nút CTA và icon: `--gradient-button` / `--gradient-icon` = `#4285F4 → #015CE0` (135°).

Mã xanh lá: anh Đức quên mã nên dùng xanh lá của logo v10 (`#17A85A`). Anh Đức có thể đổi —
chỉ cần sửa `--color-leaf-*` trong `app/globals.css`.

> **12/11/2026:** anh Đức chọn hướng nền sáng (hero trang chủ + footer mesh pastel, `docs/DESIGN-BRIEF.md`). Tỷ lệ "đen 30%" ở trên giờ là **tối đa**, không còn là mục tiêu: đen dùng cho chữ và các khối tối xen kẽ giữa trang, không cho hero/footer.

## 2. Chọn sắc độ

| Nền | Chữ / icon xanh dương | Chữ / icon xanh lá |
|---|---|---|
| Tối (`bg-ink`) | `text-brand-400` (#6EA6F7) hoặc `brand-300` | `text-leaf-400` |
| Sáng (`bg-paper`) | `text-brand-600` (#2F6FE0, đạt AA) | `text-leaf-600` |
| Nút đặc | `bg-brand-500 text-ink` hoặc `text-white` (chữ ≥ 16px đậm) | `bg-leaf-500 text-ink` |

three.js / canvas: dùng đúng các mã trên (`0x4285f4`, `0x6ea6f7`, `0x8fb6f9`, `0x45d17f`, `0x0b1220`).

## 3. Quy tắc

1. Không thêm mã màu mới ngoài bảng trên. Cần màu mới → hỏi anh Đức, rồi thêm vào `app/globals.css` + file này + danh sách trong `scripts/check-colors.mjs`.
2. Không dùng bảng màu mặc định của Tailwind (`amber`, `emerald`, `sky`, `teal`…). Ngoại lệ: `red-*` cho lỗi/cảnh báo.
3. Xanh lá không dùng cho nút chính hay eyebrow thông thường — để giữ 10%.
4. Logo (`public/brand/*`) từ bản v11 (06/11/2026, commit c3999a6) đã dùng xanh `#4285F4` thống nhất với website. Thay đổi logo thuộc vòng thiết kế logo riêng (`design/logo-tri-duc-media/HISTORY.md`), chỉ làm khi anh Đức yêu cầu.

## 3b. Bóng & gradient dùng chung (06/11/2026)

Khai báo ở `app/globals.css`. Từ 08/11/2026 đã dùng cho F2/F3 (`docs/brand-backlog.md`); F9 (nút, header, footer) chưa làm.

**Class dùng chung (08/11/2026):**

| Class / component | Dùng cho |
|---|---|
| `card-premium` | Thẻ trắng trên nền sáng (cập nhật 12/11): viền mảnh trung tính, bóng mềm rộng `0 10px 30px` ~6%; rê chuột nâng lên và viền chuyển xanh. `is-static` = không nâng (form, khối lớn). Giữ bo góc, padding trong className của component. |
| `icon-gradient` | Ô icon dịch vụ / tính năng: nền gradient `#4285F4 → #015CE0`, icon trắng (12/11). |
| `surface-light` · `surface-light-soft` | Nền section sáng (trắng / xám rất nhạt) có mesh pastel (12/11): xanh nhạt góc trên trái, tím nhạt góc trên phải, hồng phấn góc dưới phải. Mép trên/dưới vẫn đúng màu nền nên ghép với `SectionSeam` không lộ vạch. |
| `<SectionSeam to="light"/"dark" light="paper"/"paper-soft" />` (`components/SectionSeam.tsx`) | Chèn giữa section tối và section sáng: nửa tối ink → ink-soft, nửa sáng ửng xanh nhạt, ở giữa có đường kẻ phát sáng. Không dùng dải chuyển xám (đã thử 08/11, nhìn đục). |

| Token | Dùng cho |
|---|---|
| `shadow-lift-1` · `shadow-lift-2` · `shadow-lift-3` (class Tailwind) | Bóng luôn hiện (không chỉ khi rê chuột), ám xanh thương hiệu; 1 = thẻ nhỏ, 2 = thẻ chính, 3 = khối nổi bật |
| `var(--gradient-brand)` | Dải xanh dương → xanh lá cho điểm nhấn nhỏ |
| `var(--gradient-border)` | Viền gradient của thẻ premium (dùng với `border: 1px solid transparent` + `border-box`) |
| `var(--gradient-hairline)` | Đường kẻ phát sáng giữa các khối trên nền tối |
| `var(--gradient-button)` | Nền nút chính |
| `var(--gradient-surface-light)` | Chỉ là 2 vùng loang màu (không có màu nền) — dùng qua class `surface-light` / `surface-light-soft` |

Chữ trên video / thumbnail / tiêu đề lớn: xem `docs/typography-lockup.md`.

## 4. Lịch sử
- Trước 2026-11-05: xanh Google `#4285F4` + vàng đồng `#F0C069`.
- 2026-11-05 (sáng, commit ba448f2): theo logo v10 — navy + xanh biển `#0A6FB8` + xanh lá làm điểm nhấn chính.
- **2026-11-05 (chiều): quy cách hiện hành** — xanh `#4285F4` 30% · đen 30% · trắng 25% · xanh lá 10% · khác 5%.
