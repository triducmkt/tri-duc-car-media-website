# Quy cách chữ & lockup "2 giọng" — Trí Đức Media (video, thumbnail, website)

> **Quy cách chung toàn dự án.** Mọi agent đọc trước khi làm chữ trên video, thumbnail, bìa Fanpage
> hoặc tiêu đề lớn trên website. Font chữ thường của web vẫn theo `docs/font-system.md`; màu theo
> `docs/color-system.md`. Việc còn dang dở: `docs/brand-backlog.md`.
> Tạo 06/11/2026 (Claude Code) từ phân tích phong cách Zermatt Neo + spec Editorial Font Pairing + lockup C anh Đức đã chốt.

## 1. Lockup là gì

Một cụm chữ gồm **2 giọng** đặt thẳng lên hình thật:

| Giọng | Vai trò | Kiểu chữ | Trọng lượng thị giác |
|---|---|---|---|
| **Chính (anchor)** | Thông điệp, tên, kết quả | Chữ in hoa, rất đậm | ~75% |
| **Phụ (accent)** | Cảm xúc, con người, dẫn dắt | Chữ viết tay / thư pháp, chữ thường | ~25% |
| *Giọng thứ ba (tùy chọn)* | Bằng chứng | Nhãn số liệu nhỏ (mục 5) | rất nhỏ |

