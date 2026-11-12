# Bộ quy tắc cốt lõi thiết kế — Trí Đức Media (website, logo, video)

> **BẮT BUỘC ĐỌC ĐẦU TIÊN.** Anh Đức chốt 08/11/2026. Mọi agent (Claude, Codex, Antigravity…),
> **mỗi lần sửa hoặc cải thiện website** (giao diện, chữ, ảnh, logo, template), phải đọc hết file này
> **trước khi suy nghĩ, đánh giá và làm**. Quy tắc ở đây đứng trên thói quen thiết kế riêng của từng agent.
> Chi tiết từng mảng nằm ở các file được dẫn link; file này là bản tóm tắt bắt buộc.

## 0. Quy trình 4 bước (không bỏ bước)

1. **Đọc:** file này + `docs/DESIGN-BRIEF.md` (phong cách anh Đức mong muốn) + `docs/brand-backlog.md` (việc dang dở) + file quy cách liên quan (bảng ở mục 6).
2. **Nghĩ:** yêu cầu chạm tới quy tắc nào dưới đây? Ghi ra trước khi viết code.
3. **Đánh giá:** so phương án với từng quy tắc. Quy tắc nào đo được thì đo (mục 5), không ước bằng mắt.
4. **Làm & kiểm:** sửa, chạy đủ lệnh kiểm ở mục 5, chụp màn hình máy tính 1280px + điện thoại 390px, rồi mới commit.

## 1. Trọng lượng thị giác 2 giọng: chính 75% / phụ 25% (quy tắc V)

Mọi cụm chữ có **2 giọng** — giọng chính (anchor, chữ IN HOA) và giọng phụ (accent, thư pháp) — phải đọc ra **chính áp đảo,
phụ như lời chú thích** (chính ≈ 75%, phụ ≈ 25%). Áp dụng cho: lockup trên web (`components/Lockup.tsx`), chữ trên video /
thumbnail (`docs/typography-lockup.md`), và **chữ của logo** (tên chính so với chữ phụ như MEDIA).

**Trọng lượng thị giác đo bằng KÍCH THƯỚC mà mắt nhìn thấy: chiều cao + bề ngang + số dòng. KHÔNG đo bằng diện tích mực**
(đã thử 08/11/2026: thư pháp nét mảnh nên muốn "đủ mực" phải phóng to ngang chữ chính, kết quả nhìn ra 50/50 — anh Đức bác).

### 3 quy tắc cốt lõi (anh Đức chốt 08/11/2026)

| Mã | Quy tắc | Cách kiểm |
|---|---|---|
| **V1** | **Nét cao nhất của dòng phụ = 0,30 × chiều cao chữ in hoa của dòng chính** (cho phép 0,27–0,33). "Nét cao nhất" = nét chữ cao nhất của thư pháp (h, l, đ, k, b, chữ hoa…), tính từ chân chữ; **không tính dấu** (sắc, huyền, mũ… là dấu, không phải nét). Ví dụ: chữ in hoa cao 60px → nét cao nhất thư pháp 18px. | `npm run lockup:qc` (tính từ file font) + `npm run lockup:check` (đo trên trang thật) |
| **V8** | **Dòng chính và dòng phụ mỗi dòng nằm trên ĐÚNG 1 DÒNG ở ≥ 90% số lockup** (đếm trên máy tính 1280px và điện thoại 390px). Chỉ được xuống dòng khi cắt câu sẽ sai ý, lệch ý hoặc tối nghĩa; khi đó ngắt dòng có chủ đích bằng ký tự xuống dòng (viết `\n`) trong câu chữ. Dòng chính tự co cỡ cho vừa khung, không bao giờ tràn hay tự rớt dòng. | `lockup:qc` + `lockup:check` |
| **V9** | **Bắt buộc loop QC:** đo → nếu bất kỳ quy tắc nào chưa đạt → **viết lại cả 2 giọng** (rút gọn dòng chính, đổi chữ dòng phụ) → đo lại → lặp tới khi `lockup:qc` và `lockup:check` đều báo đạt. **Không** sửa bằng cách ép cỡ chữ, giảm giãn chữ hay thêm ngoại lệ. Ghi số vòng lặp vào log. | 2 lệnh trên phải ra ✓ trước khi commit |

### Quy tắc đi kèm

