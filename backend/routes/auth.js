import express from 'express';
import passport from '../config/passport.js';
import bcrypt from 'bcrypt';
import pool from '../config/database.js';

const router = express.Router();

// Local registration
router.post('/register', async (req, res, next) => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT * FROM "user" WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email or username already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHashed = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await pool.query(
      'INSERT INTO "user" (email, username, password_hashed, date_created, date_updated) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [email, username, passwordHashed]
    );

    // Log in the new user
    req.login(newUser.rows[0], (err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Registration successful', user: newUser.rows[0] });
    });
  } catch (error) {
    next(error);
  }
});

// Local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info.message });
    }
    req.login(user, (err) => {
      if (err) {
        return next(err);
      }
      res.json({ message: 'Login successful', user });
    });
  })(req, res, next);
});

// Google OAuth login route
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home
    res.redirect('/');
  }
);

// Logout route
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Check authentication status
router.get('/status', (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated(), user: req.user });
});

export default router;
