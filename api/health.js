// Simple health check - no DB. Visit /api/health to test if API routes work.
module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ ok: true, message: 'API is running' });
};
