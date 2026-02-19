// Vercel serverless function wrapper for Express backend
const app = require('../backend/server.js');
const db = require('../backend/db');

// Strip /api prefix for Express routes (Vercel routes /api/* to this function)
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) {
    req.url = req.url.replace('/api', '');
  }
  next();
});

// Initialize database on first request (lazy initialization for Vercel)
let dbInitPromise = null;
app.use(async (req, res, next) => {
  if (!dbInitPromise) {
    dbInitPromise = db.initDb().catch(err => {
      console.error('DB init error:', err);
      dbInitPromise = null; // Allow retry on next request
    });
  }
  if (dbInitPromise) {
    try {
      await dbInitPromise;
    } catch (err) {
      // DB init failed, but continue anyway (will fail on DB query)
    }
  }
  next();
});

module.exports = app;
