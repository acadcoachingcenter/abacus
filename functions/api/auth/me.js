import { verifySession } from '../_lib/crypto.js';
import { json } from '../_lib/respond.js';
import { getSessionToken } from '../_lib/cookies.js';

export async function onRequestGet({ request, env }) {
  if (!env.DB || !env.SESSION_SECRET) return json({ user: null });

  const token = getSessionToken(request);
  const payload = await verifySession(token, env.SESSION_SECRET);
  if (!payload) return json({ user: null });

  const user = await env.DB.prepare(
    `SELECT u.id, u.name, u.email, u.role,
            s.age, s.grade, s.current_level, s.streak_days, s.best_score,
            s.total_practice_seconds, s.last_activity_at
     FROM users u LEFT JOIN students s ON s.id = u.id
     WHERE u.id = ? AND u.disabled = 0`
  )
    .bind(payload.sub)
    .first();

  if (!user) return json({ user: null });

  return json({ user });
}
