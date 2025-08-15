const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // mysql2 connection (callback based)

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// REGISTER
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ msg: 'All fields required' });

  pool.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (rows.length > 0) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Hash error:', err);
        return res.status(500).json({ msg: 'Server error' });
      }

      pool.query(
        'INSERT INTO users (username, password, is_active) VALUES (?, ?, 1)',
        [username, hashedPassword],
        (err) => {
          if (err) {
            console.error('Insert error:', err);
            return res.status(500).json({ msg: 'Server error' });
          }
          res.json({ msg: 'Registration successful' });
        }
      );
    });
  });
});

// LOGIN
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.query('SELECT * FROM users WHERE username = ?', [username], (err, rows) => {
    if (err) {
      console.error('DB error:', err);
      return res.status(500).json({ msg: 'Server error' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ msg: 'Account is inactive. Contact admin.' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Compare error:', err);
        return res.status(500).json({ msg: 'Server error' });
      }

      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '2h' });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          created_at: user.created_at,
          updated_at: user.updated_at,
          is_active: user.is_active
        }
      });
    });
  });
});

module.exports = router;
