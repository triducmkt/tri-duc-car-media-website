import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, CONTACT_TO_EMAIL } = process.env;

const isEmailConfigured = Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT ?? 587),
      secure: Number(SMTP_PORT ?? 587) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    })
  : null;

export async function sendNotificationEmail({
  subject,
  html,
  replyTo,
}: {
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const to = CONTACT_TO_EMAIL || "tangtriduc@triduccar.media";

  if (!transporter) {
    console.warn(
      "[email] SMTP not configured — skipping send. Set SMTP_HOST/SMTP_USER/SMTP_PASS in .env.local to enable real delivery.",
    );
    console.info("[email] Would have sent:", { to, subject, html });
    return { delivered: false as const };
  }

  await transporter.sendMail({
    from: `"Trí Đức Car Media — Website" <${SMTP_USER}>`,
    to,
    replyTo,
    subject,
    html,
  });

  return { delivered: true as const };
}
