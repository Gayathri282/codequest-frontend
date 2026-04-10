const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const passport = require('passport');
require('dotenv').config();

require('./utils/passport'); // Google OAuth strategy

const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const adminRoutes   = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

// Razorpay webhook needs raw body for signature verification — must come before express.json()
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(passport.initialize());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/admin',    adminRoutes);
app.use('/api/payment',  paymentRoutes);

// ── Seed default data ────────────────────────────────────────────────────────
async function seed() {
  const db     = require('./utils/supabase');
  const bcrypt = require('bcryptjs');

  // Admin user — always upsert so credentials stay in sync with .env
  const email    = process.env.ADMIN_EMAIL    || 'admin@guppystore.com';
  const password = process.env.ADMIN_PASSWORD || 'Admin@123';
  const phone    = process.env.ADMIN_PHONE    || '9999999999';
  const hashed   = await bcrypt.hash(password, 12);

  await db.query(`
    INSERT INTO users (name, email, phone, password, role, is_email_verified, is_phone_verified)
    VALUES ($1,$2,$3,$4,'admin',true,true)
    ON CONFLICT (email) DO UPDATE SET password=$4, name=$1
  `, ['Admin', email, phone, hashed]);
  console.log(`Admin ready: ${email}`);

  // Default banners (only if table is empty)
  const { rows: bRows } = await db.query('SELECT id FROM banners LIMIT 1');
  if (!bRows.length) {
    await db.query(`
      INSERT INTO banners (title, subtitle, gradient, link, "order", is_active) VALUES
        ('Premium Guppy Fish',  'Hand-picked breeds delivered to your door', 'from-ocean via-primary-800 to-primary-600',  '#breeds',               1, true),
        ('Rare Cobra Guppies',  'Limited stock — order before it sells out',  'from-orange-900 via-orange-700 to-yellow-500','/breed/cobra-guppy',    2, true),
        ('Half Moon Collection','180° tail fans in stunning colors',           'from-indigo-900 via-blue-700 to-cyan-500',   '/breed/halfmoon-guppy', 3, true)
    `);
    console.log('Default banners seeded');
  }

  // Default categories (only if table is empty)
  const { rows: cRows } = await db.query('SELECT id FROM categories LIMIT 1');
  if (!cRows.length) {
    await db.query(`
      INSERT INTO categories (name, slug, tagline, gradient, emoji, "order", is_active) VALUES
        ('Fancy Guppy',      'fancy-guppy',       'The jewel of the aquarium',       'from-violet-400 via-purple-500 to-pink-500',   '🟣', 1, true),
        ('Cobra Guppy',      'cobra-guppy',        'Striking snake-skin patterns',    'from-yellow-400 via-orange-500 to-red-500',    '🟠', 2, true),
        ('Mosaic Guppy',     'mosaic-guppy',       'Stunning mosaic tail artistry',   'from-blue-400 via-cyan-500 to-teal-500',       '🔵', 3, true),
        ('Endler''s Guppy',  'endler-guppy',       'Wild & vibrant natural patterns', 'from-green-400 via-emerald-500 to-cyan-500',   '🟢', 4, true),
        ('Half Moon Guppy',  'halfmoon-guppy',     '180° tail fan, pure elegance',    'from-sky-400 via-blue-500 to-indigo-500',      '💙', 5, true),
        ('Dumbo Ear Guppy',  'dumbo-ear-guppy',    'Oversized pectoral fins',         'from-rose-400 via-pink-500 to-fuchsia-500',    '🩷', 6, true),
        ('Flamingo Guppy',   'flamingo-guppy',     'Fiery red & pink hues',           'from-red-400 via-rose-500 to-pink-400',        '❤️', 7, true),
        ('Moscow Blue Guppy','moscow-blue-guppy',  'Deep ocean blue brilliance',      'from-blue-600 via-blue-500 to-cyan-400',       '🔷', 8, true)
    `);
    console.log('Default categories seeded');
  }
}

const PORT = process.env.PORT || 5003;
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await seed().catch(err => console.error('[Seed error]', err.message));
});
