const router  = require('express').Router();
const passport = require('passport');
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const db      = require('../utils/supabase');
const { toDoc } = require('../utils/transform');
const { protect } = require('../middleware/auth');

const sign = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Register ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Name, email and password are required' });

    const { rows: existing } = await db.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1', [email.toLowerCase()]
    );
    if (existing[0])
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password, is_email_verified)
       VALUES ($1,$2,$3,true) RETURNING *`,
      [name.trim(), email.toLowerCase().trim(), hashed]
    );

    const user = toDoc(rows[0]);
    res.status(201).json({
      token: sign(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// ── Login ──────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const { rows } = await db.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1', [email?.toLowerCase()]
    );
    const user = rows[0];
    if (!user || !user.password)
      return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const doc = toDoc(user);
    res.json({
      token: sign(doc._id),
      user: { id: doc._id, name: doc.name, email: doc.email, role: doc.role, avatar: doc.avatar },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// ── Me ─────────────────────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => res.json(req.user));

// ── Update profile ─────────────────────────────────────────────────────────────
router.put('/me', protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const { rows } = await db.query(
      `UPDATE users SET name=$1, phone=$2, address=$3, updated_at=NOW()
       WHERE id=$4 RETURNING *`,
      [name, phone || '', address ? JSON.stringify(address) : '{}', req.user._id]
    );
    res.json(toDoc(rows[0]));
  } catch {
    res.status(500).json({ message: 'Update failed' });
  }
});

// ── Google OAuth ───────────────────────────────────────────────────────────────
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const token = sign(req.user.id);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?token=${token}`);
  }
);

module.exports = router;
