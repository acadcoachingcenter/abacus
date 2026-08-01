import { hashPassword, signSession } from '../_lib/crypto.js';
import { json, generateId } from '../_lib/respond.js';
import { buildSessionCookie } from '../_lib/cookies.js';

const SESSION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ error: 'Database is not configured yet' }, 503);
  if (!env.SESSION_SECRET) return json({ error: 'Server is not configured yet' }, 503);

  const body = await request.json().catch(() => null);
  if (!body) return json({ error: 'Invalid request body' }, 400);

  const name = (body.name || '').trim();
  const email = (body.email || '').trim().toLowerCase();
  const password = body.password || '';
  const age = body.age ? Number(body.age) : null;
  const grade = body.grade ? String(body.grade).trim() : null;
  const level = ['beginner', 'intermediate', 'advanced'].includes(body.level) ? body.level : 'beginner';

  if (!name || name.length < 2) return json({ error: 'Please enter your name' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email' }, 400);
  if (password.length < 8) return json({ error: 'Password must be at least 8 characters' }, 400);

  const existing = await env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
  if (existing) return json({ error: 'An account with this email already exists' }, 409);

  const userId = generateId();
  const passwordHash = await hashPassword(password);

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)'
    ).bind(userId, email, passwordHash, 'student', name),
    env.DB.prepare(
      'INSERT INTO students (id, age, grade, current_level) VALUES (?, ?, ?, ?)'
    ).bind(userId, age, grade, level),
  ]);

  const token = await signSession({ sub: userId, role: 'student' }, env.SESSION_SECRET, SESSION_SECONDS);

  return json(
    { user: { id: userId, name, email, role: 'student', level } },
    201,
    { 'Set-Cookie': buildSessionCookie(token, SESSION_SECONDS) }
  );
}
