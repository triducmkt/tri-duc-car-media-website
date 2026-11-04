# Thư viện quà — danh sách tạo bằng NotebookLM

Thư mục này: `D:\My Agents\Projects\Website Tri Duc Media\content\notebooklm\`
Trên web: khối **"Thư viện quà"** ở https://triduccar.media/vi/kiem-tra-co-so#thu-vien-qua và hộp quà 3D ở kết quả Kiểm tra 60 giây.
Mỗi món gắn với 1 chỗ yếu (trục) của khách → khách nhận qua Zalo sau khi để lại tên + Zalo (email `[Kiểm tra 60s]` ghi rõ "🎁 Quà khách chọn").

## Cách làm 1 món (≈10 phút / món)

1. notebooklm.google.com → **Notebook mới**.
2. **Thêm nguồn** → tải lên 2 file: `00-nen-chung.md` + file của món đó (cột "File nguồn").
3. Ở khung **Studio**, chọn công cụ ở cột "Công cụ NotebookLM", bấm biểu tượng ✏️/Tuỳ chỉnh, **dán prompt** trong file (mục "Prompt dán vào NotebookLM"), chọn ngôn ngữ **Tiếng Việt**.
4. Tải kết quả về (PDF / PNG / MP3 / MP4) và **gửi lại cho Claude trong chat**, hoặc chép vào thư mục `content/notebooklm/ket-qua/`.
5. Claude đưa file lên web (`public/gifts/`), đổi trạng thái món đó từ "Đang hoàn thiện" → "Có sẵn" trong `lib/gifts.ts`, và nhắn danh sách khách đã đăng ký chờ món đó (xem tab R_Leads / email) để anh gửi Zalo.

## Danh sách ưu tiên (xếp theo mức khớp insight khách + khả năng ra lead)

| # | Món quà | Định dạng | Insight khách (nỗi đau) | Công cụ NotebookLM | File nguồn | Trên web |
|---|---|---|---|---|---|---|
| 1 | **Nghỉ 3 ngày, cơ sở vẫn chạy** | Cẩm nang PDF 8–12 trang + bản nghe | Không rời cơ sở được ngày nào | Báo cáo (Report) tuỳ chỉnh → PDF; Audio Overview | `nghi-3-ngay.md` | Quà trục "Đội ngũ tự chạy" |
| 2 | **Marketing "Đúng – Đủ – Đều"** | Slide 10–12 trang + video 3–5 phút | Quảng cáo tốn tiền, khách mới không đều | Slide Deck; Video Overview | `dung-du-deu.md` | Quà trục "Khách mới" |
| 3 | **7 việc giữ khách cũ quay lại** | Checklist / infographic dọc | Khách làm xong là đi | Infographic; Report ngắn | `giu-khach-cu.md` | Quà trục "Khách quay lại" |
| 4 | **Podcast: Chủ cơ sở hỏi – anh Đức trả lời** | 5 tập × 8–12 phút | Không có thời gian đọc | Audio Overview (Deep dive, Tiếng Việt) — mỗi tập 1 trục | `chu-co-so-hoi.md` (có đủ 10 bài + 5 dự án) | Thư viện quà; đăng YouTube @TangTriDuc1989 |
| 5 | **Poster 5 trục sức khỏe cơ sở** | Poster A3 dọc | Chủ và quản lý không có chung thước đo | Infographic (poster) | `5-truc-poster.md` | Thư viện quà; in tặng khi gặp tận nơi |
| 6 | **Kênh online khi chỉ có 1 người làm** | Infographic + sơ đồ tư duy | Thuê 1 người content mà kênh vẫn thất thường | Infographic; Mind Map | `kenh-online-1-nguoi.md` | Quà trục "Kênh online" |
| 7 | **Bảng số liệu tuần 1 trang** | Hướng dẫn + bảng mẫu | Không rõ lời bao nhiêu, khách từ đâu | Report; (gửi Claude dựng Google Sheet mẫu) | `so-lieu-1-trang.md` | Quà trục "Nắm số liệu" |
| 8 | **Thẻ 15 phút chẩn đoán miễn phí** | Thẻ quà (đã có thật) | Muốn hỏi thẳng người làm thật | — (đã chạy: trang Đặt lịch) | — | Có sẵn, nút "Đặt lịch ngay" |

## Gợi ý thêm (cần anh Đức quyết trước khi đưa lên web)

| Món | Vì sao hợp khách | Cần anh quyết |
|---|---|---|
| Voucher "Kiểm tra tận nơi" cho khách quận trung tâm | Khách tin người đến tận xưởng (ảnh hậu trường Khang Vũ) | Có miễn phí / giảm bao nhiêu, giới hạn bao nhiêu suất |
| Coupon cho khách đã làm Kiểm tra 60 giây | Giữ đà sau khi khách thấy chỗ yếu | Giá trị, hạn dùng, áp dụng gói nào |
| Thẻ quà in (card) tặng khi gặp mặt: poster 5 trục + QR Kiểm tra 60s | Quà cầm tay, nhắc khách quay lại web | Mẫu in, số lượng |
| Flashcard / Quiz (NotebookLM) "Đào tạo nhân viên mới 7 ngày" | Chủ cần SOP để rời cơ sở | Có muốn làm thành quà riêng cho chủ đã là khách không |

> Lưu ý: web hiện **không** hứa giảm giá hay voucher nào. Mọi ưu đãi mới chỉ đưa lên sau khi anh chốt giá trị.

## Cập nhật bộ nguồn
Khi có bài Kiến thức / dự án mới: chạy `node scripts/build-notebooklm-pack.mjs` để dựng lại các file (lấy nội dung mới nhất từ `content/fanpage-posts/posts.json` và Sanity).
