import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

// Lead from the case-study twin (components/case-studies/CaseTwin.tsx).
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  caseName: z.string().trim().max(160),
  pct: z.number().int().min(0).max(100),
  bestCase: z.string().trim().max(160).optional(),
  answers: z.array(z.string().trim().max(160)).max(6),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, caseName, pct, bestCase, answers } = parsed.data;

  try {
    await sendNotificationEmail({
      subject: `[Dự án] ${name} — giống ${caseName} ${pct}%`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Đang đọc dự án:</strong> ${escapeHtml(caseName)} (giống ${pct}%)</p>
        ${bestCase && bestCase !== caseName ? `<p><strong>Ca giống nhất:</strong> ${escapeHtml(bestCase)}</p>` : ""}
        <p><strong>Cơ sở của khách:</strong></p>
        <ul>${answers.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
        <p><em>Nguồn: "Bản sao cơ sở" cuối trang dự án. Khách muốn làm giống ca này.</em></p>
      `,
    });
  } catch (error) {
    console.error("[api/twin] failed to send email:", error);
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
