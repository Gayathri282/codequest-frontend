require('dotenv').config();
const db = require('./supabase');
const { v4: uuidv4 } = require('uuid');

const BREEDS_IMAGES = {
  'fancy-guppy': [
    'https://images.unsplash.com/photo-1520067350811-04664887372b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
  ],
  'cobra-guppy': [
    'https://images.unsplash.com/photo-1545620958-c50d3a5a7d3a?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1552882209-7a54a01c6f50?w=400&h=300&fit=crop',
  ],
  'mosaic-guppy': [
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
  ],
  'endler-guppy': [
    'https://images.unsplash.com/photo-1579730623192-d6159c636f32?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1520067350811-04664887372b?w=400&h=300&fit=crop',
  ],
  'halfmoon-guppy': [
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1545620958-c50d3a5a7d3a?w=400&h=300&fit=crop',
  ],
  'dumbo-ear-guppy': [
    'https://images.unsplash.com/photo-1552882209-7a54a01c6f50?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&h=300&fit=crop',
  ],
  'flamingo-guppy': [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1579730623192-d6159c636f32?w=400&h=300&fit=crop',
  ],
  'moscow-blue-guppy': [
    'https://images.unsplash.com/photo-1520067350811-04664887372b?w=400&h=300&fit=crop',
    'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400&h=300&fit=crop',
  ],
};

const categories = [
  { slug: 'fancy-guppy', name: 'Fancy Guppy', tagline: 'The jewel of the aquarium', gradient: 'from-violet-400 via-purple-500 to-pink-500', emoji: '🟣', image: BREEDS_IMAGES['fancy-guppy'][0] },
  { slug: 'cobra-guppy', name: 'Cobra Guppy', tagline: 'Striking snake-skin patterns', gradient: 'from-yellow-400 via-orange-500 to-red-500', emoji: '🟠', image: BREEDS_IMAGES['cobra-guppy'][0] },
  { slug: 'mosaic-guppy', name: 'Mosaic Guppy', tagline: 'Stunning mosaic tail artistry', gradient: 'from-blue-400 via-cyan-500 to-teal-500', emoji: '🔵', image: BREEDS_IMAGES['mosaic-guppy'][0] },
  { slug: 'endler-guppy', name: "Endler's Guppy", tagline: 'Wild & vibrant natural patterns', gradient: 'from-green-400 via-emerald-500 to-cyan-500', emoji: '🟢', image: BREEDS_IMAGES['endler-guppy'][0] },
  { slug: 'halfmoon-guppy', name: 'Half Moon Guppy', tagline: '180° tail fan, pure elegance', gradient: 'from-sky-400 via-blue-500 to-indigo-500', emoji: '💙', image: BREEDS_IMAGES['halfmoon-guppy'][0] },
  { slug: 'dumbo-ear-guppy', name: 'Dumbo Ear Guppy', tagline: 'Oversized pectoral fins', gradient: 'from-rose-400 via-pink-500 to-fuchsia-500', emoji: '🩷', image: BREEDS_IMAGES['dumbo-ear-guppy'][0] },
  { slug: 'flamingo-guppy', name: 'Flamingo Guppy', tagline: 'Fiery red & pink hues', gradient: 'from-red-400 via-rose-500 to-pink-400', emoji: '❤️', image: BREEDS_IMAGES['flamingo-guppy'][0] },
  { slug: 'moscow-blue-guppy', name: 'Moscow Blue Guppy', tagline: 'Deep ocean blue brilliance', gradient: 'from-blue-600 via-blue-500 to-cyan-400', emoji: '🔷', image: BREEDS_IMAGES['moscow-blue-guppy'][0] },
];

