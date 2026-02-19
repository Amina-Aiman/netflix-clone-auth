const { handleLogin, initDb } = require('../backend/apiHandlers');

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

module.exports = async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }
  try {
    await initDb();
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const { status, json } = await handleLogin(body);
    res.status(status).json(json);
  } catch (err) {
    console.error('Login API error:', err);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};