**Bộ đã chốt (05–06/11/2026):** chữ chính **Playfair Display 900**, thư pháp **Great Vibes**.
Template video: `TPL_EDITORIAL_DUAL_TYPE_12` trong `D:\My Agents\Tools\ai-video-editor\assets\persistent_text_library\templates\` (font ở `assets/fonts/Editorial`).
Bản trình bày: https://claude.ai/artifact/PVEaE7drSNfCNeuMJNP4E9

## 2. Font có dấu tiếng Việt (đã kiểm từ dữ liệu Google Fonts)

| Loại | **Có** tiếng Việt — dùng được | **Không có** tiếng Việt — cấm dùng cho chữ Việt |
|---|---|---|
| Viết tay / thư pháp | **Great Vibes** (đã chốt), Dancing Script, Charm, Mali, Playpen Sans, Patrick Hand, Pangolin, Allura, Alex Brush, Ms Madi, Birthstone, Ephesis, Corinthia | Caveat, Caveat Brush, Kalam, Permanent Marker, Parisienne, Yellowtail, Nerko One |
| Có chân, đậm | **Playfair Display** (đã chốt), Fraunces, Yeseva One, Cormorant Garamond | Abril Fatface, DM Serif Display, Bodoni Moda, Cinzel, Cinzel Decorative |
| Không chân, đậm | Be Vietnam Pro, Montserrat, Plus Jakarta Sans | Sora, Onest, Instrument Sans |
| Font thương mại | — | Ogg, Cooper, Futura, Gilroy, Autography, Amsterdam Script, Brittany Signature: cần mua bản quyền và **chưa xác minh** dấu tiếng Việt |

Font mới: kiểm bằng `node_modules/next/dist/compiled/@next/font/dist/google/font-data.json` (trường `subsets` có `vietnamese`), và khi dùng file TTF thì kiểm thêm bảng ký tự (Ẫ Đ Ư Ơ Ắ Ặ Ể Ố Ờ Ữ Ỷ).

## 3. Quy tắc nội dung cho B2B

- Chữ viết tay **chỉ 3–6 chữ**, làm điểm nhấn hoặc dẫn dắt. Không viết câu dài bằng chữ viết tay.
- Chữ chính tối đa ~4 từ một dòng, tối đa 2 dòng.
- Bớt chất "food vlog": không bay bổng, không chữ uốn lượn quá mức; giọng điềm đạm, doanh nghiệp.
- Chữ viết tay **không viết hoa**. Chữ chính luôn viết HOA.
- **Không dùng** lockup này cho: ưu đãi gấp / xả kho, tin nóng, cảnh báo, mẹo 15 giây kiểu phụ đề chạy từng chữ, video hài / meme, cảnh tốc độ.
- **Nên dùng** cho: bàn giao xe, cảnh quay chậm tay thợ, phỏng vấn chủ cơ sở, intro series, chuyển chương, kết video bằng slogan.

## 4. Màu

- **Mặc định: trắng tinh #FFFFFF** cho cả 2 giọng; không viền, không hộp.
- **Điểm nhấn thương hiệu (rất ít, cố định vị trí):** một chấm tròn nhỏ **hoặc** một gạch ngắn màu **xanh #4285F4**, luôn ở **cùng một vị trí**: bên trái chữ đầu của dòng chính, hoặc gạch dưới dòng chính rộng ~40% chiều dài dòng. Xanh lá **#17A85A** chỉ dùng khi thông điệp là tăng trưởng / kết quả (giống quy tắc web).
- Mỗi lockup tối đa **1** điểm nhấn màu. Lockup C bản chốt hiện **không** có điểm nhấn (trắng tinh theo spec); biến thể có điểm nhấn là tùy chọn (backlog B5).

## 5. Nhãn số liệu (giọng thứ ba)

- Chỉ dùng **số thật** có nguồn (báo cáo tháng, trang case study). Không làm tròn sai, không thổi phồng.
- Kiểu: chữ không chân của web (Be Vietnam Pro / Mona Sans) 600, **chữ số đều** (tabular), cỡ ~35–40% chữ chính.
- Dạng viên: nền đen trong 55–60%, viền mảnh xanh nhạt; số kết quả màu xanh lá **#45D17F** trên nền tối.
- Mẫu: `292 → 20.115 lượt xem Facebook · 2 tháng`.

## 6. Dễ đọc cho người 45–55 tuổi xem trên điện thoại

- Cỡ tối thiểu ở khung 1080×1920: chữ chính **≥ 80px**, chữ viết tay **≥ 70px**, nhãn số liệu **≥ 34px**.
- Mặc định chỉ tách lớp bằng **bóng mờ tán xạ** (đen 40%, blur ≈ 0,2 × cỡ chữ, lệch 0).
- **Ngoại lệ có điều kiện:** khi vùng nền sau chữ sáng (độ sáng trung bình > ~45%) hoặc nhiều chi tiết, thêm **lớp tối mờ 20–30%** dạng dải chuyển (gradient) phía sau khối chữ. Không dùng hộp đặc.
- Giữ chữ trên màn hình **≥ 2,5 giây** (+0,25 giây cho mỗi từ ngoài 6 từ).

## 7. Series & đặt tên

- Tên series cố định: **"Hành trình giải phóng người chủ"** (chờ anh Đức xác nhận chính thức).
- Mỗi video là **một tập**, mỗi khách là **một chặng**: `Hành trình giải phóng người chủ · Tập 01 · Đến tận tiệm`.
- Lockup intro: dòng viết tay *"hành trình giải phóng người chủ cùng"* + chữ chính **TĂNG TRÍ ĐỨC**.
- Khớp với con đường 3D trên trang Về Founder (mỗi cột mốc = một chặng).

## 8. Quay & hậu kỳ

- **Vùng yên tĩnh:** mỗi cảnh có chữ phải chừa một mảng nền tối/đơn giản đủ chứa khối chữ (tường, trời, thân xe, mặt đường). Bố cục khi quay: để trống 1/3 khung.
- **Hậu cảnh mờ:** ưu tiên xóa phông **thật** khi quay (khẩu lớn, đứng xa nền). Xóa phông giả lập bằng hậu kỳ đã thử 05/11 và **không đạt** (vệt cắt lộ).
- **Chuyển động máy:** lia chậm, trượt êm, quay chậm 60–120fps cho cảnh thợ làm.
- **Vùng an toàn 9:16** (Reels / TikTok / Shorts): không đặt chữ ở trên 12%, dưới 20%, bên phải 15%. **16:9:** title-safe 5%.
- **Cân màu thống nhất** (preset đã dùng cho footage AP Car Care, ffmpeg):
  `eq=contrast=1.08:brightness=-0.03:saturation=0.82:gamma=0.98,colorbalance=rs=-0.05:gs=-0.01:bs=0.07:rh=0.02:bh=0.01,curves=master='0/0.03 0.25/0.21 0.75/0.77 1/0.96',vignette=angle=PI/5`
  (bóng nghiêng về xanh navy, không còn tông vàng cũ). Footage hero website đã cân màu riêng trong `scripts/build-hero-frames.mjs`.

## 9. Chuyển động chuẩn

| Thành phần | Chuyển động | Thời gian |
|---|---|---|
| Chữ chính | Hiện + nâng 0,22em + bỏ mờ | 700ms, ease-out, trễ 350ms |
| Chữ viết tay | Tự viết ra trái → phải | 900ms, trễ 650ms |
| Cả khối, lúc tắt | Mờ dần | 400ms |
| *(chưa làm)* Vệt sáng quét ngang chữ chính | Một dải sáng chạy qua chữ sau khi hiện | ~600ms (backlog E2) |

Không nảy, không rung, không âm thanh gắt. Website dùng cùng chuyển động (backlog E3).

## 10. Trước khi xuất bản một lockup

- [ ] Font có dấu tiếng Việt (mục 2), dấu không chạm dòng trên/dưới (giãn dòng chữ chính ≥ 1,15)
- [ ] Chữ viết tay 3–6 chữ, chữ thường
- [ ] Nằm trong vùng yên tĩnh và vùng an toàn
- [ ] Tối đa 1 điểm nhấn màu, đúng vị trí cố định
- [ ] Số liệu (nếu có) là số thật, có nguồn
- [ ] Cỡ chữ ≥ mức tối thiểu ở mục 6
- [ ] Render thử 1 khung bằng đúng công cụ xuất (libass / CapCut) so với bản đã duyệt

## 11. Lockup trên website (08/11/2026, backlog F4–F7)

- Component duy nhất: `components/Lockup.tsx` (CSS `.lockup*` trong `app/globals.css`). Font qua 2 vai trò `lockup` / `script` ở `lib/fonts.ts`. Không tự viết lại kiểu chữ này ở chỗ khác.
- Cùng thông số với template video #12: thư pháp 1,02 lần cỡ chữ chính (0,9 ở tiêu đề trang), nép lên đỉnh chữ chính 0,17em, chữ chính in hoa, giãn chữ +3%, giãn dòng 1,18. Trên nền tối: trắng + bóng mờ 40%. Trên nền sáng: màu ink, không bóng.
- Chuyển động như video: chữ chính hiện + nâng + bỏ mờ, rồi thư pháp viết ra. Hero và tiêu đề trang chạy khi tải trang; section chạy lần đầu cuộn tới (chỉ khi nằm dưới màn hình lúc mở trang). Người bật giảm chuyển động thấy chữ đứng yên.
- Cỡ: `hero` (trang chủ) · `page` (tiêu đề ngắn: Về Founder) · `title` (tên dịch vụ dài) · `section`.
- Đang dùng ở: hero trang chủ · 3 section trang chủ (5 trụ cột, Người đồng hành, CTA cuối) · Về Founder · 5 trang dịch vụ. **Tiết chế:** không thêm section mới nếu chưa hỏi anh Đức; mỗi trang tối đa 1 lockup ở đầu trang + vài section chọn lọc.
- Chữ: `messages/*.json` (`systemHero.open.accent`, `home.*Accent/*Anchor`, `about.nameAccent`) và `accent` của từng dịch vụ trong `lib/servicesCatalog.ts`. Thư pháp viết chữ thường, ngắn (≤ 6–7 chữ).
