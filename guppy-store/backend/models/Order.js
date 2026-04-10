const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name:     { type: String, required: true },
  image:    { type: String },
  price:    { type: Number, required: true },
  qty:      { type: Number, required: true, min: 1 },
  // MULTI-VENDOR: vendor field per item for split-order payouts
  // vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone:    { type: String, required: true },
      street:   { type: String, required: true },
      city:     { type: String, required: true },
      state:    { type: String, required: true },
      pincode:  { type: String, required: true },
    },
    paymentMethod:  { type: String, enum: ['cod', 'online'], default: 'cod' },
    paymentStatus:  { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus:    {
      type: String,
      enum: ['placed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'placed',
    },
    subtotal:      { type: Number, required: true },
    shippingCharge:{ type: Number, default: 0 },
    total:         { type: Number, required: true },
    notes:         { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
