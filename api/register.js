require('dotenv').config();
const db = require('../backend/db');

function encodePassword(plain) {
  if (typeof plain !== 'string') return '';
  return Buffer.from(plain, 'utf8').toString('base64');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }
  
  try {
    await db.initDb();
    const { uname, email, phone, password } = req.body || {};
    
    if (!uname || !email || !phone || !password) {
      res.status(400).json({ success: false, message: 'Missing fields: uname, email, phone, password are required.' });
      return;
    }
    
    const encoded = encodePassword(password);
    await db.query(
      'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
      [String(uname).trim(), String(email).trim(), String(phone).trim(), encoded]
    );
    
    res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Email or phone already registered.' });
      return;
    }
    console.error('Register API error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};
