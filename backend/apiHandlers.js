'use strict';
const db = require('./db');

function encodePassword(plain) {
  if (typeof plain !== 'string') return '';
  return Buffer.from(plain, 'utf8').toString('base64');
}

function decodePassword(encoded) {
  if (typeof encoded !== 'string') return '';
  try {
    return Buffer.from(encoded, 'base64').toString('utf8');
  } catch (e) {
    return '';
  }
}

async function handleLogin(body) {
  const { identifier, password } = body || {};
  if (!identifier || !password) {
    return { status: 400, json: { success: false, message: 'Identifier and password are required.' } };
  }
  const rows = await db.query(
    'SELECT id, uname, email, phone, password FROM users WHERE email = ? OR phone = ? LIMIT 1',
    [String(identifier).trim(), String(identifier).trim()]
  );
  if (!rows || rows.length === 0) {
    return { status: 401, json: { success: false, message: 'Invalid identifier or password.' } };
  }
  const user = rows[0];
  const decoded = decodePassword(user.password);
  if (decoded !== String(password)) {
    return { status: 401, json: { success: false, message: 'Invalid identifier or password.' } };
  }
  return { status: 200, json: { success: true, message: 'Login successful.', user: { id: user.id, uname: user.uname, email: user.email } };
}

async function handleRegister(body) {
  const { uname, email, phone, password } = body || {};
  if (!uname || !email || !phone || !password) {
    return { status: 400, json: { success: false, message: 'Missing fields: uname, email, phone, password are required.' } };
  }
  const encoded = encodePassword(password);
  await db.query(
    'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
    [String(uname).trim(), String(email).trim(), String(phone).trim(), encoded]
  );
  return { status: 201, json: { success: true, message: 'Registration successful.' } };
}

module.exports = { handleLogin, handleRegister, initDb: db.initDb };
