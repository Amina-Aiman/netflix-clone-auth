require('dotenv').config();
const db = require('../backend/db');

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
    const { identifier, password } = req.body || {};
    
    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Identifier and password are required.' });
      return;
    }
    
    const rows = await db.query(
      'SELECT id, uname, email, phone, password FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [String(identifier).trim(), String(identifier).trim()]
    );
    
    if (!rows || rows.length === 0) {
      res.status(401).json({ success: false, message: 'Invalid identifier or password.' });
      return;
    }
    
    const user = rows[0];
    const decoded = decodePassword(user.password);
    
    if (decoded !== String(password)) {
      res.status(401).json({ success: false, message: 'Invalid identifier or password.' });
      return;
    }
    
    res.json({ success: true, message: 'Login successful.', user: { id: user.id, uname: user.uname, email: user.email } });
  } catch (err) {
    console.error('Login API error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
