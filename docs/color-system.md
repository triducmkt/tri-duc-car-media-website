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
| **Màu khác** | — | **5%** | (không có token chung) | Trang trí hoặc điểm nhấn thật cần thiết. Đỏ chỉ cho cảnh báo / lỗi / điểm yếu |

Mã xanh lá: anh Đức quên mã nên dùng xanh lá của logo v10 (`#17A85A`). Anh Đức có thể đổi —
chỉ cần sửa `--color-leaf-*` trong `app/globals.css`.

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
4. Logo (`public/brand/*`) vẫn là bản v10 (xanh biển `#0A6FB8` + xanh lá). Đổi màu logo thuộc vòng thiết kế logo riêng, chỉ làm khi anh Đức yêu cầu.

## 4. Lịch sử
- Trước 2026-11-05: xanh Google `#4285F4` + vàng đồng `#F0C069`.
- 2026-11-05 (sáng, commit ba448f2): theo logo v10 — navy + xanh biển `#0A6FB8` + xanh lá làm điểm nhấn chính.
- **2026-11-05 (chiều): quy cách hiện hành** — xanh `#4285F4` 30% · đen 30% · trắng 25% · xanh lá 10% · khác 5%.
