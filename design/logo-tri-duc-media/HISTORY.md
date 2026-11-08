# Lịch sử thiết kế logo Trí Đức Media

> **BẢN MỚI NHẤT: v11** · ảnh: [history/v11/preview.png](history/v11/preview.png) + logo động [history/v11/intro-9x16-navy.gif](history/v11/intro-9x16-navy.gif) · trạng thái: **ĐANG CHẠY TRÊN WEB**
> Logo đang chạy trên web: **v11** (= v10 đổi xanh sang #4285F4 của dự án, 2026-11-05). Muốn đưa bản mới lên web: `export-web.cjs` (chỉ khi anh Đức yêu cầu).
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
- **Trạng thái:** đã thay bằng v10 trên web (2026-11-04).

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
- **Trạng thái:** nháp, thay bằng v3.

## Cập nhật brief (2026-11-04) — Tầm nhìn bản 3 + lời hứa thương hiệu
- **Yêu cầu anh Đức:** bổ sung vào brief thương hiệu và nhận diện "Trí Đức Media":
  - Tầm nhìn bản 3: "Đến năm 2031, Trí Đức Media giúp 1000 người chủ cơ sở… nghỉ ngơi vắng mặt 30 ngày cơ sở vẫn tăng trưởng…";
  - Lời hứa chính: "Vắng 30 ngày, cơ sở vẫn tăng trưởng."
- **Đã ghi vào [BRAND-BRIEF.md](BRAND-BRIEF.md)**, kèm 4 tiêu chí chấm logo (tự vận hành, đi lên bền vững, từ người làm thành người sở hữu, chuẩn hóa).
- Không có thiết kế mới trong lần này; bản mới nhất vẫn là v2.
- **Điểm mở cho v3** (từ tầm nhìn mới):
  - nhấn ý "tự đi lên, không cần tay người";
  - xem lại màu đỏ vùng tua cao, vì đỏ dễ gợi quá tải, trái với ý ung dung và bền vững.

## v3 — Vàng thay đỏ, kim cao và vững (2026-11-04)
- **Yêu cầu anh Đức:** "Làm v3 luôn" (theo Tầm nhìn bản 3 + lời hứa "Vắng 30 ngày, cơ sở vẫn tăng trưởng").
- **Ảnh:** [history/v3/preview.png](history/v3/preview.png)
- **Thay đổi so với v2:**
  - **Cung đồng hồ:** từ cam → đỏ thành cam → vàng (`#F7891C` → `#DFA136`). Bỏ hẳn màu đỏ "vùng tua đỏ".
  - **Chữ MEDIA:** trên nền sáng từ đỏ `#EC3A3A` thành cam đậm `#E0701A`; trên nền tối từ cam thành vàng nhạt `#F0C069`.
  - **Kim:** chỉ cao hơn, khoảng 55° (v2 khoảng 42°), nằm vững ở vùng cao của thang đo.
  - **Vạch số:** 3 vạch cách đều nhau 40°, thay cho khoảng cách lệch ở v2.
- **Lý do (theo 4 tiêu chí trong BRAND-BRIEF):**
  - *Đi lên bền vững / người sở hữu:* đỏ gợi quá tải, nguy hiểm; vàng gợi tài sản, thành quả được giữ lại. Càng lên cao càng thành "vàng", đúng ý người chủ chuyển từ người làm thành người sở hữu.
  - *Tự vận hành:* kim tự nằm yên ở vùng cao, không rung lắc. Cơ sở đã tự giữ được vòng tua mà không cần tay người chủ.
  - *Chuẩn hóa:* vạch số cách đều, thành một thang đo có quy tắc.
  - *Đồng bộ web:* vàng trùng tông gold-400/500 đang dùng trên website, nên logo và web không còn hai giọng màu.
- **Giữ nguyên:** hình chữ Đ, font Be Vietnam Pro, bố cục ngang/dọc, app icon (vẫn bỏ vạch ở cỡ nhỏ).
- **Tự kiểm tra:**
  - app icon 32px vẫn nhận ra chữ Đ;
  - dấu Í, Ứ không dính;
  - bản mono không đổi (chỉ khác hình kim).
- **Còn mở cho vòng sau:**
  - vàng ở đỉnh cung hơi nhạt trên nền trắng, có thể cần đậm hơn khi in;
  - chưa thử trên ảnh thật (biển hiệu, áo đồng phục, xe).
- **Trạng thái:** nháp, thay bằng v4.

## v4 — Người chủ bước ra khỏi bộ máy + dòng lời hứa (2026-11-04)
- **Yêu cầu anh Đức:** ở vai brand designer 10 năm, xem logo mới nhất, nghĩ theo chân dung khách và thương hiệu, nghĩ khác lối mòn, làm 1 thay đổi LỚN (không chỉnh nhỏ), ship mỗi lần, báo top 3 website đã khảo sát.
- **Ảnh:** [history/v4/preview.png](history/v4/preview.png). Bảng này có thêm mockup biển hiệu và avatar tròn Zalo/Facebook.
- **Khảo sát 3 website** (thương hiệu chủ SME Việt Nam gặp hằng ngày):
  1. **KiotViet** (kiotviet.vn): biểu tượng chữ K dạng app, xanh dương/xanh lá, giọng "phần mềm phổ biến nhất".
  2. **Base.vn** (base.vn): xanh dương, "Hệ điều hành doanh nghiệp thế hệ AI", giọng công nghệ.
  3. **MISA** (misa.vn): đỏ/trắng, "Agentic AI", giọng tập đoàn.

  **Kết luận:** cả 3 đều lạnh, công nghệ, biểu tượng kiểu app. Trí Đức Media nên khác ở 3 điểm: tông ấm (cam/vàng), có con người (người chủ), chữ Đ thuần Việt. KHÔNG đi theo lối "AI/phần mềm".
- **Thay đổi LỚN so với v3 (ý tưởng cốt lõi):**
  - **Chấm cam = người chủ.** Từ v1 đến v3, chấm cam là trục kim nằm TRÊN thân chữ Đ, tức người chủ vẫn phải giữ bộ máy. Ở v4, chấm cam **bước ra khỏi chữ Đ**, đứng ở góc trên bên phải, ngoài cung đồng hồ.
  - **Bộ máy tự chạy:** thân Đ, cung và vạch số vẫn chạy. Kim không còn chấm trục và tự hướng lên phía người chủ. Đây chính là hình ảnh của lời hứa "Vắng 30 ngày, cơ sở vẫn tăng trưởng" và tầm nhìn "từ người làm thành người sở hữu".
  - **Bản logo mới có dòng lời hứa:** `tri-duc-media-horizontal-tagline-*.svg` (màu, nền tối, mono đen, mono trắng). Dưới logo có một đường kẻ mảnh và dòng "Vắng 30 ngày, cơ sở vẫn tăng trưởng.", dùng cho biển hiệu, danh thiếp, slide, áo.
- **Lợi ích thực tế:**
  - Chấm cam tách riêng tạo một điểm nhấn dễ nhớ, rõ ở cả avatar tròn 72px.
  - Cả câu chuyện thương hiệu kể được trong 1 câu: "chấm cam là anh chị, đã bước ra ngoài; bộ máy vẫn tự đi lên."
- **Giữ nguyên:** màu v3 (cam → vàng), font, bố cục ngang/dọc.
- **Tự kiểm tra:**
  - avatar tròn 72px và app icon 32px vẫn nhận ra chữ Đ và chấm cam;
  - bản mono vẫn giữ chấm (cùng màu mực);
  - dấu Í, Ứ không dính.
- **Còn mở cho vòng sau:**
  - chấm cam đứng gần dấu sắc chữ Í ở bản ngang, cần xem lại khoảng cách khi in nhỏ;
  - kim không còn trục nên đầu trái hơi "lửng", có thể thử bo hoặc cắt gọn;
  - chưa có mockup áo đồng phục và xe.
- **Trạng thái:** nháp, thay bằng v5.

## v5 — "Đ lá mầm", màu theo mệnh Mộc (2026-11-04) — ĐỔI Ý TƯỞNG LỚN
- **Yêu cầu anh Đức:** "vẫn chưa đủ wow về ý tưởng thiết kế và bản vẽ. a thêm thông tin màu hợp mệnh phong thủy, mệnh của a là mệnh mộc (đại lâm mộc) hợp các màu xanh dương/xanh biển, trắng, đen, xanh lá cây. màu cam thực ra chỉ là ý tưởng ban đầu, không phải màu chủ đạo của cty sẽ gắn bó lâu dài"
- **Ảnh:** [history/v5/preview.png](history/v5/preview.png)
- **Brief:** thêm mục "Màu chủ đạo theo phong thủy" vào BRAND-BRIEF.md (mệnh Mộc, cam chỉ là ý tưởng ban đầu).
- **Thay đổi so với v4 (bỏ hẳn ý đồng hồ, vẽ lại từ đầu):**
  - **Ý tưởng:** từ "đồng hồ đo + người chủ bước ra" sang **"Đ lá mầm"**. Đại Lâm Mộc là cây lớn trong rừng, tự lớn khi người trồng vắng mặt: lời hứa "Vắng 30 ngày, cơ sở vẫn tăng trưởng" được vẽ bằng hình ảnh tự nhiên.
  - **Phần cong chữ Đ thành chiếc lá:** góc trên bên phải vuốt lên thành đầu lá nhọn, vượt cao hơn thân chữ (cơ sở lớn vượt tầm cũ).
  - **Thân chữ Đ màu navy là thân cây, là hệ thống:** đứng yên, rễ sâu.
  - **Nét gạch ngang Đ thành gân lá:** một nét thon dần (đầu tròn bên trái, nhọn khi vươn lên trong lá). Bỏ hẳn kim, vạch số và chấm cam.
  - **Màu mới:**
    - lá chuyển từ xanh biển `#0A6FB8` (gốc) sang xanh lá `#17A85A` (ngọn), tức Thủy sinh Mộc;
    - chữ TRÍ ĐỨC navy `#0B1220`;
    - chữ MEDIA xanh biển trên nền sáng, xanh lá sáng `#45D17F` trên nền tối;
    - cam và vàng đã thôi dùng.
- **Quá trình vẽ trong vòng này:**
  - Bản nháp đầu dùng gân lá là một que thẳng có 2 gân phụ. Nhìn giống que xiên kèm răng cào nên em bỏ.
  - Thay bằng nét thon, rồi sửa đầu nét bị móc ngược và kéo nét thò ra trái đủ dài để đọc thành chữ Đ.
- **Vì sao "wow" hơn:**
  - Một hình duy nhất kể 3 lớp nghĩa: chữ Đ (tên founder, nét Việt), chiếc lá (Mộc, mệnh founder), tăng trưởng tự nhiên (lời hứa).
  - Khác hẳn 3 thương hiệu SME đã khảo sát (KiotViet, Base.vn, MISA: xanh/đỏ, công nghệ, icon app). Đây là biểu tượng có hồn, mang tính tự nhiên.
- **Tự kiểm tra:**
  - avatar tròn 72px và icon 32px vẫn ra chữ Đ hình lá;
  - bản mono rõ hình lá (gân lá hòa vào thân chữ, chỉ thấy phần thò ra trái);
  - dấu Í, Ứ không dính.
- **Còn mở cho vòng sau:**
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông với logo xanh khi publish (cần quyết định khi đổi logo trên web);
  - thử thêm một gân phụ rất mảnh ở bản lớn (biển hiệu) để tăng chi tiết;
  - chưa có mockup áo đồng phục và xe.
- **Trạng thái:** nháp, thay bằng v6.

## v6 — Dấu sắc thành lá non + mockup áo, danh thiếp (2026-11-04)
- **Yêu cầu anh Đức:** "Làm tiếp v6".
- **Ảnh:** [history/v6/preview.png](history/v6/preview.png)
- **Thay đổi so với v5:**
  - **Chi tiết chữ ký mới:** 2 dấu sắc trên Í và Ứ được vẽ lại thành **2 chiếc lá non màu xanh lá** (`#17A85A`; nền tối `#45D17F`).
    - Dấu tiếng Việt trở thành chi tiết nhận diện: chính cái tên "Trí Đức" cũng đang nảy mầm.
    - Lá đặt đúng vị trí và độ nghiêng của dấu sắc gốc trong font, nên người đọc vẫn thấy chữ Í, Ứ chuẩn tiếng Việt.
    - Bản mono: lá cùng màu mực.
  - **Kỹ thuật:**
    - chữ được dựng không dấu ("TRI ĐƯC", cùng độ rộng chữ); khung dấu sắc lấy từ glyph Í/Ứ thật, rồi vẽ lá hình hạt hạnh theo đường chéo của dấu;
    - Ứ dùng cùng kích thước khung với Í, vì phần móc của chữ Ư cũng nhô lên trên chữ (lần dựng đầu bị đo nhầm nên lá bè ngang, đã sửa).
  - **Mockup mới trong bảng xem trước:**
    - áo thun đồng phục navy, biểu tượng ở ngực trái;
    - danh thiếp: mặt trước nền trắng có logo màu, mặt sau navy có dòng lời hứa.
- **Giữ nguyên:** biểu tượng "Đ lá mầm", màu mệnh Mộc, font, bố cục.
- **Ý nghĩa thêm:** biểu tượng là chiếc lá lớn (cây đã thành), 2 dấu sắc là 2 lá non (cơ sở mới). Logo vừa kể "cây lớn tự đi lên", vừa kể "liên tục nảy lộc", hợp tầm nhìn 1000 người chủ.
- **Tự kiểm tra:**
  - ở danh thiếp (logo rộng khoảng 280px) 2 lá non vẫn rõ;
  - ở bản dọc nhỏ, lá non vẫn đọc ra là dấu sắc;
  - dưới cỡ logo ngang 120px nên dùng biểu tượng riêng (quy tắc cũ).
- **Còn mở cho vòng sau:**
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông với logo xanh khi publish;
  - có thể thử gân phụ mảnh cho bản biển hiệu lớn;
  - chưa có mockup xe.
- **Trạng thái:** nháp, thay bằng v7.

## v7 — Thân và lá đúc thành một khối, màu chảy từ gốc lên ngọn (2026-11-04)
- **Yêu cầu anh Đức:** "Làm tiếp v7".
- **Ảnh:** [history/v7/preview.png](history/v7/preview.png)
- **Nhận xét v6 (góc designer):** thân chữ Đ màu navy và chiếc lá xanh là 2 mảnh ghép, có đường nối cứng ở giữa, nhìn như dán lại với nhau.
- **Thay đổi so với v6:**
  - **Một hình liền mạch:** thân chữ Đ và chiếc lá gộp thành 1 khối duy nhất, không còn đường nối.
  - **Màu chảy liền một dải** từ gốc dưới bên trái lên ngọn lá: navy `#0B1220` → xanh biển `#0A6FB8` → xanh lá `#17A85A`. Đen và xanh biển (Thủy) nuôi xanh lá (Mộc) trong một nét. Đây là câu chuyện phong thủy được vẽ thành chính hình logo.
  - **Bản nền tối:** gốc trắng → xanh biển sáng → xanh lá sáng.
  - **Mockup mới:** xe van dịch vụ màu trắng, logo có dòng lời hứa ở hông xe (thêm vào cạnh biển hiệu, áo, danh thiếp, avatar).
- **Giữ nguyên:** hình chữ Đ lá mầm, gân lá thon, 2 dấu sắc lá non, font, chữ.
- **Tự kiểm tra:**
  - avatar tròn, app icon 32px vẫn rõ;
  - bản mono không đổi (1 màu);
  - ở bản màu, gân lá xanh vẫn tách rõ khỏi phần gốc xanh biển và navy.
- **Còn mở cho vòng sau:**
  - góc trên bên trái thân chữ hơi ngả xanh biển (do màu chạy theo đường chéo); có thể muốn cả thân đậm hơn;
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông khi publish;
  - có thể thử gân phụ cho biển hiệu lớn.
- **Trạng thái:** nháp, thay bằng v8.

## v8 — Chiếc lá CHÍNH LÀ chữ Đ trong tên + slogan 4 tiếng (2026-11-04)
- **Yêu cầu anh Đức:** "a thấy có nét và thẩm mỹ hơn các phiên bản đầu nhưng chưa đủ wow, ấn tượng và slogan chưa dễ nhớ. tiếp v8"
- **Ảnh:** [history/v8/preview.png](history/v8/preview.png)
- **Chẩn đoán v7:**
  1. biểu tượng và chữ vẫn là 2 phần tách rời (hình bên trái, tên bên phải), giống hàng nghìn logo khác;
  2. slogan 8 tiếng không có nhịp.
- **Thay đổi LỚN so với v7:**
  - **Biểu tượng thay chính chữ Đ trong "TRÍ ĐỨC".**
    - Đây là kiểu ý tưởng anh Đức lấy làm ví dụ ngay từ đầu (chữ O của VieON là màn hình, PNJ là viên kim cương). Người xem đọc tên "TRÍ ĐỨC" và gặp chiếc lá ngay trong tên.
    - Chữ Đ-lá là con chữ duy nhất có màu (navy → xanh biển → xanh lá), nằm giữa các chữ navy, nên mắt dừng ngay ở đó.
    - Đầu lá vươn lên ngang tầm 2 lá non trên dấu sắc: 3 chiếc lá cùng mọc trên một dòng tên.
  - **Bản đậm riêng cho chữ Đ-lá:** nét 20 thay vì 14, để ngang độ đậm chữ ExtraBold bên cạnh. Lòng chữ Đ thành dáng lá (đầu hơi nhọn).
  - **Logo ngang** giờ là "TRÍ [Đ-lá]ỨC / MEDIA", không còn biểu tượng đứng riêng bên cạnh. Bản dọc vẫn là biểu tượng lớn ở trên + tên bên dưới. App icon và avatar dùng biểu tượng như v7.
  - **Slogan mới "Vắng chủ, vẫn tăng."**:
    - 4 tiếng, láy âm V–V, rút thẳng từ lời hứa;
    - cỡ chữ bằng khoảng chữ MEDIA, nằm dưới một đường kẻ mảnh;
    - 2 phương án khác ghi trong BRAND-BRIEF (B. "Chủ nghỉ ngơi, cơ sở vẫn lời.", C. "Gieo hệ thống, gặt tự do.").
- **Quá trình vẽ trong vòng này:**
  - lần dựng đầu, chữ Đ-lá mảnh hơn chữ xung quanh nên em làm bản đậm;
  - slogan lúc đầu kéo to bằng chiều ngang tên nên tràn khung, em hạ cỡ chữ;
  - bảng xem trước giờ tự co ảnh vừa khung theo cả chiều ngang và chiều cao.
- **Tự kiểm tra:**
  - trên danh thiếp và xe (logo rộng khoảng 200px) vẫn đọc ra "TRÍ ĐỨC" và thấy chữ Đ-lá;
  - bản mono đọc được: gân lá hòa vào chữ, phần thò ra trái là nét gạch của chữ Đ.
- **Còn mở cho vòng sau:**
  - anh Đức chốt slogan A/B/C;
  - bản mono của chữ Đ-lá hơi "lửng" ở đầu nét gạch bên trái;
  - khoảng trống bên phải chữ MEDIA ở bản ngang (có thể căn MEDIA giữa, hoặc giãn chữ bằng chiều ngang tên);
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông khi publish.
- **Trạng thái:** nháp, thay bằng v9 (thiết kế tĩnh v9 = v8, thêm logo động).

## v9 — Logo động "cây mọc": intro/outro video + SVG động (2026-11-04)
- **Yêu cầu anh Đức:** ở vai brand designer 10 năm, xem logo mới nhất, nghĩ theo chân dung khách và thương hiệu, nghĩ khác lối mòn, làm 1 thay đổi LỚN, ship mỗi lần, báo top 3 website đã khảo sát.
- **Ảnh:**
  - dải phim chuyển động [history/v9/filmstrip-16x9.png](history/v9/filmstrip-16x9.png) và [filmstrip-9x16.png](history/v9/filmstrip-9x16.png);
  - GIF [intro-9x16-navy.gif](history/v9/intro-9x16-navy.gif);
  - bảng tĩnh [preview.png](history/v9/preview.png) (giống v8).
- **Khảo sát 3 website** (thương hiệu xanh lá/xanh biển mà chủ cơ sở thấy hằng ngày trên điện thoại, cũng là nơi avatar Trí Đức Media sẽ xuất hiện cạnh họ):
  1. **Grab** (grab.com/vn): chữ "Grab" xanh lá phẳng, bo tròn, ứng dụng nhiều chuyển động.
  2. **Vietcombank** (vietcombank.com.vn): biểu tượng và chữ xanh lá phẳng, website nhiều hình minh họa sống động.
  3. **Zalo** (zalo.me): chữ "Zalo" xanh dương phẳng. Avatar Zalo OA của Trí Đức Media sẽ nằm trong giao diện xanh dương này.

  **Kết luận:**
  - mảng "xanh lá phẳng" (Grab, Vietcombank) và "xanh dương phẳng" (Zalo) đã có chủ;
  - logo Trí Đức Media khác được nhờ dải màu chảy navy → xanh biển → xanh lá và hình chữ Đ-lá. **Không** được đơn giản hóa thành 1 màu xanh phẳng;
  - các thương hiệu lớn đều "sống" bằng chuyển động trong app và video, nên logo mình cần có bản động.
- **Thay đổi LỚN: logo động "cây mọc"** (thiết kế tĩnh giữ nguyên v8):
  - **Kịch bản 3,2 giây:**
    1. chữ Đ-lá mọc từ gốc (navy) lên ngọn (xanh lá);
    2. gân lá (nét gạch chữ Đ) vươn ra;
    3. "TRÍ ĐỨC" hiện lên;
    4. 2 lá non bật ra trên dấu sắc Í và Ứ (có nảy nhẹ);
    5. MEDIA hiện;
    6. đường kẻ và slogan "Vắng chủ, vẫn tăng." hiện;
    7. giữ khung cuối.
  - **Câu chuyện:** cơ sở tự lớn lên từ gốc, đúng lời hứa thương hiệu, kể bằng chuyển động thay vì chữ.
  - **File giao:**
    - `motion/intro-9x16-navy.mp4` / `.gif`: nền navy dọc, cho YouTube Shorts, Reels, TikTok;
    - `motion/intro-16x9-white.mp4` / `.gif`: nền trắng ngang, cho YouTube, slide, màn hình chờ;
    - `motion/*-poster.png` là khung cuối, `*-frame-mid.png` là khung giữa;
    - `svg/tri-duc-media-animated-color.svg` / `-reverse.svg`: SVG động (SMIL), tự chạy 1 lần rồi giữ khung cuối, dùng được trong thẻ `<img>`, chữ ký email, header web (khi được duyệt publish).
  - **Kỹ thuật:**
    - `build.mjs` có 1 dòng thời gian `TL` dùng chung cho SVG động và cho video dựng từng khung (sharp → ffmpeg);
    - muốn đổi nhịp thì sửa `TL` rồi dựng lại.
- **Tự kiểm tra:**
  - dải phim 6 khung đúng thứ tự (lá mọc → gân → chữ → lá non → MEDIA → slogan);
  - SVG động mở trên Chrome: 9 lớp chuyển động chạy hết, dừng đúng khung cuối đầy đủ;
  - file nhẹ: MP4 khoảng 50–65 KB, GIF khoảng 75–125 KB.
- **Còn mở cho vòng sau:**
  - anh Đức chốt slogan A/B/C (đang dùng A "Vắng chủ, vẫn tăng.");
  - có thể thêm âm thanh ngắn (tiếng lá/"ting") cho video;
  - bản 9:16 có thể phóng logo to hơn nữa;
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông khi publish.
- **Trạng thái:** nháp, thay bằng v10.

## v10 — Slogan rõ nghĩa + MEDIA kẹp giữa 2 đường kẻ (2026-11-04)
- **Yêu cầu anh Đức:** "các thiết kế và chuyển động đã ổn. nhưng câu "Vắng chủ, vẫn tăng." dù ngắn lại khó hiểu. Gieo hệ thống cũng chưa catch. tiếp v10 với phần thiết kế Trí Đức giữ nguyên, cải tiến các phần còn lại"
- **Ảnh:**
  - [history/v10/preview.png](history/v10/preview.png);
  - dải phim chuyển động [filmstrip-16x9.png](history/v10/filmstrip-16x9.png), [filmstrip-9x16.png](history/v10/filmstrip-9x16.png);
  - GIF [intro-9x16-navy.gif](history/v10/intro-9x16-navy.gif).
- **Giữ nguyên:** toàn bộ chữ "TRÍ ĐỨC" (chữ Đ-lá, 2 lá non trên dấu sắc), màu, biểu tượng, app icon, kịch bản chuyển động.
- **Thay đổi:**
  - **Slogan mới: "Chủ vắng, khách vẫn đông."**
    - Tiêu chí: đọc một lần là hiểu; nói ra thành câu đời thường; có "móc" để nhớ.
    - Câu chơi chữ đối "vắng" ↔ "đông": chủ vắng mặt mà khách vẫn đông. Cụ thể, chủ gara, spa hay gym đều hiểu ngay.
    - Ý vẫn là lời hứa "Vắng 30 ngày, cơ sở vẫn tăng trưởng."
    - Phương án dự phòng (ghi trong BRAND-BRIEF): B. "Chủ nghỉ, cơ sở vẫn chạy." (rõ nghĩa nhất); C. "Anh chị nghỉ, cơ sở vẫn lớn." (đúng xưng hô với khách).
  - **Chữ MEDIA đặt giữa, kẹp giữa 2 đường kẻ mảnh** chạy kín chiều ngang tên, nên không còn khoảng trống bên phải như v8–v9. Đường kẻ cùng màu chữ MEDIA (xanh biển; nền tối là xanh lá sáng). Bỏ đường kẻ riêng phía trên slogan.
  - **Slogan đặt giữa**, cỡ chữ lớn hơn v9 (~0.92 lần chữ MEDIA, tự co nếu dài hơn tên), nên đọc rõ hơn trên danh thiếp và xe.
  - **Logo động:** khi MEDIA hiện, 2 đường kẻ vẽ dần từ chữ MEDIA ra hai bên, rồi slogan hiện. Video 9:16 phóng logo to hơn (rộng 960/1080 px).
- **Tự kiểm tra:**
  - bảng xem trước: logo màu, nền tối, mono, danh thiếp, xe đều cân đối, slogan không tràn;
  - dải phim: đường kẻ vẽ đúng chiều, slogan hiện cuối.
- **Còn mở:**
  - anh Đức chốt slogan A/B/C;
  - bản dọc vẫn là biểu tượng lớn + tên thường (chưa có đường kẻ MEDIA);
  - website đang dùng màu nhấn vàng đồng, sẽ lệch tông khi publish.
- **Trạng thái:** đã thay bằng v11 trên web (2026-11-05).

## Quyết định (2026-11-04) — Chốt slogan
- **Anh Đức chọn:** "Chủ vắng, khách vẫn đông".
- Slogan chính thức đi kèm logo: **"Chủ vắng, khách vẫn đông."** Câu này đã có sẵn trên v10 (bản ngang có slogan, logo động), nên không cần dựng lại.
- Lời hứa đầy đủ "Vắng 30 ngày, cơ sở vẫn tăng trưởng." giữ nguyên cho bài viết, slide, tư vấn.
- Bản mới nhất vẫn là v10 (nháp, chưa lên web).

## PUBLISHED — v10 lên web (2026-11-04, commit `27d3dbd`)
- **Yêu cầu anh Đức:** "hãy đưa logo v10 cùng slogan lên web ở tất cả vị trí liên quan, ưu tiên tối đa cho logo động (dạng gif hoặc video); có phần trình bày ý nghĩa của tên và logo, sứ mệnh, giá trị cốt lõi và tầm nhìn cty"
- **Vị trí đã thay:**
  - Header: logo động không slogan, 2 bản sáng/tối chồng nhau, đổi bằng độ mờ nên chỉ chạy 1 lần khi tải trang;
  - Footer: logo động có slogan, kèm link "Ý nghĩa tên & logo";
  - ảnh thay thế của BlogPostCard;
  - favicon.ico, app/icon.png, app/apple-icon.png;
  - logo.png (JSON-LD).
- **Trang Về Founder `#thuong-hieu`:** video logo động 16:9 lặp, ý nghĩa tên (Trí Đức, Media, chữ "Car" trong tên pháp lý), ý nghĩa logo (4 ý), slogan, sứ mệnh. Ngay sau là Tầm nhìn 2031 (#tam-nhin) và Giá trị cốt lõi (#gia-tri) có sẵn.
- **Dựng lại / cập nhật web khi logo đổi:** `node design/logo-tri-duc-media/build.mjs <fonts>` rồi `node design/logo-tri-duc-media/export-web.cjs`.
- **Trạng thái:** v10 ĐANG CHẠY TRÊN WEB (thay cho v0).

## v11 — Đồng bộ xanh dương #4285F4 của dự án (2026-11-05) — ĐÃ LÊN WEB
- **Yêu cầu anh Đức:** "điều chỉnh màu xanh trong bộ thiết kế logo đồng nhất màu xanh #4285F4 của dự án này và update lên toàn bộ logo trên website"
- **Ảnh:** [history/v11/preview.png](history/v11/preview.png) · GIF [history/v11/intro-9x16-navy.gif](history/v11/intro-9x16-navy.gif)
- **Thay đổi so với v10 (chỉ màu, hình giữ nguyên):**
  - xanh biển `#0A6FB8` (nền sáng) và `#3AA3EC` (nền tối) → **`#4285F4`** (token `brand-500` của website) ở mọi chỗ:
    - phần giữa dải màu chữ Đ-lá (navy → **#4285F4** → xanh lá);
    - chữ MEDIA và 2 đường kẻ trên nền sáng;
    - app icon, favicon, video logo động.
  - Xanh lá giữ nguyên `#17A85A` / `#45D17F` (trùng token `leaf-500` / `leaf-400`). Navy `#0B1220` trùng `ink`.
- **Đã cập nhật web:**
  - chạy lại `build.mjs` (cả video) và `export-web.cjs`: toàn bộ `public/brand/*`, `public/brand/motion/*`, favicon, icon, apple-icon;
  - câu mô tả màu trong section thương hiệu đổi "xanh biển" thành "xanh dương".
- **Trạng thái:** ĐANG CHẠY TRÊN WEB (thay v10).

## Đề xuất font chữ logo theo lockup C + quy tắc 75/25 (2026-11-08) — CHƯA ÁP DỤNG
- **Yêu cầu anh Đức:** "tiến hành đánh giá cải tiến bộ font của logo theo bộ lockup và quy tắc trọng lượng thị giác này luôn. chỉ đề xuất 3 draft thiết kế font cho logo mới đẹp nhất theo bộ tiêu chí score và đề xuất cho a duyệt, chưa thay đổi thực tế"
- **Bản trình bày:** https://claude.ai/artifact/AGKWQQz4jxxNyqHQNdS4P9 · file `proposals/2026-11-08-font-lockup/index.html` · ảnh [proposals/2026-11-08-font-lockup/preview.png](proposals/2026-11-08-font-lockup/preview.png)
- **Đánh giá v11:** MEDIA chỉ chiếm ~11,8% mực của cặp tên + MEDIA, ngoài vùng 20–30% của quy tắc V1 (`docs/DESIGN-CORE-RULES.md`). Logo chưa có giọng của lockup C.
- **3 bản** (giữ Đ-lá, màu, slogan; chỉ đổi chữ; cỡ MEDIA tự cân 25% mực):
  - **A. Editorial:** Playfair Display 900 + "media" Great Vibes. Đồng bộ tuyệt đối lockup C; phải vẽ lại Đ-lá, khó thêu.
  - **B. Lai giữ gốc (đề xuất):** Be Vietnam Pro 800 như v11 + "media" Great Vibes. Giữ nhận diện, rẻ nhất; dưới ~14px bỏ chữ viết tay.
  - **C. Có chân + nhãn:** Playfair Display 900 + MEDIA Be Vietnam Pro 600 giãn rộng giữa 2 đường kẻ.
- **Điểm (trọng số: đồng bộ lockup 20 · 75/25 15 · đọc rõ cỡ nhỏ 20 · hợp brief 15 · giữ Đ-lá 10 · in 1 màu 10 · khác biệt 10):** v11 61,0 · A 76,5 · **B 85,0** · C 81,5.
- **Trạng thái:** chờ anh Đức chọn. Chưa sửa `build.mjs`, chưa có vòng vN mới, logo trên web không đổi.

## Đề xuất font logo — lần 2 theo quy tắc mới (2026-11-08) — CHƯA ÁP DỤNG
- **Yêu cầu anh Đức:** "bổ sung 3 quy tắc quan trọng của cách đo mới … tiến hành sửa toàn diện logo, lockup và bộ font hiển thị trên website theo quy tắc mới."
- **Lý do làm lại:** bản lần 1 đo 75/25 bằng mực nên phóng chữ "media" 1,3–1,45 lần cỡ tên — sai (anh Đức bác cách đo mực).
- **Quy tắc áp dụng:** nét cao nhất của chữ phụ = 0,30 × chữ in hoa của tên (V1), mỗi giọng 1 dòng (V8). v11 hiện tại: MEDIA in hoa cao ~0,43 lần chữ in hoa của tên → chưa đạt.
- **Điểm (cùng 7 tiêu chí):** v11 61,0 · A Editorial 70,1 · B Lai giữ gốc 77,0 · **C Có chân + nhãn 77,3 (đề xuất, sát nút với B)**. Ở 0,3, chữ "media" viết tay chỉ ~7px ở logo header nên A/B tụt điểm "đọc rõ cỡ nhỏ".
- **Bản trình bày:** https://claude.ai/artifact/AGKWQQz4jxxNyqHQNdS4P9 (bản 2) · ảnh [proposals/2026-11-08-font-lockup/preview.png](proposals/2026-11-08-font-lockup/preview.png)
- **Trạng thái:** logo trên web KHÔNG đổi (quy trình logo: chỉ thay khi anh Đức chọn bản và yêu cầu). Chưa sửa build.mjs.
