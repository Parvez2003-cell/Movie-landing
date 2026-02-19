import bcrypt from 'bcryptjs';
import { ensureUsersTable, getPool } from './_db.js';
import { setAuthCookie, signToken } from './_auth.js';
import { readJsonBody } from './_body.js';
import { checkEnv } from './_env.js';

export const config = { api: { bodyParser: true } };

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  const missing = checkEnv();
  if (missing.length) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'Server not configured.', message: `Add in Vercel: ${missing.join(', ')}` }));
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const body = await readJsonBody(req);
  const { username, password } = body || {};
  if (!username || !password) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Username and password required.' }));
    return;
  }

  try {
    await ensureUsersTable();
    const pool = getPool();

    const [rows] = await pool.execute(
      'SELECT userId, name, password FROM users WHERE userId = ? OR email = ?',
      [username, username]
    );

    if (!rows.length) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Invalid username or password.' }));
      return;
    }

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      res.statusCode = 401;
      res.end(JSON.stringify({ error: 'Invalid username or password.' }));
      return;
    }

    const token = signToken({ userId: user.userId, name: user.name });
    setAuthCookie(res, token);

    res.statusCode = 200;
    res.end(JSON.stringify({ success: true, name: user.name }));
  } catch (e) {
    console.error('[login]', e?.message, e?.code, e?.errno);
    const code = e?.code || e?.errno || null;
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Login failed.', code, message: String(e?.message || '') }));
  }
}

