(function () {
  'use strict';

  const API_BASE = 'http://localhost:5001';
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
      }).then(function (res) { return res.json(); });
    },
    login: function (identifier, password) {
      return fetch(API_BASE + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier, password: password })
      }).then(function (res) { return res.json(); });
    }
  };
})();
