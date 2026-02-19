import bcrypt from 'bcryptjs';
import { ensureUsersTable, getPool } from './_db.js';
import { setAuthCookie, signToken } from './_auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { username, password } = req.body || {};
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
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, name: user.name }));
  } catch {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Login failed.' }));
  }
}

