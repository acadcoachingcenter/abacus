import { hashPassword, sha256Hex } from '../_lib/crypto.js';
import { json } from '../_lib/respond.js';

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured yet' }, 503);

  const body = await request.json().catch(() => null);
  const token = body?.token || '';
  const password = body?.password || '';

  if (!token) return json({ error: 'Missing reset token' }, 400);
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  const tokenHash = await sha256Hex(token);
  const record = await env.DB.prepare(
    'SELECT user_id, expires_at, used FROM password_resets WHERE token_hash = ?'
  )
    .bind(tokenHash)
    .first();

  if (!record || record.used || new Date(record.expires_at) < new Date()) {
    return json({ error: 'This reset link is invalid or has expired' }, 400);
  }

  const passwordHash = await hashPassword(password);

  await env.DB.batch([
    env.DB.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(passwordHash, record.user_id),
    env.DB.prepare('UPDATE password_resets SET used = 1 WHERE token_hash = ?').bind(tokenHash),
  ]);

  return json({ message: 'Password updated — you can now log in.' });
}
