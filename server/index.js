import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

// Aiven MySQL config
const dbConfig = {
  host: process.env.DB_HOST || 'mysql-2b41c7a9-ksit-96b5.i.aivencloud.com',
  port: parseInt(process.env.DB_PORT || '12035', 10),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: { rejectUnauthorized: false },
};

let pool;

async function initDb() {
  try {
    if (!dbConfig.password) {
      throw new Error('Missing DB_PASSWORD. Set it in your environment (.env for local dev).');
    }
    pool = mysql.createPool(dbConfig);
    const conn = await pool.getConnection();

    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        userId VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    conn.release();
    console.log('Database connected, users table ready.');
  } catch (err) {
    console.error('DB init error:', err.message);
    process.exit(1);
  }
}

app.use(cors({ origin: isProd ? false : true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'dev-only-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', httpOnly: true, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Check auth
app.get('/api/me', (req, res) => {
  if (req.session?.userId) {
    return res.json({ loggedIn: true, userId: req.session.userId, name: req.session.name });
  }
  res.json({ loggedIn: false });
});

// Register
app.post('/api/register', async (req, res) => {
  const { userId, name, email, phone, password } = req.body;

  if (!userId || !name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const [rows] = await pool.execute('SELECT userId FROM users WHERE userId = ? OR email = ?', [userId, email]);
    if (rows.length) {
      return res.status(400).json({ error: 'User ID or email already exists.' });
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute(
      'INSERT INTO users (userId, name, password, email, phone) VALUES (?, ?, ?, ?, ?)',
      [userId, name, hashed, email, phone]
    );
    res.json({ success: true, message: 'Registered. Please login.' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required.' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT userId, name, password FROM users WHERE userId = ? OR email = ?',
      [username, username]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    req.session.userId = user.userId;
    req.session.name = user.name;
    res.json({ success: true, name: user.name });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {});
  res.json({ success: true });
});

if (isProd) {
  app.use(express.static(path.join(__dirname, '../dist')));
}

initDb().then(() => {
  app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
});
