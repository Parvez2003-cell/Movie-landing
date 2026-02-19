import bcrypt from 'bcryptjs';
import { ensureUsersTable, getPool } from './_db.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const { userId, name, email, phone, password } = req.body || {};

  if (!userId || !name || !email || !phone || !password) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'All fields are required.' }));
    return;
  }
  if (String(password).length < 6) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: 'Password must be at least 6 characters.' }));
    return;
  }

  try {
    await ensureUsersTable();
    const pool = getPool();

    const [rows] = await pool.execute('SELECT userId FROM users WHERE userId = ? OR email = ?', [userId, email]);
    if (rows.length) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'User ID or email already exists.' }));
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (userId, name, password, email, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, name, hashed, email, phone]
    );

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, message: 'Registered. Please login.' }));
  } catch (e) {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Registration failed.' }));
  }
}

