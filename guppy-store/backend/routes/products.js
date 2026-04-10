const router = require('express').Router();
const db     = require('../utils/supabase');
const { toDoc } = require('../utils/transform');
const { protect, adminOnly } = require('../middleware/auth');
const { productUpload } = require('../utils/multer');

// ── Public: list all breeds (distinct) ───────────────────────────────────────
router.get('/breeds', async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT breed_slug AS "_id", MIN(breed) AS name,
             MIN(images[1]) AS image, COUNT(*) AS count
      FROM products WHERE is_active = true
      GROUP BY breed_slug ORDER BY name
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Public: products by breed ────────────────────────────────────────────────
router.get('/breed/:slug', async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM products WHERE breed_slug=$1 AND is_active=true ORDER BY created_at DESC',
      [req.params.slug]
    );
    res.json(toDoc(rows));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Public: all products ──────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { breed, search, page = 1, limit = 20 } = req.query;
    const params = [];
    const conditions = ['is_active = true'];

    if (breed) {
      params.push(breed);
      conditions.push(`breed_slug = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR breed ILIKE $${params.length} OR description ILIKE $${params.length})`);
    }

    const where = conditions.join(' AND ');
    const offset = (page - 1) * limit;

    const [{ rows }, { rows: countRows }] = await Promise.all([
      db.query(`SELECT * FROM products WHERE ${where} ORDER BY created_at DESC LIMIT $${params.length+1} OFFSET $${params.length+2}`,
        [...params, limit, offset]),
      db.query(`SELECT COUNT(*) FROM products WHERE ${where}`, params),
    ]);

    const total = parseInt(countRows[0].count);
    res.json({ products: toDoc(rows), total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Public: single product ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products WHERE id=$1 LIMIT 1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(toDoc(rows[0]));
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

// ── Admin: create product ──────────────────────────────────────────────────────
router.post('/', protect, adminOnly, productUpload.array('images', 6), async (req, res) => {
  try {
    const images = req.files?.map(f => `/uploads/products/${f.filename}`) || [];
    const { name, breed, breedSlug, breed_slug, description, price, stock, gender, age, size, color, isFeatured, isActive } = req.body;
    const slug = breedSlug || breed_slug || '';
    const { rows } = await db.query(`
      INSERT INTO products (name, breed, breed_slug, description, price, stock, images, gender, age, size, color, is_featured, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [name, breed, slug, description||'', parseFloat(price)||0, parseInt(stock)||0,
       images, gender||'unsexed', age||'', size||'', color||'',
       isFeatured==='true'||isFeatured===true, isActive!=='false'&&isActive!==false]
    );
    res.status(201).json(toDoc(rows[0]));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Admin: update product ──────────────────────────────────────────────────────
router.put('/:id', protect, adminOnly, productUpload.array('images', 6), async (req, res) => {
  try {
    const { name, breed, breedSlug, breed_slug, description, price, stock, gender, age, size, color, isFeatured, isActive } = req.body;
    const slug = breedSlug || breed_slug || '';
    const newImages = req.files?.map(f => `/uploads/products/${f.filename}`);

    // If no new images uploaded, keep existing
    let imageClause = '';
    const params = [name, breed, slug, description||'', parseFloat(price)||0, parseInt(stock)||0,
      gender||'unsexed', age||'', size||'', color||'',
      isFeatured==='true'||isFeatured===true, isActive!=='false'&&isActive!==false];

    if (newImages?.length) {
      params.push(newImages);
      imageClause = `, images=$${params.length}`;
    }
    params.push(req.params.id);

    const { rows } = await db.query(`
      UPDATE products SET name=$1, breed=$2, breed_slug=$3, description=$4, price=$5, stock=$6,
        gender=$7, age=$8, size=$9, color=$10, is_featured=$11, is_active=$12${imageClause}, updated_at=NOW()
      WHERE id=$${params.length} RETURNING *`, params
    );
    res.json(toDoc(rows[0]));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ── Admin: delete product ──────────────────────────────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM products WHERE id=$1', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
