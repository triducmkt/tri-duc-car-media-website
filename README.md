# Trí Đức Car Media — website

Website song ngữ (VI/EN) cho Trí Đức Car Media, xây bằng Next.js (App Router) +
Sanity CMS, tập trung vào thương hiệu cá nhân của founder Tăng Trí Đức.

**Đang chạy trực tiếp tại:**
- Website: https://triduccar.media (và https://www.triduccar.media)
- Sanity Studio (quản trị nội dung): https://tri-duc-car-media.sanity.studio
- Preview URL dự phòng: https://tri-duc-car-media.triduc-car-media.workers.dev

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- [next-intl](https://next-intl.dev) — song ngữ `/vi` (mặc định) và `/en`, URL bản địa hoá (`/vi/dich-vu`, `/en/services`, ...)
- [Sanity](https://www.sanity.io) — CMS cho Case study, Blog, Testimonial. Studio deploy **độc lập** tại sanity.studio (không nhúng trong app) — Cloudflare Workers free tier giới hạn 3 MiB/worker, không đủ chỗ cho UI Studio.
- [Resend](https://resend.com) (HTTP API) — gửi email từ form Liên hệ & Đặt lịch tư vấn (`/api/contact`, `/api/booking`). Dùng HTTP thay vì SMTP vì Cloudflare Workers không mở được kết nối SMTP thô.
- [OpenNext for Cloudflare](https://opennext.js.org/cloudflare) (`@opennextjs/cloudflare` + `wrangler`) — adapter build Next.js thành Cloudflare Worker.

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000 (tự chuyển tới `/vi`).

```bash
npm run build && npm start   # kiểm thử Next.js build thường
npm run lint
npx tsc --noEmit
```

## Cấu hình biến môi trường

Copy `.env.example` thành `.env.local` và điền:

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — tạo project miễn phí tại https://www.sanity.io/manage. Studio đã deploy tại https://tri-duc-car-media.sanity.studio (CORS cho domain này được Sanity tự quản lý). Nếu chạy Studio cục bộ (`npx sanity dev`) thì cần tự thêm `http://localhost:3333` vào **API → CORS Origins**.
- `SANITY_API_TOKEN` — chỉ cần nếu muốn chạy script import có sẵn (xem bên dưới); tạo tại **API → Tokens**, quyền **Editor**.
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL` — tài khoản Resend (free tier) dùng gửi email khi có người điền form. **Chưa cấu hình thì form vẫn chạy bình thường** — nội dung chỉ được log ra console thay vì gửi email thật, không lỗi. Chưa xác thực domain trong Resend thì để trống `RESEND_FROM_EMAIL`, hệ thống tự dùng địa chỉ sandbox `onboarding@resend.dev` (chỉ gửi được về đúng email đã tạo tài khoản Resend).
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
chưa được tự động upload — vào Studio (https://tri-duc-car-media.sanity.studio)
để gắn ảnh cho case study nếu muốn. Đây cũng là mẫu để soạn thêm case study
khác: sao chép file script, đổi `_id`/`slug`/nội dung theo dự án mới.

## Deploy lên Cloudflare (đã setup xong — đây là ghi chú để deploy lại)

Domain `triduccar.media` trỏ nameserver về Cloudflare, nên host trực tiếp
trên **Cloudflare Workers** — miễn phí, không cần mua hosting riêng.

**Website (Next.js Worker):**

1. Đăng nhập Wrangler một lần (mở trình duyệt để bạn tự xác thực tài khoản
   Cloudflare — Claude không tự đăng nhập giúp được bước này):
   ```bash
   npx wrangler login
   ```
2. Build + deploy:
   ```bash
   npm run cf:deploy
   ```
   Chạy `opennextjs-cloudflare build` (đóng gói Next.js thành Cloudflare
   Worker) rồi `wrangler deploy`. Domain `triduccar.media` /
   `www.triduccar.media` đã được khai báo sẵn trong `wrangler.jsonc`
   (`routes` với `custom_domain: true`) nên mỗi lần deploy sẽ tự cập nhật cả
   2 domain, không cần thao tác gì thêm trên Dashboard.
3. Biến môi trường production quản lý qua Worker secrets (khác với
   `.env.local` chỉ dùng khi `next dev`):
   ```bash
   npx wrangler secret put NEXT_PUBLIC_SANITY_PROJECT_ID
   npx wrangler secret put NEXT_PUBLIC_SANITY_DATASET
   npx wrangler secret put SANITY_API_TOKEN
   npx wrangler secret put RESEND_API_KEY
   npx wrangler secret put RESEND_FROM_EMAIL
   npx wrangler secret put CONTACT_TO_EMAIL
   ```
   (hoặc nhập trong Cloudflare Dashboard → Workers & Pages → `tri-duc-car-media`
   → **Settings → Variables and Secrets**). Đã set xong các biến Sanity +
   `CONTACT_TO_EMAIL`; `RESEND_API_KEY`/`RESEND_FROM_EMAIL` còn để trống nên
   form hiện chỉ log ra Worker logs thay vì gửi email thật — điền khi có tài
   khoản Resend.

**Lưu ý khi gắn custom domain lần đầu** (đã xử lý xong, chỉ cần nếu tạo lại
Worker từ đầu): Wrangler **không tự ghi đè** DNS record đã tồn tại ở
`triduccar.media`/`www.triduccar.media` — nếu có record cũ (A/CNAME, ví dụ
CNAME parking của Namecheap) phải xoá thủ công trong Cloudflare Dashboard →
DNS → Records trước, rồi `wrangler deploy` mới tạo được custom domain.

**Sanity Studio (deploy độc lập, không nằm trong Worker):**

```bash
npx sanity login --provider google   # hoặc github / email tuỳ tài khoản
npm run studio:deploy
```

Deploy lên `https://tri-duc-car-media.sanity.studio` — cấu hình hostname nằm
ở `sanity.cli.ts`. Chạy lại `npm run studio:deploy` mỗi khi đổi schema trong
`sanity/schemaTypes/`.

**Kiểm thử trước khi deploy thật**: `npm run cf:build && npx wrangler dev`
chạy toàn bộ app (kể cả `/api/*`) trên Workers runtime giả lập tại
`http://localhost:8787` — dùng để phát hiện lỗi tương thích trước khi deploy.

## Deploy thay thế: Namecheap Shared/Stellar hosting (cPanel)

Nếu sau này muốn chuyển sang hosting trả phí trên Namecheap thay vì
Cloudflare Pages, repo đã có sẵn `server.js` (entry point Node.js thuần cho
Phusion Passenger):

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

`server.js` dùng cùng codebase Next.js bình thường (`next build`/`next
start`), không phụ thuộc `@opennextjs/cloudflare` — hai đường deploy này độc
lập với nhau, không xung đột.
