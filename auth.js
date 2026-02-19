(function () {
  'use strict';

  // Auto-detect environment: use localhost for local dev, deployed URL for production
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.protocol === 'file:';
  // Use same Vercel domain for backend - API routes are at /api/login, /api/register
  const API_BASE = isLocalhost 
    ? 'http://localhost:5001' 
    : window.location.origin + '/api'; // Vercel backend at /api routes
  const LOGIN_FLAG = 'isLoggedIn';

  window.auth = {
    setLoggedIn: function (value) {
      if (value) {
        localStorage.setItem(LOGIN_FLAG, 'true');
      } else {
        localStorage.removeItem(LOGIN_FLAG);
      }
    },
    isLoggedIn: function () {
      return localStorage.getItem(LOGIN_FLAG) === 'true';
    },
    logout: function () {
      localStorage.removeItem(LOGIN_FLAG);
    },
    register: function (payload) {
      return fetch(API_BASE + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        return res.text().then(function (text) {
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error(res.status === 404 ? 'API not found.' : (text || 'Request failed'));
          }
        });
      });
    },
    login: function (identifier, password) {
      return fetch(API_BASE + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier, password: password })
      }).then(function (res) {
        return res.text().then(function (text) {
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error(res.status === 404 ? 'API not found. Check deployment.' : (text || 'Request failed'));
          }
        });
      });
    }
  };
})();
