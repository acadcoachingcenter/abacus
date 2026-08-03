import { verifyPassword, signSession } from '../_lib/crypto.js';
import { json } from '../_lib/respond.js';
import { buildSessionCookie } from '../_lib/cookies.js';

const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured yet' }, 503);
  if (!env.SESSION_SECRET) return json({ error: 'Server is not configured yet' }, 503);

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid request body' }, 400);

  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  if (!email || !password) return json({ error: 'Email and password are required' }, 400);

  const user = await env.DB.prepare(
  `SELECT u.id, u.name, u.email, u.password_hash, u.role, u.disabled,
          s.age, s.grade, s.current_level, s.streak_days, s.best_score,
          s.total_practice_seconds, s.last_activity_at
   FROM users u
   LEFT JOIN students s ON s.id = u.id
   WHERE u.email = ?`
)
  .bind(email)
  .first();



  // Same generic error whether the email doesn't exist or the password is
  // wrong — don't let the response shape reveal which accounts exist.
  if (!user || user.disabled) return json({ error: 'Incorrect email or password' }, 401);

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) return json({ error: 'Incorrect email or password' }, 401);

  const token = await signSession({ sub: user.id, role: user.role }, env.SESSION_SECRET, SESSION_SECONDS);

  return json(
  {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      age: user.age,
      grade: user.grade,
      current_level: user.current_level,
      streak_days: user.streak_days,
      best_score: user.best_score,
      total_practice_seconds: user.total_practice_seconds,
      last_activity_at: user.last_activity_at
    }
  },
  200,
  { 'Set-Cookie': buildSessionCookie(token, SESSION_SECONDS) }
);
}
