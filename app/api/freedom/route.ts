import { NextResponse } from "next/server";
import { z } from "zod";
import { sendNotificationEmail } from "@/lib/email";

// Lead from the homepage "Owner time calculator" (components/home/FreedomCalculator.tsx).
const schema = z.object({
  name: z.string().trim().min(1).max(120),
  phone: z.string().trim().regex(/^[0-9+\s.\-()]{8,30}$/),
  hoursPerWeek: z.number().min(0).max(200),
  daysPerYear: z.number().min(0).max(366),
  ratePerHour: z.number().min(0).max(100_000_000),
  tasks: z.array(z.string().trim().max(80)).max(20),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid_input" }, { status: 400 });
  }

  const { name, phone, hoursPerWeek, daysPerYear, ratePerHour, tasks } = parsed.data;
  const yearlyValue = Math.round(hoursPerWeek * 52 * ratePerHour);
  const vnd = (n: number) => n.toLocaleString("vi-VN") + " đ";

  try {
    await sendNotificationEmail({
      subject: `[Tính giờ chủ DN] ${name} — ${hoursPerWeek} giờ/tuần việc lặp lại`,
      html: `
        <p><strong>Họ tên:</strong> ${escapeHtml(name)}</p>
        <p><strong>Điện thoại / Zalo:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Giờ/tuần chủ DN tự làm việc lặp lại:</strong> ${hoursPerWeek} giờ (~${daysPerYear} ngày công/năm)</p>
        <p><strong>Giá trị 1 giờ của chủ (tự chọn):</strong> ${vnd(ratePerHour)}</p>
        <p><strong>Ước tính giá trị thời gian/năm:</strong> ${vnd(yearlyValue)}</p>
        <p><strong>Việc đang tự làm:</strong></p>
        <ul>${tasks.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ul>
        <p><em>Nguồn: công cụ "Tính giờ chủ doanh nghiệp" trên trang chủ.</em></p>
      `,
    });
  } catch (error) {
    console.error("[api/freedom] failed to send email:", error);
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
