# Backlog thương hiệu & website — Trí Đức Media

> **Đọc file này mỗi lần review hoặc cải tiến website** (mọi agent: Claude, Codex, Antigravity…).
> Đây là danh sách **đề xuất và tham khảo**, không phải lệnh bắt buộc: mỗi lần làm, chọn việc theo ưu tiên,
> hỏi anh Đức nếu cột "Cần anh Đức" có ghi, làm xong thì đổi `☐` thành `☑` và ghi ngày + commit ở cột Ghi chú.
> Tạo 06/11/2026 (Claude Code). Nguồn: rà soát phong cách 05/11 (`hq/08-DESIGN-AUDIT-2026-11-05.md`),
> phân tích kiểu chữ Zermatt Neo, spec Editorial Font Pairing, lockup C đã chốt.

**Quy cách liên quan:** màu `docs/color-system.md` · font web `docs/font-system.md` · chữ & lockup video `docs/typography-lockup.md` · đo hiệu quả `hq/09-BRAND-KPI-TRACKER.md`.

**Cách đọc cột:** Ưu tiên P1 (làm trước) → P3 · Độ khó: Nhanh (< 1 giờ) / Vừa (một phiên) / Lớn (nhiều phiên hoặc cần quay, cần tư liệu).

---

## A. Khẩn — vận hành website

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| A1 | Xử lý Cloudflare Error 1027 (hết 100.000 request/ngày của Workers Free; reset 07:00 giờ VN) | P1 | Vừa | Chọn: nâng Workers Paid 5 USD/tháng (anh tự làm trên dashboard) và/hoặc để agent tắt prefetch link tự động ở header/footer | ☑ | 07/11 · phiên khác đã tắt prefetch (471f263, c41573f, a8e9563): link chỉ tải khi bấm, icon lấy từ public/, gửi tracking 60 giây/lần. Nâng gói Paid vẫn là tùy chọn của anh Đức. |
| A2 | Theo dõi quota Workers sau khi xử lý A1 (request/ngày, đường dẫn tốn request nhất) | P1 | Nhanh | Cấp quyền xem analytics | ☐ | |

