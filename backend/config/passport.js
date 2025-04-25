import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import pool from './database.js';

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM "user" WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        const result = await pool.query('SELECT * FROM "user" WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: 'Incorrect email.' });
        }

        // Check if the user was created with Google OAuth
        if (user.password_hashed.startsWith('google-oauth-')) {
          return done(null, false, { message: 'Please use Google login for this account.' });
        }

        const isValid = await bcrypt.compare(password, user.password_hashed);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }
  )
);

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        const result = await pool.query(
          'SELECT * FROM "user" WHERE email = $1',
          [profile.emails[0].value]
        );

        if (result.rows.length > 0) {
          return done(null, result.rows[0]);
        }

        // If user doesn't exist, create new user
        const newUser = await pool.query(
          'INSERT INTO "user" (email, username, password_hashed, date_created, date_updated) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
          [
            profile.emails[0].value,
            profile.displayName,
            'google-oauth-' + profile.id, // Using Google ID as a placeholder for password
          ]
        );

        return done(null, newUser.rows[0]);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
