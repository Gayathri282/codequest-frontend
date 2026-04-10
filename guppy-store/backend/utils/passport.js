const passport       = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db             = require('./supabase');

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5004/api/auth/google/callback',
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email  = profile.emails?.[0]?.value || '';
        const avatar = profile.photos?.[0]?.value  || '';

        // Find by Google ID
        let { rows } = await db.query('SELECT * FROM users WHERE google_id = $1 LIMIT 1', [profile.id]);
        let user = rows[0];

        if (!user) {
          // Try find by email to link account
          ({ rows } = await db.query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email]));
          if (rows[0]) {
            ({ rows } = await db.query(
              'UPDATE users SET google_id=$1, avatar=$2 WHERE id=$3 RETURNING *',
              [profile.id, avatar, rows[0].id]
            ));
          } else {
            ({ rows } = await db.query(
              `INSERT INTO users (name, email, phone, google_id, avatar, is_email_verified)
               VALUES ($1,$2,'',$3,$4,true) RETURNING *`,
              [profile.displayName, email, profile.id, avatar]
            ));
          }
          user = rows[0];
        }

        done(null, user);
      } catch (err) {
        done(err, null);
      }
    }
  )
);