| Mã | Quy tắc |
|---|---|
| **V1b** | *(anh Đức chốt 08/11/2026)* **Dòng chính có từ 2 dòng** (ngoại lệ V8): nét cao nhất của dòng phụ = **0,30 × chiều cao CẢ KHỐI dòng chính**, tính từ đỉnh chữ in hoa dòng đầu tới chân dòng cuối (= chữ in hoa + (số dòng − 1) × giãn dòng). Với 2 dòng ≈ 0,8 × chữ in hoa, dòng phụ dàn gần hết bề ngang (~96%). Vẫn giữ V2. Không dàn ngang bằng giãn chữ hay kéo khoảng trắng (chữ viết tay bị đứt nét). Hệ thống tự áp dụng (`lockup:qc`, `lockup:check`). |
| **V2** | Dòng phụ **không rộng hơn** dòng dài nhất của dòng chính. |
| **V3** | Nét móc của dòng phụ (g, y…) **không chạm dấu** của dòng chính (Ẫ, Ể, Ố…). Khoảng cách 2 dòng tính theo cỡ dòng chính. |
| **V4** | Dòng chính: Playfair Display 900, IN HOA, giãn chữ +3%, giãn dòng 1,18, ưu tiên ≤ 15 ký tự. Dòng phụ: Great Vibes, chữ thường như gõ, **≤ 5 chữ**, tắt ghép chữ (ligature) để nét không vượt số đo. Một màu cho cả 2 (trắng + bóng mờ 40% trên nền tối, ink trên nền sáng). |
| **V6** | Tiết chế: mỗi màn hình tối đa 1 lockup. Trang chủ = hero + đúng 3 section. Trang con = 1 lockup ở đầu trang. Thêm chỗ mới phải hỏi anh Đức. |
| **V7** | Giọng thứ ba (nhãn số liệu, slogan dưới logo, tên đầy đủ của dịch vụ dưới lockup) không tính vào cặp 2 giọng; dùng chữ không chân của web. |
| **V10** | Dòng phụ trên điện thoại **≥ 12px**. Nếu không đạt → dòng chính phải ngắn lại để được to hơn (V9). Lưu ý: theo V1, thư pháp rất nhỏ; 12–15px trên điện thoại là mức tối thiểu còn đọc được. |
| **V11** | *(logo, anh Đức chốt 08/11/2026 — phương án B "sàn 12px")* Chữ **media** của logo **không bao giờ nhỏ hơn 12px** khi hiển thị. Logo đủ lớn (chữ in hoa TRÍ ĐỨC ≥ 25px, tức logo không slogan cao ≥ 59px / rộng ≥ 171px: footer, thẻ bài viết, slide, video) giữ đúng 0,3. Logo nhỏ hơn (header web, chữ ký email) dùng **bản sàn 12px**: chữ media phóng tới 12px, tỷ lệ thành ~0,44 — được phép bỏ qua V1 có chủ đích. File: `public/brand/logo.svg` / `logo-light.svg` = bản sàn 12px cho header (đặt rộng 116–121px); `logo-full*.svg` = bản 0,3. |

**Cách hệ thống làm:** `npm run lockup:qc` đọc câu chữ (`messages/*.json`, `lib/servicesCatalog.ts`), đo bằng file font thật
(`scripts/fonts/`), ghi `lib/lockupMetrics.json` (bề ngang dòng chính + tỷ lệ cỡ dòng phụ cho từng câu). `<Lockup>` đọc file
này: dòng chính co vừa khung trên 1 dòng, dòng phụ đúng 0,30. **Đổi câu nào cũng phải chạy lại `lockup:qc`** (thiếu số đo thì
lockup hiện cỡ dự phòng và cảnh báo ở môi trường dev).

## 2. Màu (tóm tắt — chi tiết `docs/color-system.md`)

Xanh dương `#4285F4` 30% · đen `#0B1220` 30% · trắng 25% · xanh lá `#17A85A` 10% (chỉ nghĩa tích cực) ·
khác 5% (đỏ chỉ cho cảnh báo). Không dùng bảng màu mặc định Tailwind. Kiểm: `npm run colors:check`.

## 3. Chữ (tóm tắt — chi tiết `docs/font-system.md`, `docs/typography-lockup.md`)

- Font chỉ chọn ở `lib/fonts.ts`, theo 5 vai trò, **3 họ font** (từ 08/11/2026): body + display = **Commissioner** (chữ thân, nút, menu, con số, giá, nhãn), serif = **Playfair Display** (mọi tiêu đề h1–h3 chữ thường đầu câu 600–700, trích dẫn italic), lockup = Playfair Display 900 IN HOA (cùng file với serif), script = **Great Vibes**. Toàn web nói đúng 2 giọng của logo + hero. Không ghi tên font trong component. Kiểm: `npm run fonts:check`.
- Tiêu đề h1–h3 luôn `font-serif`; `font-display` chỉ cho con số, giá, chỉ số, eyebrow, nhãn, badge. Không dùng Playfair 900 IN HOA ngoài lockup (để lockup giữ vị trí nổi bật nhất).
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
| `npm run lockup:qc` rồi `npm run lockup:check` (cần `npm run dev` đang chạy, hoặc truyền URL website) | Khi sửa lockup, câu chữ của lockup, font, cỡ chữ (loop V9 tới khi cả 2 ✓) |
| `npx tsc --noEmit` + eslint file đã sửa | Khi sửa code |
| Chụp màn hình 1280px + 390px | Khi sửa giao diện |

## 6. Bản đồ quy cách

| Mảng | File |
|---|---|
| **Nhu cầu & phong cách anh Đức mong muốn (đối chiếu mỗi lần cải tiến)** | `docs/DESIGN-BRIEF.md` |
| Việc dang dở | `docs/brand-backlog.md` |
| Màu | `docs/color-system.md` |
| Font web | `docs/font-system.md` |
| Lockup, chữ trên video / thumbnail | `docs/typography-lockup.md` |
| Logo | `design/logo-tri-duc-media/BRAND-BRIEF.md`, `HISTORY.md` |
