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
    const user = result.rows[0];
    const provider = user.password_hashed.startsWith("google-oauth-") ? "google" : "local";

    done(null, { ...user, provider });
  } catch (error) {
    done(error, null);
  }
});

// Local Strategy
passport.use(
  new LocalStrategy(
    {
      usernameField: 'username',
      passwordField: 'password',
    },
    async (username, password, done) => {
      try {
        const result = await pool.query('SELECT * FROM "user" WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }

        // Check if the user was created with Google OAuth
        if (user.password_hashed.startsWith('google-oauth-')) {
          return done(null, false, { message: 'Please use Google login for this account.' });
        }

        const isValid = await bcrypt.compare(password, user.password_hashed);
        if (!isValid) {
          return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, { ...user, provider: 'local' });
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
        // derive a photo URL from Google profile, if available
        const photoUrl =
          (Array.isArray(profile.photos) && profile.photos[0] && profile.photos[0].value) ||
          (profile._json && profile._json.picture) ||
          null;

        // Check if user already exists (by email)
        const result = await pool.query(
          'SELECT * FROM "user" WHERE email = $1',
          [profile.emails[0].value]
        );

        if (result.rows.length > 0) {
          const existingUser = result.rows[0];

          // If we have a Google photo and it's not stored yet (or has changed), update it
          if (photoUrl && existingUser.profile_picture !== photoUrl) {
            const updated = await pool.query(
              'UPDATE "user" SET profile_picture = $1, username = COALESCE($2, username), date_updated = NOW() WHERE id = $3 RETURNING *',
              [photoUrl, profile.displayName || null, existingUser.id]
            );
            return done(null, updated.rows[0]);
          }

          return done(null, existingUser);
        }

        // If user doesn't exist, create new user with Google marker in password_hashed and store photo
        const newUser = await pool.query(
          'INSERT INTO "user" (email, username, password_hashed, profile_picture, date_created, date_updated) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
          [
            profile.emails[0].value,
            profile.displayName,
            'google-oauth-' + profile.id, // Using Google ID as a placeholder for password
            photoUrl,
          ]
        );

        return done(null, { ...newUser.rows[0], provider: 'google' });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
