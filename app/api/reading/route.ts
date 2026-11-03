import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

// Lead from the knowledge-page reading compass (components/blog/ReadingCompass.tsx).
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  pain: z.string().trim().max(160),
  posts: z.array(z.string().trim().max(200)).max(6),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, pain, posts } = parsed.data;

  try {
    await sendNotificationEmail({
      subject: `[Kiến thức] ${name} — đang vướng: ${pain}`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Chỗ đang vướng:</strong> ${escapeHtml(pain)}</p>
        <p><strong>Lộ trình đọc đã xem:</strong></p>
        <ol>${posts.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ol>
        <p><em>Nguồn: "La bàn đọc" trên trang Kiến thức. Khách muốn founder gọi 15 phút để áp dụng vào cơ sở của mình.</em></p>
      `,
    });
  } catch (error) {
    console.error("[api/reading] failed to send email:", error);
    return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
