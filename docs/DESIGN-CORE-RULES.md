# Bộ quy tắc cốt lõi thiết kế — Trí Đức Media (website, logo, video)

> **BẮT BUỘC ĐỌC ĐẦU TIÊN.** Anh Đức chốt 08/11/2026. Mọi agent (Claude, Codex, Antigravity…),
> **mỗi lần sửa hoặc cải thiện website** (giao diện, chữ, ảnh, logo, template), phải đọc hết file này
> **trước khi suy nghĩ, đánh giá và làm**. Quy tắc ở đây đứng trên thói quen thiết kế riêng của từng agent.
> Chi tiết từng mảng nằm ở các file được dẫn link; file này là bản tóm tắt bắt buộc.

## 0. Quy trình 4 bước (không bỏ bước)

1. **Đọc:** file này + `docs/brand-backlog.md` (việc dang dở) + file quy cách liên quan (bảng ở mục 6).
2. **Nghĩ:** yêu cầu chạm tới quy tắc nào dưới đây? Ghi ra trước khi viết code.
3. **Đánh giá:** so phương án với từng quy tắc. Quy tắc nào đo được thì đo (mục 5), không ước bằng mắt.
4. **Làm & kiểm:** sửa, chạy đủ lệnh kiểm ở mục 5, chụp màn hình máy tính 1280px + điện thoại 390px, rồi mới commit.

## 1. Trọng lượng thị giác 2 giọng: chính 75% / phụ 25% (quy tắc V)

Mọi cụm chữ có **2 giọng** — giọng chính (anchor) và giọng phụ (accent) — phải đọc ra **chính ≈ 75%, phụ ≈ 25%**
trọng lượng thị giác. Áp dụng cho: lockup trên web (`components/Lockup.tsx`), chữ trên video / thumbnail
(`docs/typography-lockup.md`), và **chữ của logo** (tên chính so với chữ phụ như MEDIA).

| Mã | Quy tắc | Cách kiểm |
|---|---|---|
| **V1** | **Trọng lượng thị giác = diện tích mực**: số điểm ảnh mà nét chữ thật sự phủ, đo bằng font thật, cỡ thật, chữ hoa/thường thật. Giọng phụ chiếm **25%** tổng mực của 2 giọng, **được phép 20–30%**. Cả 2 giọng cùng một màu nên chỉ cần đo mực. | `npm run lockup:check` (đo trên trình duyệt, máy tính + điện thoại) |
| **V2** | Dòng giọng phụ **không rộng hơn** dòng dài nhất của giọng chính. | `lockup:check` (cột width) |
| **V3** | Nét móc của giọng phụ (g, y, đ…) **không chạm dấu** của giọng chính (Ẫ, Ể, Ố…). Độ chồng 2 dòng tính theo cỡ giọng chính (`-0.08em`), không theo cỡ giọng phụ. | Chụp màn hình, nhìn tận mắt |
| **V4** | Giọng chính: Playfair Display 900, IN HOA, giãn chữ +3%, giãn dòng 1,18. Giọng phụ: Great Vibes, chữ thường như gõ, **ngắn (≤ 7 chữ)**. Một màu cho cả 2 (trắng + bóng mờ 40% trên nền tối, ink trên nền sáng). | Đọc code |
| **V5** | Cân 75/25 bằng **`accentScale`** (cỡ giọng phụ ÷ cỡ giọng chính), cho phép **0,9–1,7**. Ngoài khoảng này → **viết lại câu** (giọng phụ ngắn hơn hoặc giọng chính dài hơn), không ép cỡ. Đổi câu là phải đo lại. | `lockup:check` |
| **V6** | Tiết chế: mỗi màn hình tối đa 1 lockup. Trang chủ = hero + đúng 3 section. Trang con = 1 lockup ở đầu trang. Thêm chỗ mới phải hỏi anh Đức. | Đọc code |
| **V7** | Giọng thứ ba (nhãn số liệu, slogan dưới logo) **không tính** vào cặp 75/25. Nó phải nhỏ hơn hẳn giọng phụ và chỉ dùng chữ không chân của web. | Nhìn |

Nơi đặt cỡ: `accentScale` nằm cạnh câu chữ, gồm `messages/*.json` (`*AccentScale`) và `lib/servicesCatalog.ts`
(`accentScale`). Lý do: cùng một tỷ lệ cỡ nhưng câu dài ngắn khác nhau thì trọng lượng khác nhau, nên mỗi câu có số riêng.
Bài học 08/11/2026: tỷ lệ cỡ cố định (1,02) cho ra phụ 11–53% tùy câu, chỉ 9/40 lockup đạt.

## 2. Màu (tóm tắt — chi tiết `docs/color-system.md`)

Xanh dương `#4285F4` 30% · đen `#0B1220` 30% · trắng 25% · xanh lá `#17A85A` 10% (chỉ nghĩa tích cực) ·
khác 5% (đỏ chỉ cho cảnh báo). Không dùng bảng màu mặc định Tailwind. Kiểm: `npm run colors:check`.

## 3. Chữ (tóm tắt — chi tiết `docs/font-system.md`, `docs/typography-lockup.md`)

- Font chỉ chọn ở `lib/fonts.ts`, theo 5 vai trò: body, display (Mona Sans), serif (Source Serif 4), lockup (Playfair Display 900), script (Great Vibes). Không ghi tên font trong component. Kiểm: `npm run fonts:check`.
- Font nào cũng phải có dấu tiếng Việt. Chữ có dấu chồng: giãn dòng ≥ 1,15.
- Khách 30–55 tuổi đọc trên điện thoại: chữ thân ≥ 16px, tương phản đủ.

## 4. Bố cục & phong cách

- Tối giản, ít chữ, không giải thích thừa. Premium nhưng gần gũi: không "agency màu mè", không "công nghệ lạnh".
- Thành phần dùng chung: `card-premium`, `surface-light(-soft)`, `<SectionSeam>` (mục 3b `docs/color-system.md`). Không tạo kiểu thẻ hay nền mới khi đã có sẵn.
- Ưu tiên giao diện máy tính, nhưng mọi thay đổi phải không vỡ trên điện thoại 390px (không tràn ngang).
- **Logo:** chỉ thay trên web khi anh Đức chủ động yêu cầu. Đề xuất logo theo quy trình `design/logo-tri-duc-media/HISTORY.md`; chữ logo cũng theo quy tắc V.

## 5. Lệnh kiểm trước khi commit

| Lệnh | Khi nào |
|---|---|
| `npm run colors:check` | Luôn luôn |
| `npm run fonts:check` | Luôn luôn |
| `npm run lockup:check` (cần `npm run dev` đang chạy, hoặc truyền URL website) | Khi sửa lockup, câu chữ của lockup, font, cỡ chữ |
| `npx tsc --noEmit` + eslint file đã sửa | Khi sửa code |
| Chụp màn hình 1280px + 390px | Khi sửa giao diện |

## 6. Bản đồ quy cách

| Mảng | File |
|---|---|
| Việc dang dở | `docs/brand-backlog.md` |
| Màu | `docs/color-system.md` |
| Font web | `docs/font-system.md` |
| Lockup, chữ trên video / thumbnail | `docs/typography-lockup.md` |
| Logo | `design/logo-tri-duc-media/BRAND-BRIEF.md`, `HISTORY.md` |
