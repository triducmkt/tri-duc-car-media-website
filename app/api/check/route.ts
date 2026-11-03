import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

// Lead from the ads landing page "Kiểm tra cơ sở 60 giây" (components/check/ShopCheck.tsx).
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  score: z.number().int().min(0).max(100),
  weakest: z.string().trim().max(80),
  answers: z.array(z.string().trim().max(200)).max(8),
  attribution: z.record(z.string(), z.string().trim().max(200)).optional(),
  page: z.string().trim().max(300).optional(),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, score, weakest, answers, attribution, page } = parsed.data;
  const source = Object.entries(attribution ?? {}).filter(([, v]) => v);

  try {
    await sendNotificationEmail({
      subject: `[Kiểm tra 60s] ${name} — ${score}/100, yếu nhất: ${weakest}`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Điểm sức khỏe:</strong> ${score}/100 · <strong>Yếu nhất:</strong> ${escapeHtml(weakest)}</p>
        <p><strong>Câu trả lời:</strong></p>
        <ul>${answers.map((a) => `<li>${escapeHtml(a)}</li>`).join("")}</ul>
        ${
          source.length
            ? `<p><strong>Nguồn quảng cáo:</strong></p><ul>${source.map(([k, v]) => `<li>${escapeHtml(k)}: ${escapeHtml(v)}</li>`).join("")}</ul>`
            : "<p><strong>Nguồn:</strong> truy cập trực tiếp / không có UTM</p>"
        }
        ${page ? `<p><em>Trang: ${escapeHtml(page)}</em></p>` : ""}
      `,
    });
  } catch (error) {
    console.error("[api/check] failed to send email:", error);
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
