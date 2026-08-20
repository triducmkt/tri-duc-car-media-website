# Trí Đức Car Media — website

Website song ngữ (VI/EN) cho Trí Đức Car Media, xây bằng Next.js (App Router) +
Sanity CMS, tập trung vào thương hiệu cá nhân của founder Tăng Trí Đức.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- [next-intl](https://next-intl.dev) — song ngữ `/vi` (mặc định) và `/en`, URL bản địa hoá (`/vi/dich-vu`, `/en/services`, ...)
- [Sanity](https://www.sanity.io) — CMS cho Case study, Blog, Testimonial (Studio nhúng tại `/studio`)
- Nodemailer — gửi email từ form Liên hệ & Đặt lịch tư vấn (`/api/contact`, `/api/booking`)

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000 (tự chuyển tới `/vi`).

```bash
npm run build && npm start   # kiểm thử bản production trước khi deploy
npm run lint
```

## Cấu hình biến môi trường

Copy `.env.example` thành `.env.local` và điền:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — tạo project miễn phí tại https://www.sanity.io/manage, sau đó vào `/studio` trên site để thêm Case study / Blog / Testimonial.
- `SANITY_API_TOKEN` — chỉ cần nếu muốn chạy script import có sẵn (xem bên dưới); tạo tại **API → Tokens**, quyền **Editor**.
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` — tài khoản email dùng để gửi thông báo khi có người điền form (Namecheap Private Email, Gmail App Password, v.v). **Chưa cấu hình thì form vẫn chạy bình thường** — nội dung sẽ chỉ được log ra console thay vì gửi email thật, không lỗi.
- `CONTACT_TO_EMAIL` — email nhận thông báo (mặc định `tangtriduc@triduccar.media`).

## Nội dung cần bạn duyệt

Toàn bộ copy VI/EN trong `messages/vi.json` và `messages/en.json` là bản nháp
soạn từ thông tin name card — nên đọc lại và chỉnh trước khi công khai chính
thức, đặc biệt các trang Về Founder và Dịch vụ.

Ảnh chân dung founder: đã có tại `public/founder/tang-tri-duc.png` (xem
`public/founder/README.md`) — site tự nhận diện, có fallback chữ lồng "TTĐ"
nếu file bị thiếu.

## Import case study có sẵn

`scripts/seed-case-study-ap-car-care.mjs` tạo sẵn 1 case study "AP Car Care"
(song ngữ, đầy đủ số liệu) trong Sanity. Sau khi đã tạo project Sanity và có
`SANITY_API_TOKEN` (quyền Editor) trong `.env.local`, chạy:

```bash
npm run seed:ap-car-care
```

Case study sẽ xuất hiện ngay tại `/vi/du-an` và `/en/case-studies`. Ảnh bìa
chưa được tự động upload — vào `/studio` để gắn ảnh cho case study nếu muốn.
Đây cũng là mẫu để soạn thêm case study khác: sao chép file script, đổi
`_id`/`slug`/nội dung theo dự án mới.

## Deploy lên Namecheap (Shared/Stellar — cPanel)

1. **Đẩy code lên GitHub** (repo riêng của bạn).
2. Trên cPanel: **Git™ Version Control** → Create → dán URL repo GitHub → chọn
   thư mục đích (vd. `triduc-car-media`). Nếu repo private, dùng Personal
   Access Token của GitHub làm mật khẩu khi clone qua HTTPS.
3. Trên cPanel: **Setup Node.js App** → Create Application:
   - Node.js version: bản mới nhất có sẵn (>= 20)
   - Application root: thư mục đã clone ở bước 2
   - Application URL: domain/subdomain của bạn
   - Application startup file: `server.js`
4. Trong giao diện Node.js App, mở **Run NPM Install**, sau đó mở terminal của
   ứng dụng (hoặc dùng nút "Run JS Script") để chạy `npm run build`.
5. Vào **Environment Variables** trong Node.js App, thêm toàn bộ biến trong
   `.env.example` (không commit `.env.local` lên GitHub).
6. Nhấn **Restart** trong Setup Node.js App để app chạy `server.js`.
7. Cập nhật code sau này: vào Git Version Control → **Pull or Deploy**, rồi
   lặp lại bước 4 (install + build) và Restart app.

Nếu gói hosting hiện tại giới hạn tài nguyên khiến Node.js App không ổn định,
phương án dự phòng là build tĩnh (`next.config.ts` thêm `output: "export"`)
và host như static site trên cùng cPanel — sẽ cần điều chỉnh vì khi đó 2 API
route (`/api/contact`, `/api/booking`) phải chuyển sang dịch vụ ngoài
(vd. Formspree) hoặc script PHP có sẵn trên cPanel.
