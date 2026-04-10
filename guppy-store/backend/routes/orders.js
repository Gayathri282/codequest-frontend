const router = require('express').Router();
const db     = require('../utils/supabase');
const { toDoc } = require('../utils/transform');
const { protect } = require('../middleware/auth');

// ── Place order ───────────────────────────────────────────────────────────────
router.post('/', protect, async (req, res) => {
  const client = await db.connect();
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    await client.query('BEGIN');

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        'SELECT * FROM products WHERE id=$1 AND is_active=true FOR UPDATE', [item.product]
      );
      const product = rows[0];
      if (!product)
        throw new Error(`Product ${item.product} not available`);
      if (product.stock < item.qty)
        throw new Error(`Insufficient stock for ${product.name}`);

      await client.query('UPDATE products SET stock=stock-$1 WHERE id=$2', [item.qty, product.id]);

      subtotal += parseFloat(product.price) * item.qty;
      orderItems.push({
        product: product.id,
        name:    product.name,
        image:   product.images?.[0] || '',
        price:   parseFloat(product.price),
        qty:     item.qty,
      });
    }

    const shippingCharge = subtotal < 500 ? 60 : 0;
    const total = subtotal + shippingCharge;

    const { rows } = await client.query(`
      INSERT INTO orders (user_id, items, shipping_address, payment_method, subtotal, shipping_charge, total, notes)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [req.user._id, JSON.stringify(orderItems), JSON.stringify(shippingAddress),
       paymentMethod||'cod', subtotal, shippingCharge, total, notes||'']
    );

    await client.query('COMMIT');
    res.status(201).json(toDoc(rows[0]));
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(400).json({ message: err.message || 'Order failed' });
  } finally {
    client.release();
  }
});

// ── My orders ─────────────────────────────────────────────────────────────────
router.get('/my', protect, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT * FROM orders WHERE user_id=$1 ORDER BY created_at DESC', [req.user._id]
    );
    res.json(toDoc(rows));
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

// ── Single order ──────────────────────────────────────────────────────────────
router.get('/:id', protect, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT o.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM orders o LEFT JOIN users u ON u.id=o.user_id
      WHERE o.id=$1 LIMIT 1`, [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ message: 'Order not found' });
    const order = rows[0];
    if (order.user_id !== req.user._id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    res.json(toDoc(order));
  } catch {
    res.status(500).json({ message: 'Error' });
  }
});

module.exports = router;
