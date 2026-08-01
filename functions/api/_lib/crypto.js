// Web Crypto helpers for Cloudflare Pages Functions (Workers runtime).
// No external crypto packages — everything here uses the platform's
// built-in SubtleCrypto, which is what Workers actually supports.

const PBKDF2_ITERATIONS = 100000;

function toHex(buffer) {
  return [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

/**
 * Hash a password with PBKDF2-SHA256 and a random 16-byte salt.
 * Stored format: pbkdf2:<iterations>:<saltHex>:<hashHex>
 */
export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `pbkdf2:${PBKDF2_ITERATIONS}:${toHex(salt)}:${toHex(bits)}`;
}

/**
 * Verify a plaintext password against a stored pbkdf2:... hash.
 * Never store or compare plain-text passwords.
 */
export async function verifyPassword(password, stored) {
  const parts = String(stored).split(':');
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false;
  const iterations = parseInt(parts[1], 10);
  const salt = fromHex(parts[2]);
  const expectedHex = parts[3];

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  const actualHex = toHex(bits);

  // Constant-time-ish comparison
  if (actualHex.length !== expectedHex.length) return false;
  let diff = 0;
  for (let i = 0; i < actualHex.length; i++) {
    diff |= actualHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
  }
  return diff === 0;
}

function base64url(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : new Uint8Array(input);
  let str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const bin = atob(str);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign a minimal JWT-like session token: header.payload.signature (HS256).
 * payload gets an `exp` (unix seconds) added automatically.
 */
export async function signSession(payload, secret, expiresInSeconds) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSeconds };
  const headerPart = base64url(JSON.stringify(header));
  const payloadPart = base64url(JSON.stringify(fullPayload));
  const signingInput = `${headerPart}.${payloadPart}`;
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput));
  return `${signingInput}.${base64url(signature)}`;
}

/**
 * Verify and decode a session token. Returns the payload or null.
 */
export async function verifySession(token, secret) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [headerPart, payloadPart, sigPart] = parts;
  try {
    const key = await hmacKey(secret);
    const signingInput = `${headerPart}.${payloadPart}`;
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(sigPart),
      new TextEncoder().encode(signingInput)
    );
    if (!valid) return null;
    const payload = JSON.parse(new TextDecoder().decode(base64urlDecode(payloadPart)));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Generate a random URL-safe token for password reset links.
 */
export function randomToken(bytes = 32) {
  return toHex(crypto.getRandomValues(new Uint8Array(bytes)));
}

export async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return toHex(digest);
}
