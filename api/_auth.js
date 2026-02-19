import jwt from 'jsonwebtoken';
import { makeCookie, parseCookies } from './_cookies.js';

const COOKIE_NAME = 'ml_token';

export function signToken(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET env var.');
  return jwt.sign(payload, secret, { expiresIn: '1d' });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET env var.');
  return jwt.verify(token, secret);
}

export function getUserFromRequest(req) {
  const cookies = parseCookies(req);
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const decoded = verifyToken(token);
    return decoded && typeof decoded === 'object' ? decoded : null;
  } catch {
    return null;
  }
}

export function setAuthCookie(res, token) {
  // Vercel (prod + preview) uses HTTPS; local dev typically uses HTTP
  const isSecure = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    makeCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'Lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })
  );
}

export function clearAuthCookie(res) {
  const isSecure = !!process.env.VERCEL || process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    makeCookie(COOKIE_NAME, '', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'Lax',
      path: '/',
      maxAge: 0,
    })
  );
}

