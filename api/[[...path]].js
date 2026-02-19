// Vercel catch-all: handles /api, /api/login, /api/register, /api/health
const app = require('../backend/server.js');
const db = require('../backend/db');

// Strip /api prefix so Express sees /login not /api/login
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    req.url = req.url.slice(4) || '/';
  }
  next();
});

// Lazy DB init for serverless
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = db.initDb().catch(err => {
      console.error('DB init error:', err);
      dbInitPromise = null;
      return null;
    });
  }
  try {
    if (dbInitPromise) await dbInitPromise;
  } catch (e) {}
  next();
});

app.use((err, req, res, next) => {
  console.error('API error:', err);
  res.status(500).json({ success: false, message: 'Server error. Please try again.' });
});

module.exports = app;
