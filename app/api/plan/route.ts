import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

// Lead from the services-page "Build your system" tool (components/services/SystemBuilder.tsx).
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  pains: z.array(z.string().trim().max(120)).max(20),
  services: z.array(z.string().trim().max(120)).min(1).max(10),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, pains, services } = parsed.data;

  try {
    await sendNotificationEmail({
      subject: `[Dựng hệ thống] ${name} — ${services.length} tầng dịch vụ`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Việc đang làm chủ DN mệt:</strong></p>
        <ul>${pains.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
        <p><strong>Lộ trình gợi ý (từ nền móng lên):</strong></p>
        <ol>${services.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
        <p><em>Nguồn: công cụ "Dựng hệ thống" trên trang Dịch vụ.</em></p>
      `,
    });
  } catch (error) {
    console.error("[api/plan] failed to send email:", error);
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
