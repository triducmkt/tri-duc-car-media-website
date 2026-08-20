/* eslint-disable @typescript-eslint/no-require-imports -- plain CommonJS entry point for Passenger, outside the Next.js build */
/**
 * Standalone entry point for hosting environments that run Next.js as a
 * plain Node.js process behind Phusion Passenger (e.g. Namecheap cPanel's
 * "Setup Node.js App"). Passenger sets `PORT` and expects the app to listen
 * on it — `next start` alone does not read that variable the same way.
 *
 * Local/dev workflow should keep using `npm run dev` / `npm run build && npm start`;
 * this file is only the production entry point cPanel points at.
 */
const { createServer } = require("http");
const next = require("next");

const port = Number(process.env.PORT) || 3000;
const dev = process.env.NODE_ENV !== "production";

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`> Trí Đức Car Media ready on port ${port}`);
  });
});
