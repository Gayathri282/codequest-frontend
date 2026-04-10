const router = require('express').Router();
const db     = require('../utils/supabase');
const { toDoc } = require('../utils/transform');
const { protect, adminOnly } = require('../middleware/auth');
const { bannerUpload, categoryUpload } = require('../utils/multer');

const guard = [protect, adminOnly];

// ── Dashboard stats ───────────────────────────────────────────────────────────
router.get('/stats', guard, async (_req, res) => {
  try {
    const [users, products, orders, revenue, weekly, byStatus] = await Promise.all([
      db.query("SELECT COUNT(*) FROM users WHERE role='customer'"),
      db.query('SELECT COUNT(*) FROM products'),
      db.query('SELECT COUNT(*) FROM orders'),
      db.query("SELECT COALESCE(SUM(total),0) AS total FROM orders WHERE payment_status='paid'"),
      db.query(`
        SELECT TO_CHAR(created_at,'YYYY-MM-DD') AS "_id", SUM(total) AS revenue, COUNT(*) AS count
        FROM orders WHERE payment_status='paid' AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY "_id" ORDER BY "_id"
      `),
      db.query(`SELECT order_status AS "_id", COUNT(*) AS count FROM orders GROUP BY order_status`),
    ]);

    res.json({
      totalUsers:     parseInt(users.rows[0].count),
      totalProducts:  parseInt(products.rows[0].count),
      totalOrders:    parseInt(orders.rows[0].count),
      totalRevenue:   parseFloat(revenue.rows[0].total),
      weeklyRevenue:  weekly.rows,
      ordersByStatus: byStatus.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Users ─────────────────────────────────────────────────────────────────────
router.get('/users', guard, async (req, res) => {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const params = [];
    let where = '';
    if (role) { params.push(role); where = `WHERE role=$1`; }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [{ rows }, { rows: c }] = await Promise.all([
      db.query(`SELECT id,name,email,phone,role,avatar,is_email_verified,is_phone_verified,created_at
                FROM users ${where} ORDER BY created_at DESC
                LIMIT $${params.length-1} OFFSET $${params.length}`, params),
      db.query(`SELECT COUNT(*) FROM users ${where}`, role ? [role] : []),
    ]);

    res.json({ users: toDoc(rows), total: parseInt(c[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/users/:id', guard, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

// ── Orders ────────────────────────────────────────────────────────────────────
router.get('/orders', guard, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const params = [];
    let where = '';
    if (status) { params.push(status); where = `WHERE o.order_status=$1`; }
    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const [{ rows }, { rows: c }] = await Promise.all([
      db.query(`SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
                FROM orders o LEFT JOIN users u ON u.id=o.user_id
                ${where} ORDER BY o.created_at DESC
                LIMIT $${params.length-1} OFFSET $${params.length}`, params),
      db.query(`SELECT COUNT(*) FROM orders o ${where}`, status ? [status] : []),
    ]);

    res.json({ orders: toDoc(rows), total: parseInt(c[0].count) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/orders/:id/status', guard, async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const sets = [];
    const params = [];
    if (orderStatus)   { params.push(orderStatus);   sets.push(`order_status=$${params.length}`); }
    if (paymentStatus) { params.push(paymentStatus); sets.push(`payment_status=$${params.length}`); }
    if (!sets.length)  return res.status(400).json({ message: 'Nothing to update' });
    params.push(req.params.id);
    const { rows } = await db.query(
      `UPDATE orders SET ${sets.join(',')} WHERE id=$${params.length} RETURNING *`, params
    );
    res.json(toDoc(rows[0]));
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

// ── Banners ───────────────────────────────────────────────────────────────────
router.get('/banners', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM banners WHERE is_active=true ORDER BY "order" ASC');
  res.json(toDoc(rows));
});

router.post('/banners', guard,
  bannerUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'image_mobile', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, subtitle, link, order } = req.body;
      const image        = req.files?.image?.[0]        ? `/uploads/banners/${req.files.image[0].filename}`        : '';
      const image_mobile = req.files?.image_mobile?.[0] ? `/uploads/banners/${req.files.image_mobile[0].filename}` : '';
      const { rows } = await db.query(
        `INSERT INTO banners (title, subtitle, image, image_mobile, link, "order") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [title||'', subtitle||'', image, image_mobile, link||'/', parseInt(order)||0]
      );
      res.status(201).json(toDoc(rows[0]));
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.patch('/banners/:id', guard,
  bannerUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'image_mobile', maxCount: 1 }]),
  async (req, res) => {
    try {
      const { title, subtitle, link, order } = req.body;
      const sets   = [`title=$1`, `subtitle=$2`, `link=$3`, `"order"=$4`];
      const params = [title??'', subtitle??'', link??'/', parseInt(order)||0];

      if (req.files?.image?.[0]) {
        params.push(`/uploads/banners/${req.files.image[0].filename}`);
        sets.push(`image=$${params.length}`);
      }
      if (req.files?.image_mobile?.[0]) {
        params.push(`/uploads/banners/${req.files.image_mobile[0].filename}`);
        sets.push(`image_mobile=$${params.length}`);
      }

      params.push(req.params.id);
      const { rows } = await db.query(
        `UPDATE banners SET ${sets.join(',')} WHERE id=$${params.length} RETURNING *`, params
      );
      res.json(toDoc(rows[0]));
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete('/banners/:id', guard, async (req, res) => {
  await db.query('DELETE FROM banners WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

// ── Categories ────────────────────────────────────────────────────────────────
router.get('/categories', async (_req, res) => {
  const { rows } = await db.query('SELECT * FROM categories WHERE is_active=true ORDER BY "order" ASC');
  res.json(toDoc(rows));
});

router.post('/categories', guard, categoryUpload.single('image'), async (req, res) => {
  try {
    const { name, slug, tagline, gradient, emoji, order } = req.body;
    if (!name || !slug) return res.status(400).json({ message: 'Name and slug required' });
    const image = req.file ? `/uploads/categories/${req.file.filename}` : '';
    const { rows } = await db.query(
      `INSERT INTO categories (name, slug, tagline, gradient, emoji, image, "order")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, slug, tagline||'', gradient||'', emoji||'', image, parseInt(order)||0]
    );
    res.status(201).json(toDoc(rows[0]));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/categories/:id', guard,
  categoryUpload.single('image'),
  async (req, res) => {
    try {
      const { name, slug, tagline, gradient, emoji, order } = req.body;
      const sets   = [`name=$1`, `slug=$2`, `tagline=$3`, `gradient=$4`, `emoji=$5`, `"order"=$6`];
      const params = [name||'', slug||'', tagline||'', gradient||'', emoji||'', parseInt(order)||0];

      if (req.file) {
        params.push(`/uploads/categories/${req.file.filename}`);
        sets.push(`image=$${params.length}`);
      }

      params.push(req.params.id);
      const { rows } = await db.query(
        `UPDATE categories SET ${sets.join(',')} WHERE id=$${params.length} RETURNING *`, params
      );
      res.json(toDoc(rows[0]));
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
);

router.delete('/categories/:id', guard, async (req, res) => {
  await db.query('DELETE FROM categories WHERE id=$1', [req.params.id]);
  res.json({ message: 'Deleted' });
});

module.exports = router;
