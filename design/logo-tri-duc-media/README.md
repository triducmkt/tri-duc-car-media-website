# Logo Trí Đức Media — "Đ kim đo" (bản dựng 2026-11-04)

**Trạng thái:** đã dựng xong, CHƯA thay lên website (anh Đức yêu cầu "chỉ dựng, chưa thay").
Website vẫn dùng logo cũ ở `public/brand/`.

Xem nhanh toàn bộ bộ logo: `preview.png`.

**Quy trình vòng lặp + lịch sử từng phiên bản (kèm ảnh): [HISTORY.md](HISTORY.md). Brief thương hiệu: [BRAND-BRIEF.md](BRAND-BRIEF.md).**

## Ý nghĩa
- **Chữ Đ:** chữ ký của founder (Đức) và nét gạch ngang chỉ tiếng Việt mới có.
- **Phần cong của chữ Đ là cung đồng hồ**, chuyển từ cam (dưới) lên vàng (trên; từ v3, trước là đỏ). Ý nghĩa: đo sức khỏe cơ sở; càng lên càng thành tài sản, khớp với công cụ "Kiểm tra cơ sở 60 giây".
- **Nét gạch ngang của chữ Đ là cây kim chỉ lên vùng cao:** "Nâng tầm doanh nghiệp".
- **3 vạch số nằm dưới kim:** kim đã vượt qua toàn bộ thang đo, tức là doanh nghiệp vượt mức cũ. App icon không có vạch, vì vạch bị nhòe ở cỡ dưới 64px.
- **Trục kim màu cam nằm trên thân chữ:** người chủ là điểm tựa. Bộ máy chạy quanh người chủ, không cần người chủ ôm hết việc.

## Bộ file (`svg/`, dạng vector, chữ đã chuyển thành nét vẽ nên không cần cài font)
| File | Dùng khi |
|---|---|
| `tri-duc-media-horizontal-color.svg` | Logo chính: header web, tài liệu, slide, nền sáng |
| `tri-duc-media-horizontal-reverse.svg` | Nền tối hoặc nền navy |
| `tri-duc-media-vertical-*.svg` | Chỗ hẹp và cao: standee, bìa hồ sơ, avatar lớn |
| `tri-duc-media-mark-*.svg` | Biểu tượng đứng riêng |
| `tri-duc-media-app-icon.svg` | Favicon, avatar Zalo/Facebook, icon app |
| `*-mono-black.svg` / `*-mono-white.svg` | In 1 màu: con dấu, thêu áo, khắc, hóa đơn, fax |

PNG có sẵn trong `png/`: logo ngang 2000px, logo dọc 1600px, biểu tượng 1024px, app icon 1024/512/192/180/32px.

## Màu
| Vai trò | Mã |
|---|---|
| Navy (chữ, thân chữ Đ) | `#0B1220` (trùng màu chữ chính của website) |
| Cam (trục kim, đáy cung) | `#F7891C` |
| Vàng (đỉnh cung, từ v3) | `#DFA136` |
| Chữ MEDIA trên nền sáng | `#E0701A` |
| Chữ MEDIA trên nền tối | `#F0C069` |

## Quy tắc dùng
- **Khoảng trống quanh logo:** tối thiểu bằng chiều rộng thân chữ Đ ở mọi phía.
- **Cỡ tối thiểu:** logo ngang rộng ít nhất 120px trên màn hình hoặc 30mm khi in. Nhỏ hơn mức đó thì dùng biểu tượng đứng riêng hoặc app icon.
- **Chuyển màu:** chỉ dùng trên cung đồng hồ. Ở cỡ dưới 24px, hoặc khi in 1 màu, dùng bản mono.
- **Không làm:** kéo méo tỉ lệ, đổi font, thêm bóng đổ hay viền, xoay biểu tượng, đặt logo màu lên ảnh nền rối (khi đó dùng bản reverse hoặc mono-white).
- **Tên thương hiệu là "Trí Đức Media".** Tên pháp lý "Công ty TNHH Trí Đức Car Media" chỉ dùng ở hóa đơn, hợp đồng và dòng pháp lý.

## Dựng lại
Font: Be Vietnam Pro ExtraBold (dòng TRÍ ĐỨC) và SemiBold (dòng MEDIA), giấy phép OFL.
`NODE_PATH=<thư mục có opentype.js> node design/logo-tri-duc-media/build.mjs <thư mục font>`
