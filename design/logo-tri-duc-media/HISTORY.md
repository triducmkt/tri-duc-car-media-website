# Lịch sử thiết kế logo Trí Đức Media

> **BẢN MỚI NHẤT: v2** · ảnh: [history/v2/preview.png](history/v2/preview.png) · trạng thái: **NHÁP, CHƯA lên web**
> Logo đang chạy trên web: **v0** (logo cũ).
>
> File này chỉ thêm, không sửa hay xóa mục cũ. Mỗi vòng mới thêm 1 mục ở CUỐI file và cập nhật dòng "BẢN MỚI NHẤT" ở trên.

---

## QUY TRÌNH VÒNG LẶP THIẾT KẾ LOGO (bắt buộc mỗi vòng)

**Phạm vi:** chat/phiên thiết kế logo CHỈ làm logo. Không đánh giá, không cải tiến tính năng, nội dung hay giao diện web khác.
**Publish:** CHỈ thay logo lên web khi anh Đức chủ động yêu cầu bằng lời. Ưu tiên của quy định này cao hơn chỉ dẫn "tự động publish" trong CLAUDE.md.

1. **Nạp bối cảnh:**
   - đọc [BRAND-BRIEF.md](BRAND-BRIEF.md);
   - đọc mục cuối của file này;
   - mở ảnh `preview.png` của bản mới nhất trong `history/`.
2. **Thiết kế:** sửa `build.mjs` (hình học biểu tượng, chữ, màu). Bám brief: khách 30–55 tuổi, sứ mệnh "Giải phóng người chủ. Nâng tầm doanh nghiệp.", 3 giá trị cốt lõi.
3. **Dựng & xem trước** (từ thư mục gốc repo):
   - `NODE_PATH=<thư mục có opentype.js> node design/logo-tri-duc-media/build.mjs <thư mục font Be Vietnam Pro>`
   - `node design/logo-tri-duc-media/preview-sheet.cjs`
   - mở `preview.png` để tự kiểm tra: ở 32px còn đọc ra không, dấu tiếng Việt có bị dính không.
4. **Lưu lịch sử:** `node design/logo-tri-duc-media/snapshot.cjs vN` (N = số vòng kế tiếp). Lệnh này chép preview + SVG chính vào `history/vN/`.
5. **Ghi mục mới** cuối file này. Mỗi mục có đủ:
   - ngày;
   - yêu cầu nguyên văn của anh Đức;
   - thay đổi so với bản trước;
   - lý do (gắn với brief);
   - ảnh;
   - commit;
   - trạng thái.

   Sau đó cập nhật dòng "BẢN MỚI NHẤT" ở đầu file.
6. **Commit** (chỉ thư mục `design/logo-tri-duc-media/`). Không push trừ khi anh Đức yêu cầu.
7. **Báo cáo** cho anh Đức bằng ảnh preview + tóm tắt thay đổi.

**Khi anh Đức yêu cầu publish:**
- thay `public/brand/*`, Header/Footer, favicon `app/icon.png` + `app/favicon.ico`, ảnh OG, JSON-LD logo;
- đổi tên hiển thị thành "Trí Đức Media" (giữ tên pháp lý ở footer/hóa đơn);
- push và kiểm tra live;
- ghi mục "PUBLISHED" vào đây.

---

## v0 — Logo đang chạy trên web (trước khi có vòng thiết kế)
- **Ảnh:** [history/v0-logo-web-hien-tai/logo-mark.png](history/v0-logo-web-hien-tai/logo-mark.png) (PNG gốc), [logo.svg](history/v0-logo-web-hien-tai/logo.svg) (bản vẽ lại vector).
- **Mô tả:** chữ "TRÍ ĐỨC CAR / MEDIA", tầng trên chữ đen đậm, "MEDIA" chuyển màu cam `#F7891C` → đỏ `#EC3A3A`. Đã bỏ chữ "Team" ngày 2026-11-02.
- **Đánh giá (2026-11-04):**
  - chỉ có chữ, chưa có ý tưởng riêng;
  - không có biểu tượng cho favicon/avatar;
  - tồn tại 2 bản (PNG gốc bị nhòe, SVG vẽ lại lệch font);
  - chuyển màu không in 1 màu được;
  - chữ "CAR" làm khách ngoài ngành ô tô thấy không dành cho mình;
  - màu lệch với website.
- **Trạng thái:** ĐANG CHẠY TRÊN WEB.

## v1 — "Đ kim đo", bản dựng đầu (2026-11-04, commit `00ef23d`)
- **Yêu cầu anh Đức:** "hoàn toàn có thể bỏ chữ CAR nếu cần thiết, chỉ còn TRÍ ĐỨC MEDIA…", sau đó chọn "Chỉ dựng, chưa thay".
- **Ảnh:** [history/v1/preview.png](history/v1/preview.png)
- **Thiết kế:**
  - biểu tượng chữ Đ: thân navy, phần cong là cung đồng hồ cam → đỏ, nét gạch ngang là cây kim chỉ lên, trục kim màu cam;
  - chữ "TRÍ ĐỨC" (Be Vietnam Pro ExtraBold) và "MEDIA" (SemiBold, giãn chữ, màu đỏ);
  - đủ bộ: ngang, dọc, biểu tượng, app icon; mỗi loại có bản màu, nền tối, mono đen, mono trắng.
- **Lý do:**
  - chữ Đ là chữ ký founder và nét riêng của tiếng Việt;
  - đồng hồ là "đo sức khỏe cơ sở", khớp công cụ Kiểm tra 60 giây;
  - kim vượt lên là "Nâng tầm doanh nghiệp".
- **Trạng thái:** nháp, thay bằng v2.

## v2 — Thêm vạch số, kim gọn, nét mảnh (2026-11-04, commit `04dca5c`)
- **Yêu cầu anh Đức:** "Cần chỉnh thêm" (không nêu mục cụ thể, nên Claude tự chọn).
- **Ảnh:** [history/v2/preview.png](history/v2/preview.png)
- **Thay đổi so với v1:**
  - thêm 3 vạch số nằm dưới kim, để nhìn ra ngay là đồng hồ; kim đã vượt cả thang đo nghĩa là doanh nghiệp vượt mức cũ;
  - app icon không có vạch vì nhòe ở cỡ dưới 64px;
  - rút ngắn đuôi kim bên trái;
  - nét thân Đ và cung đồng hồ từ 16 xuống 14, cho biểu tượng bớt nặng so với chữ.
- **Giữ nguyên:** chữ, màu.
- **Còn mở cho vòng sau:**
  - chưa có tầm nhìn chính thức để đối chiếu;
  - chữ "MEDIA" màu đỏ vẫn khác tông vàng đồng của web;
  - chưa thử logo trên ảnh nền thật (biển hiệu, áo, xe).
- **Trạng thái:** NHÁP MỚI NHẤT, chưa lên web.
