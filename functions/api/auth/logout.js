import { json } from '../_lib/respond.js';
import { buildClearCookie } from '../_lib/cookies.js';

export async function onRequestPost() {
  return json({ ok: true }, 200, { 'Set-Cookie': buildClearCookie() });
}
