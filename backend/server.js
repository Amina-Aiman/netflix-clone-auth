require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

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

app.post('/register', async (req, res) => {
  try {
    const { uname, email, phone, password } = req.body;
    if (!uname || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Missing fields: uname, email, phone, password are required.' });
    }
    const encodedPassword = encodePassword(password);
    await db.query(
      'INSERT INTO users (uname, email, phone, password) VALUES (?, ?, ?, ?)',
      [String(uname).trim(), String(email).trim(), String(phone).trim(), encodedPassword]
    );
    return res.status(201).json({ success: true, message: 'Registration successful.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'Email or phone already registered.' });
    }
    console.error('Register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required.' });
    }
    const rows = await db.query(
      'SELECT id, uname, email, phone, password FROM users WHERE email = ? OR phone = ? LIMIT 1',
      [String(identifier).trim(), String(identifier).trim()]
    );
    if (!rows || rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid identifier or password.' });
    }
    const user = rows[0];
    const decodedStored = decodePassword(user.password);
    if (decodedStored !== String(password)) {
      return res.status(401).json({ success: false, message: 'Invalid identifier or password.' });
    }
    return res.json({ success: true, message: 'Login successful.', user: { id: user.id, uname: user.uname, email: user.email } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
});

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// Export for Vercel serverless
module.exports = app;

// Start server for local development
if (require.main === module) {
  async function start() {
    try {
      await db.initDb();
      console.log('Database ready.');
    } catch (e) {
      console.error('Database init failed:', e.message);
      process.exit(1);
    }
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

  start().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
