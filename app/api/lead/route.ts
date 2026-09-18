import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  score: z.number().min(0).max(10),
  bottleneck: z.enum(["MKT", "SALES", "CSKH", "SOP", "DATA"]),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, score, bottleneck } = parsed.data;

  try {
    await sendNotificationEmail({
      subject: `[Chẩn đoán hệ thống] ${name} — điểm ${score.toFixed(1)}/10, nghẽn ${bottleneck}`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Điểm chẩn đoán:</strong> ${score.toFixed(1)} / 10</p>
        <p><strong>Điểm nghẽn lớn nhất:</strong> ${escapeHtml(bottleneck)}</p>
        <p><em>Nguồn: công cụ chẩn đoán trên trang Dịch vụ.</em></p>
      `,
    });
  } catch (error) {
    console.error("[api/lead] failed to send email:", error);
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
