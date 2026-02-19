const { handleRegister, initDb } = require('../backend/apiHandlers');

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
    let body = req.body;
    if (body === undefined || body === null) {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      body = JSON.parse(Buffer.concat(chunks).toString() || '{}');
    }
    if (typeof body === 'string') body = JSON.parse(body || '{}');
    if (!body || typeof body !== 'object') body = {};
    const { status, json } = await handleRegister(body);
    res.status(status).json(json);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ success: false, message: 'Email or phone already registered.' });
      return;
    }
    console.error('Register API error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};
