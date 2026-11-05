<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Dự án: Website Trí Đức Car Media

> 📍 **Thư mục gốc DUY NHẤT (Single Source of Truth):** `D:\My Agents\Projects\Website Tri Duc Car Media\`
> Mọi agent (Gemini/Antigravity, Claude Code, Codex, Cursor) CHỈ làm việc trong thư mục này. Các đường dẫn cũ (`D:\My Claude Code`, `D:\My Agents\Claude Code\...`) chỉ là liên kết hoặc bản backup (`_BACKUP_20261004`) — không sửa ở đó, nếu phát hiện bản trùng thì dừng và báo anh Đức.

Ngay khi bắt đầu phiên làm việc, AI phải tự động gọi tool view_file để đọc file `hq/00-INDEX.md` và các file `hq/*-LOG.md` trong thư mục này để nạp bối cảnh, tuyệt đối không được hỏi lại người dùng.

File `hq/00-INDEX.md` là HQ của riêng dự án này (liên kết trực tiếp từ `D:\My Documents\KINH DOANH\All-in-one Business Plan\Cac kinh doanh TDC Media tu van\TRI DUC CAR MEDIA\Website Pipeline\00-INDEX.md`) — chứa mục "TRẠNG THÁI HIỆN TẠI" (đang làm gì / vừa xong gì / bước tiếp theo), nhật ký toàn bộ quyết định/yêu cầu, danh sách case study, tài sản (ảnh/màu/font), và thông tin deploy hiện tại. Đọc trước để nắm ngay bối cảnh thay vì suy luận lại từ code hoặc hỏi lại người dùng.

**Sau khi hoàn thành một phần việc đáng kể** (bất kể bạn là agent nào — Claude, Codex, Antigravity...): cập nhật mục "TRẠNG THÁI HIỆN TẠI" trong `hq/00-INDEX.md` ở trên + thêm 1 mục mới vào `hq/01-REQUIREMENTS-LOG.md` (cùng thư mục) — để agent tiếp theo tiếp tục ngay lập tức mà không mất ngữ cảnh.

**Việc dang dở (đọc mỗi lần review / cải tiến website):** `docs/brand-backlog.md` — bảng checklist theo ưu tiên, chỉ là đề xuất tham khảo; làm xong việc nào thì tick ☑ + ghi ngày/commit. Chữ trên video, thumbnail, tiêu đề lớn: `docs/typography-lockup.md`.

**Màu sắc (quy cách chung toàn dự án, anh Đức chốt 2026-11-05 — bắt buộc):** xanh dương `#4285F4` 30% (màu chủ đạo, token `brand-*`) · đen `#0B1220` 30% (`ink`) · trắng 25% (`paper`) · xanh lá `#17A85A` 10% (`leaf-*`, chỉ cho nghĩa tích cực: tăng trưởng, tiết kiệm, thành công, dấu tích) · màu khác 5% (trang trí / điểm nhấn cần thiết; đỏ chỉ cho cảnh báo). Token ở `app/globals.css`, quy tắc chi tiết: `docs/color-system.md`. Chạy `npm run colors:check` trước khi commit. Không dùng bảng màu mặc định Tailwind (amber, emerald, sky…).

**Typography (bắt buộc khi sửa giao diện):** font chỉ được chọn ở `lib/fonts.ts` (3 vai trò body / display / serif). Quy tắc + băng ghế font tiếng Việt đã kiểm tra: `docs/font-system.md`. Chạy `npm run fonts:check` trước khi commit. Không ghi tên font trong component.

Quy định làm việc áp dụng chung cho mọi dự án:
👉 `D:\My Agents\Global\GLOBAL-RULES.md` (hoặc mirror tại `C:\Users\TANG KIM SON\AI-HQ\GLOBAL-RULES.md`)

Danh mục dự án toàn máy:
👉 `D:\My Agents\Global\PROJECTS-INDEX.md`

## Quy trình thiết kế logo (vòng lặp riêng — anh Đức chỉ định 2026-11-04)

- Có một chat/phiên **chỉ dành cho cải tiến thiết kế logo Trí Đức Media**. Trong phiên đó: không đánh giá, không cải tiến tính năng hay giao diện web nào khác.
- **Logo mới CHỈ được thay lên web khi anh Đức chủ động yêu cầu.** Quy định này đứng trên chỉ dẫn "tự động publish" trong CLAUDE.md, và áp dụng cho mọi agent.
- Mỗi vòng thiết kế làm theo quy trình và ghi lịch sử (kèm ảnh) trong `design/logo-tri-duc-media/HISTORY.md`. Brief thương hiệu nằm ở `design/logo-tri-duc-media/BRAND-BRIEF.md`. Muốn biết bản mới nhất: đọc dòng "BẢN MỚI NHẤT" đầu HISTORY.md.
