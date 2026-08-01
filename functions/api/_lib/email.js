// Sends transactional email via Resend (https://resend.com).
// Requires env.RESEND_API_KEY and env.RESEND_FROM_EMAIL to be set as
// Cloudflare Pages secrets/environment variables — see README.md.

export async function sendPasswordResetEmail({ env, to, resetUrl }) {
  if (!env.RESEND_API_KEY) {
    // Fail loudly in logs but don't leak this detail to the client —
    // the caller always returns a generic "check your email" response
    // regardless, so we don't reveal whether an account exists.
    console.error('RESEND_API_KEY is not configured');
    return { ok: false };
  }

  const fromEmail = env.RESEND_FROM_EMAIL || 'ACAD Abacus <onboarding@resend.dev>';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [to],
      subject: 'Reset your ACAD Abacus password',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color:#3B2417;">Reset your password</h2>
          <p>We received a request to reset the password for your ACAD Abacus account.</p>
          <p>
            <a href="${resetUrl}" style="display:inline-block;background:#F4A93B;color:#2A1810;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:bold;">
              Reset password
            </a>
          </p>
          <p style="color:#666;font-size:13px;">This link expires in 1 hour. If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  return { ok: res.ok };
}
