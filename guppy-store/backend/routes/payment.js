const router   = require('express').Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const db       = require('../utils/supabase');
const { protect } = require('../middleware/auth');

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ── Create Razorpay order ──────────────────────────────────────────────────────
router.post('/create-order', protect, async (req, res) => {
  try {
    const { amount, orderId } = req.body;
    const rzpOrder = await razorpay.orders.create({
      amount:   Math.round(amount * 100), // convert ₹ → paise
      currency: 'INR',
      receipt:  `rcpt_${orderId.slice(-12)}`,
      notes:    { dbOrderId: orderId },
    });
    res.json({
      rzpOrderId: rzpOrder.id,
      amount:     rzpOrder.amount,
      currency:   rzpOrder.currency,
    });
  } catch (err) {
    console.error('[Razorpay create]', err);
    res.status(500).json({ message: 'Payment initiation failed' });
  }
});

// ── Verify payment (client-side callback) ─────────────────────────────────────
router.post('/verify', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: 'Payment verification failed — signature mismatch' });

    await db.query(
      `UPDATE orders SET payment_status='paid', order_status='processing', updated_at=NOW()
       WHERE id=$1`,
      [orderId]
    );

    console.log(`[Payment] Order ${orderId} paid via client verify`);
    res.json({ message: 'Payment verified', orderId });
  } catch (err) {
    console.error('[Razorpay verify]', err);
    res.status(500).json({ message: 'Verification failed' });
  }
});

// ── Webhook (server-side, from Razorpay dashboard) ────────────────────────────
// Set webhook URL in Razorpay Dashboard → Settings → Webhooks:
//   https://yourdomain.com/api/payment/webhook
// Secret: RAZORPAY_WEBHOOK_SECRET in .env
// Events to enable: payment.captured, order.paid, payment.failed
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const secret    = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!secret) {
      console.warn('[Webhook] RAZORPAY_WEBHOOK_SECRET not set — skipping verification');
    } else {
      const expected = crypto
        .createHmac('sha256', secret)
        .update(req.body) // raw Buffer from express.raw()
        .digest('hex');

      if (expected !== signature) {
        console.warn('[Webhook] Invalid signature');
        return res.status(400).json({ message: 'Invalid webhook signature' });
      }
    }

    const payload = JSON.parse(req.body.toString());
    const event   = payload.event;
    const payment = payload.payload?.payment?.entity;
    const order   = payload.payload?.order?.entity;

    console.log(`[Webhook] Event: ${event}`);

    // ── payment.captured ──────────────────────────────────────────────────────
    if (event === 'payment.captured' && payment) {
      const receipt = payment.order_id; // Razorpay order id
      // Find our DB order by receipt note
      const { rows } = await db.query(
        `SELECT id FROM orders WHERE id = (
           SELECT notes->>'dbOrderId' FROM orders
           WHERE id IS NOT NULL LIMIT 1
         ) LIMIT 1`
      );
      // Simpler: use receipt field stored in notes or match on amount+email
      // Most reliable: match the receipt we set as rcpt_{orderId.slice(-12)}
      const rzpNotes = payment.notes || {};
      const dbOrderId = rzpNotes.dbOrderId;
      if (dbOrderId) {
        await db.query(
          `UPDATE orders SET payment_status='paid', order_status='processing', updated_at=NOW()
           WHERE id=$1 AND payment_status='pending'`,
          [dbOrderId]
        );
        console.log(`[Webhook] Marked order ${dbOrderId} as paid`);
      }
    }

    // ── payment.failed ────────────────────────────────────────────────────────
    if (event === 'payment.failed' && payment) {
      const dbOrderId = payment.notes?.dbOrderId;
      if (dbOrderId) {
        await db.query(
          `UPDATE orders SET payment_status='failed', updated_at=NOW() WHERE id=$1`,
          [dbOrderId]
        );
        console.log(`[Webhook] Marked order ${dbOrderId} as failed`);
      }
    }

    // ── order.paid ────────────────────────────────────────────────────────────
    if (event === 'order.paid' && order) {
      const dbOrderId = order.notes?.dbOrderId;
      if (dbOrderId) {
        await db.query(
          `UPDATE orders SET payment_status='paid', order_status='processing', updated_at=NOW()
           WHERE id=$1 AND payment_status='pending'`,
          [dbOrderId]
        );
        console.log(`[Webhook] order.paid: Marked order ${dbOrderId} as paid`);
      }
    }

    res.json({ received: true });
  } catch (err) {
    console.error('[Webhook error]', err);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
});

module.exports = router;