## B. Quy cách chữ & lockup (nền tảng cho video và web)

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| B1 | Ghi quy cách chữ & lockup vào docs để mọi agent dùng thống nhất | P1 | Nhanh | — | ☑ | 06/11 · `docs/typography-lockup.md` |
| B2 | Danh sách font đã kiểm có / không có dấu tiếng Việt | P1 | Nhanh | — | ☑ | 06/11 · mục 2 của `docs/typography-lockup.md` (kiểm từ dữ liệu Google Fonts) |
| B3 | Quy tắc B2B: chữ viết tay chỉ làm điểm nhấn 3–6 chữ, không câu dài; bớt chất "food vlog" | P1 | Nhanh | — | ☑ | 06/11 · mục 3 |
| B4 | Điểm nhấn màu thương hiệu rất ít, cố định vị trí (chấm hoặc gạch #4285F4 / #17A85A), trắng vẫn là chủ đạo — **quy cách** | P1 | Nhanh | — | ☑ | 06/11 · mục 4 |
| B5 | Điểm nhấn màu (B4) — **đưa vào template video** (biến thể có chấm/gạch của TPL #12) | P2 | Vừa | Duyệt mẫu | ☐ | Lockup C hiện trắng tinh theo spec; biến thể có điểm nhấn là tùy chọn |
| B12 | Cân lại template video `TPL_EDITORIAL_DUAL_TYPE_12` theo quy tắc V1/V8 mới: thư pháp đang to ngang chữ chính (93px / 91px), cần nét cao nhất = 0,3 chữ in hoa | P1 | Nhanh | Duyệt | ☐ | Phát hiện 08/11 khi viết `docs/DESIGN-CORE-RULES.md`; web đã cân, video chưa |
| B6 | Lockup C chốt: Playfair Display 900 + Great Vibes, template `TPL_EDITORIAL_DUAL_TYPE_12` | P1 | Vừa | — | ☑ | 05–06/11 · đã render thử libass, font ở `ai-video-editor/assets/fonts/Editorial` |
| B7 | Tên series cố định "Hành trình giải phóng người chủ" + cách đặt tên tập | P1 | Nhanh | Duyệt tên | ☑ | 06/11 · quy cách ở mục 7 (tên chờ anh Đức xác nhận chính thức) |
| B8 | Giọng thứ ba "nhãn số liệu" (số thật, kiểu chữ số đều) — **quy cách** | P1 | Nhanh | — | ☑ | 06/11 · mục 5 |
| B9 | Nhãn số liệu — **template video + dùng trên web** | P2 | Vừa | — | ☐ | |
| B10 | Dễ đọc cho người 45–55 tuổi trên điện thoại: cỡ tối thiểu + lớp tối 20–30% chỉ khi nền sáng — **quy cách** | P1 | Nhanh | — | ☑ | 06/11 · mục 6 (ngoại lệ có điều kiện, không phá spec chữ trắng tinh) |
| B11 | Chữ viết tay riêng của anh Đức thay font viết tay có sẵn (số hóa thành font hoặc bộ chữ SVG) | P2 | Lớn | Viết tay 20–30 chữ hay dùng ra giấy, chụp gửi | ☐ | Điểm vượt trội lớn nhất so với Zermatt |

## C. Quay & hậu kỳ

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| C1 | Quy tắc quay & hậu kỳ: vùng yên tĩnh, hậu cảnh mờ, cân màu thống nhất (preset cân màu dùng lại được) | P1 | Nhanh | — | ☑ | 06/11 · mục 8 của `docs/typography-lockup.md` |
| C2 | Quay cảnh mới đạt spec cho lockup (lia chậm, khẩu lớn, xóa phông thật) | P2 | Lớn | Lịch quay | ☐ | Footage 12/09/2025 chỉ đạt một phần; xóa phông giả lập đã thử và bỏ |

## D. Bộ template video

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| D1 | Kết video / slogan (lockup C) | P1 | Vừa | — | ☑ | `TPL_EDITORIAL_DUAL_TYPE_12` (9:16 + 16:9) |
| D2 | Intro kênh YouTube (lockup A: *hành trình giải phóng người chủ cùng* / TĂNG TRÍ ĐỨC) | P2 | Vừa | Duyệt | ☐ | Bản nháp A: https://claude.ai/artifact/5vysMWpFbAzz9Yz1AWYEBG |
| D3 | Tiêu đề case study (lockup B + nhãn số liệu) | P2 | Vừa | Duyệt | ☐ | |
| D4 | Lower third tên khách / chủ cơ sở | P2 | Vừa | — | ☐ | |
| D5 | Thumbnail YouTube (lockup D) | P2 | Vừa | Duyệt | ☐ | |
| D6 | Bìa bài Fanpage | P3 | Vừa | — | ☐ | |

## E. Chuyển động chuẩn

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| E1 | Chữ viết tay "tự viết ra" theo nét (~0,8–0,9 giây) | P1 | Vừa | — | ☑ | Có trong TPL #12 (lộ dần trái → phải 900ms) |
| E2 | Chữ đậm hiện lên với một vệt sáng quét ngang | P2 | Vừa | Duyệt | ☐ | TPL #12 hiện dùng "hiện + nâng + bỏ mờ"; cần thêm vệt sáng |
| E3 | Dùng cùng chuyển động trên video, thumbnail và website (three.js / CSS) | P2 | Vừa | — | ☐ | Phụ thuộc E2 và nhóm F |

## F. Website (đợi sau 07:00 reset Cloudflare và xử lý A1 rồi mới deploy)

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| F1 | Font chữ nhỏ đậm hơn (đề xuất Be Vietnam Pro 500), tăng độ tương phản chữ mờ | P1 | Vừa | Chọn font | ☐ | Bản nháp: https://claude.ai/artifact/QaUvuddUDzdfRdKLU3sEbL |
| F2 | Thẻ premium trên nền sáng (viền gradient xanh dương → xanh lá, bóng nhiều lớp luôn hiện) | P1 | Vừa | Duyệt hướng | ☑ | 08/11 · class `card-premium` (app/globals.css) cho thẻ 5 trụ cột, dự án, bài viết, lời khách. 09/11: xong trang con — Về Founder (giá trị, 4 thẻ ý nghĩa logo), Liên hệ (thẻ kênh, form, pháp lý), trang dịch vụ, Kiểm tra 60s, chi tiết dự án; khung lớn (form, pháp lý, FAQ) dùng `card-premium is-static` (không nâng khi rê chuột) |
| F3 | Chuyển section sáng/tối bằng gradient; nền sáng có gradient loang nhẹ | P1 | Vừa | — | ☑ | 08/11 · `components/SectionSeam.tsx` (6 chỗ trang chủ) + nền `surface-light` / `surface-light-soft`. 09/11: xong trang con — Về Founder (3 seam), Dịch vụ (quanh VatAdvantage), trang dịch vụ, Dự án, Liên hệ, Kiểm tra 60s (2 seam), Kiến thức |
| F4 | Lockup chữ trên hero trang chủ | P2 | Vừa | Duyệt | ☑ | 08/11 · *để doanh nghiệp tự chạy,* / GIẢI PHÓNG NGƯỜI CHỦ — `components/Lockup.tsx` |
| F5 | Lockup chữ cho tiêu đề các section chính | P3 | Vừa | — | ☑ | 08/11 · đúng 3 section: 5 trụ cột, Người đồng hành, CTA cuối (*chủ vắng,* / KHÁCH VẪN ĐÔNG.) |
| F6 | Lockup chữ trên trang Về Founder | P2 | Vừa | — | ☑ | 08/11 · lockup A: *hành trình giải phóng người chủ cùng* / TĂNG TRÍ ĐỨC |
| F7 | Lockup chữ trên trang từng dịch vụ | P3 | Vừa | — | ☑ | 08/11 · câu thư pháp riêng từng dịch vụ ở `accent` trong `lib/servicesCatalog.ts` |
| F8 | 3D cho khu vực số liệu: 4 bước Quy trình, Tầm nhìn 2031, ô "Kết quả nổi bật" | P2 | Lớn | — | ☐ | |
| F9 | Nút gradient + bóng màu; eyebrow dạng viên; đường kẻ gradient; header kính mờ; footer dải gradient | P2 | Vừa | — | ☑ | 09/11 · xong: `btn-gradient` cho 8 nút CTA đứng riêng (VatAdvantage, PriceStudio, SystemBuilder, FreedomCalculator, BookingStudio, ContactForm, FounderJourney, trang dịch vụ); `eyebrow-pill` cho eyebrow tự viết (BrandStory, hero + tầm nhìn Về Founder, VatAdvantage). 08/11 · phần nền đã lên web (commit 584510a): class `btn-gradient` (Button primary), `eyebrow-pill` (SectionHeading), `header-glass`, `footer-strip` + `hairline-gradient` ở footer. **Còn lại:** gắn `btn-gradient` cho các nút CTA đứng riêng (VatAdvantage, PriceStudio, SystemBuilder, FreedomCalculator, BookingStudio, ContactForm, FounderJourney, trang dịch vụ) và eyebrow tự viết ngoài SectionHeading |
| F10 | Token bóng (3 cấp) + gradient chung trong `app/globals.css` | P3 | Nhanh | — | ☑ | 06/11 · `shadow-lift-1/2/3` + 5 biến `--gradient-*`, ghi ở mục 3b `docs/color-system.md`; đã dùng từ 08/11 (F2, F3) |

## G. Đo hiệu quả

| # | Việc | Ưu tiên | Độ khó | Cần anh Đức | Xong | Ghi chú |
|---|---|---|---|---|---|---|
| G1 | Bảng đo KPI: CTR thumbnail, tỉ lệ xem hết 3 giây đầu, số tin nhắn nhắc tên "anh Đức" | P1 | Nhanh | — | ☑ | 06/11 · `hq/09-BRAND-KPI-TRACKER.md` (khung + cách đo) |
| G2 | Ghi số mốc ban đầu (trước khi dùng phong cách mới) | P1 | Nhanh | Cấp số liệu YouTube Studio / Meta / Zalo | ☐ | |
| G3 | Đo lại sau 1–2 tháng dùng phong cách mới, so với mốc G2 | P2 | Nhanh | Cấp số liệu | ☐ | |

---

## Nhật ký cập nhật file này

- **09/11/2026 (Claude Code, phiên logo):** F9 phần nền đã lên web (584510a, do phiên redesign gom commit); đánh dấu ◐ kèm danh sách còn lại. F2/F3 cho trang con chưa làm, chờ anh Đức chọn phiên làm tiếp.

- **06/11/2026 (Claude Code):** tạo file; tick B1–B4, B6–B8, B10, C1, D1, E1, F10, G1. Chưa đưa gì lên website (đợi reset Cloudflare 07:00 và xử lý A1).
- **08/11/2026 (Claude Code):** tick A1 (phiên khác làm), F2, F3 (trang chủ + thẻ dùng chung).
- **08/11/2026 (Claude Code, lần 2):** anh Đức bác cách đo bằng mực (ảnh hero nhìn ra 50/50). Thêm 3 quy tắc V1 (nét cao nhất thư pháp = 0,3 chữ in hoa), V8 (1 dòng ≥ 90%), V9 (loop QC viết lại 2 giọng). Viết lại toàn bộ câu lockup qua 5 vòng QC; `lockup:qc` + `lockup:check` đạt 40/40, một dòng 36/40.
- **08/11/2026 (Claude Code):** (đã thay bằng mục trên) chỉnh F4–F7 theo quy tắc 75/25 (`docs/DESIGN-CORE-RULES.md`): 40/40 lockup đạt, đo bằng `npm run lockup:check`. Đổi câu section 5 trụ cột (*một hệ thống,* / 5 TRỤ CỘT TĂNG TRƯỞNG) và Về Founder (*hành trình cùng* / TĂNG TRÍ ĐỨC).
- **08/11/2026 (Claude Code):** tick F4–F7 — lockup C lên website (hero, 3 section trang chủ, Về Founder, 5 trang dịch vụ).