const products = [
  // Fancy Guppy
  { name: 'Red Dragon Fancy', breed: 'Fancy Guppy', breed_slug: 'fancy-guppy', description: 'Vibrant red/gold double tail', price: 349, stock: 12, gender: 'male', age: '4m', size: 'M', color: 'Red/Gold', is_featured: true, is_active: true, images: BREEDS_IMAGES['fancy-guppy'] },
  { name: 'Blue Neon Fancy', breed: 'Fancy Guppy', breed_slug: 'fancy-guppy', description: 'Electric blue metallic sheen', price: 299, stock: 15, gender: 'male', age: '3m', size: 'S', color: 'Neon Blue', is_featured: false, is_active: true, images: BREEDS_IMAGES['fancy-guppy'].concat('https://images.unsplash.com/photo-1545620958-c50d3a5a7d3a?w=400') },

  // Cobra Guppy
  { name: 'Yellow Cobra', breed: 'Cobra Guppy', breed_slug: 'cobra-guppy', description: 'Snake-skin pattern gold', price: 399, stock: 10, gender: 'male', age: '4m', size: 'M', color: 'Yellow/Black', is_featured: true, is_active: true, images: BREEDS_IMAGES['cobra-guppy'] },
  { name: 'Green Cobra', breed: 'Cobra Guppy', breed_slug: 'cobra-guppy', description: 'Emerald body veil tail', price: 449, stock: 8, gender: 'male', age: '4m', size: 'M', color: 'Green', is_featured: false, is_active: true, images: BREEDS_IMAGES['cobra-guppy'].concat('https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=400') },

  // Mosaic Guppy
  { name: 'Blue Mosaic', breed: 'Mosaic Guppy', breed_slug: 'mosaic-guppy', description: 'Starry night mosaic tail', price: 379, stock: 14, gender: 'male', age: '4m', size: 'M', color: 'Blue/White', is_featured: true, is_active: true, images: BREEDS_IMAGES['mosaic-guppy'] },
  { name: 'Red Mosaic', breed: 'Mosaic Guppy', breed_slug: 'mosaic-guppy', description: 'Crimson white speckles', price: 429, stock: 9, gender: 'male', age: '5m', size: 'M', color: 'Red', is_featured: false, is_active: true, images: BREEDS_IMAGES['mosaic-guppy'].concat('https://images.unsplash.com/photo-1579730623192-d6159c636f32?w=400') },

  // Other breeds
  { name: "Endler's Pair", breed: "Endler's Guppy", breed_slug: 'endler-guppy', description: 'Wild vibrant pair', price: 299, stock: 20, gender: 'pair', age: '3m', size: 'S', color: 'Mixed', is_featured: false, is_active: true, images: BREEDS_IMAGES['endler-guppy'] },
  { name: 'Half Moon Delta', breed: 'Half Moon Guppy', breed_slug: 'halfmoon-guppy', description: '180 tail rainbow', price: 549, stock: 6, gender: 'male', age: '5m', size: 'L', color: 'Rainbow', is_featured: true, is_active: true, images: BREEDS_IMAGES['halfmoon-guppy'] },
  { name: 'Dumbo Ear Red', breed: 'Dumbo Ear Guppy', breed_slug: 'dumbo-ear-guppy', description: 'Oversized fins red tail', price: 479, stock: 12, gender: 'male', age: '4m', size: 'M', color: 'Red', is_featured: true, is_active: true, images: BREEDS_IMAGES['dumbo-ear-guppy'] },
  { name: 'Flamingo Pink', breed: 'Flamingo Guppy', breed_slug: 'flamingo-guppy', description: 'Pink rose hues', price: 399, stock: 10, gender: 'male', age: '4m', size: 'M', color: 'Pink', is_featured: false, is_active: true, images: BREEDS_IMAGES['flamingo-guppy'] },
  { name: 'Moscow Blue', breed: 'Moscow Blue Guppy', breed_slug: 'moscow-blue-guppy', description: 'Ocean blue', price: 649, stock: 5, gender: 'male', age: '5m', size: 'L', color: 'Blue', is_featured: true, is_active: true, images: BREEDS_IMAGES['moscow-blue-guppy'] },
];

const banners = [
  { title: 'Premium Guppies', subtitle: 'Live arrival guaranteed', gradient: 'from-violet-600 to-pink-500', link: '/breed/fancy-guppy', order: 1 },
  { title: 'New Arrivals', subtitle: 'Fresh from breeders this week', gradient: 'from-blue-600 to-cyan-400', link: '/breed/mosaic-guppy', order: 2 },
  { title: 'Cobra Collection', subtitle: 'Striking patterns, bold colours', gradient: 'from-amber-500 to-orange-600', link: '/breed/cobra-guppy', order: 3 },
  { title: 'Half Moon Beauties', subtitle: 'Elegant 180° tail fans', gradient: 'from-sky-500 to-indigo-600', link: '/breed/halfmoon-guppy', order: 4 },
];

async function run() {
  // Seed categories
  for (const cat of categories) {
    await db.query(`
      INSERT INTO categories (slug, name, tagline, gradient, emoji, image, "order", is_active)
      VALUES ($1,$2,$3,$4,$5,$6, (SELECT COALESCE(MAX("order"),0)+1 FROM categories), true)
      ON CONFLICT (slug) DO UPDATE SET image = $6, tagline = $3
    `, [cat.slug, cat.name, cat.tagline, cat.gradient, cat.emoji, cat.image]);
  }
  console.log(`Seeded/updated ${categories.length} categories with images`);

  // Banners (existing)
  await db.query("DELETE FROM banners WHERE image = ''");
  console.log('Cleared old gradient banners');
  for (const b of banners) {
    await db.query(
      `INSERT INTO banners (title, subtitle, image, gradient, link, "order", is_active)
       VALUES ($1,$2,'',$3,$4,$5,true)
       ON CONFLICT DO NOTHING`,
      [b.title, b.subtitle, b.gradient, b.link, b.order]
    );
  }
  console.log(`Seeded ${banners.length} demo banners`);

  // Activate any existing demo products first
  await db.query(`UPDATE products SET is_active = true WHERE name = ANY($1)`, [products.map(p => p.name)]);

  // Insert only products that don't exist yet
  let added = 0;
  for (const p of products) {
    const { rows } = await db.query('SELECT id FROM products WHERE name=$1 LIMIT 1', [p.name]);
    if (rows[0]) continue;
    await db.query(
      `INSERT INTO products (name, breed, breed_slug, description, price, stock, images, gender, age, size, color, is_featured, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [p.name, p.breed, p.breed_slug, p.description, p.price, p.stock,
       p.images, p.gender, p.age, p.size, p.color, p.is_featured, p.is_active]
    );
    added++;
  }
  console.log(`Activated existing + seeded ${added} new demo products`);

  db.end();
}

run().catch(e => { console.error(e.message); db.end(); });

