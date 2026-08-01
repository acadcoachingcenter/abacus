import { randomToken, sha256Hex } from '../_lib/crypto.js';
import { json } from '../_lib/respond.js';
import { sendPasswordResetEmail } from '../_lib/email.js';

const RESET_TTL_SECONDS = 60 * 60; // 1 hour

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured yet' }, 503);

  const body = await request.json().catch(() => null);
  const email = (body?.email || '').trim().toLowerCase();
  if (!email) return json({ error: 'Email is required' }, 400);

  // Always respond with the same generic message, whether or not the
  // account exists — this endpoint must not leak which emails are registered.
  const genericResponse = { message: 'If an account exists for that email, a reset link has been sent.' };

  const user = await env.DB.prepare('SELECT id FROM users WHERE email = ? AND disabled = 0')
    .bind(email)
    .first();

  if (user) {
    const token = randomToken(32);
    const tokenHash = await sha256Hex(token);
    const expiresAt = new Date(Date.now() + RESET_TTL_SECONDS * 1000).toISOString();

    await env.DB.prepare(
      'INSERT INTO password_resets (token_hash, user_id, expires_at, used) VALUES (?, ?, ?, 0)'
    )
      .bind(tokenHash, user.id, expiresAt)
      .run();

    const origin = new URL(request.url).origin;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    await sendPasswordResetEmail({ env, to: email, resetUrl });
  }

  return json(genericResponse);
}
