require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Aiven MySQL typically requires SSL
  ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : undefined
};

let pool = null;

async function getPool() {
  if (!pool) {
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
      throw new Error('Missing required DB environment variables: DB_HOST, DB_USER, DB_NAME (and optionally DB_PASSWORD, DB_PORT)');
    }
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

async function query(sql, params = []) {
  const p = await getPool();
  const [rows] = await p.execute(sql, params);
  return rows;
}

async function initDb() {
  const pool = await getPool();
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uname VARCHAR(100),
      email VARCHAR(100),
      phone VARCHAR(20),
      password VARCHAR(255)
    )
  `);
}

module.exports = { getPool, query, initDb };
