import mysql from 'mysql2/promise';

let pool;

export function getPool() {
  if (pool) return pool;

  const {
    DB_HOST,
    DB_PORT,
    DB_USER,
    DB_PASSWORD,
    DB_NAME,
  } = process.env;

  if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
    throw new Error('Missing DB env vars. Set DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME.');
  }

  pool = mysql.createPool({
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    ssl: { rejectUnauthorized: false },
    connectionLimit: 2,
    connectTimeout: 15000,
    waitForConnections: true,
  });

  return pool;
}

export async function ensureUsersTable() {
  const p = getPool();
  await p.execute(`
    CREATE TABLE IF NOT EXISTS users (
      userId VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

