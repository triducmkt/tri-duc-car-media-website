import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(30),
  email: z.string().trim().email().max(200).optional().or(z.literal("")),
  company: z.string().trim().max(200).optional().or(z.literal("")),
  industry: z.string().trim().max(200).optional().or(z.literal("")),
  preferredTime: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().max(5000).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, email, company, industry, preferredTime, message } = parsed.data;

  try {
    await sendNotificationEmail({
      subject: `[Đặt lịch tư vấn] ${name} — ${company || "Chưa rõ công ty"}`,
      replyTo: email || undefined,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email || "-")}</p>
        <p><strong>Công ty / hộ kinh doanh:</strong> ${escapeHtml(company || "-")}</p>
        <p><strong>Lĩnh vực:</strong> ${escapeHtml(industry || "-")}</p>
        <p><strong>Thời gian mong muốn:</strong> ${escapeHtml(preferredTime || "-")}</p>
        <p><strong>Nhu cầu:</strong></p>
        <p>${escapeHtml(message || "-").replace(/\n/g, "<br/>")}</p>
      `,
    });
  } catch (error) {
    console.error("[api/booking] failed to send email:", error);
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
