/**
 * Sends transactional email via the Resend HTTP API instead of SMTP —
 * Cloudflare Workers (where this app is deployed) can't open raw TCP/SMTP
 * sockets the way nodemailer needs, but a plain fetch() call works fine.
 */
const { RESEND_API_KEY, RESEND_FROM_EMAIL, CONTACT_TO_EMAIL } = process.env;

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
  // resend.dev is Resend's shared sandbox sender — works immediately with no
  // domain verification, but only delivers to the account owner's own inbox.
  // Once triduccar.media is verified in Resend, set RESEND_FROM_EMAIL to send
  // from an @triduccar.media address and deliver to any recipient.
  const from = RESEND_FROM_EMAIL || "Trí Đức Car Media <onboarding@resend.dev>";

  if (!RESEND_API_KEY) {
    console.warn(
      "[email] RESEND_API_KEY not configured — skipping send. Set it in .env.local / Cloudflare Pages env vars to enable real delivery.",
    );
    console.info("[email] Would have sent:", { to, subject, html });
    return { delivered: false as const };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Resend API error (${res.status}): ${body}`);
  }

  return { delivered: true as const };
}
