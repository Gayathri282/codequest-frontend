const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    breed:       { type: String, required: true, trim: true },  // e.g. "Cobra Guppy"
    breedSlug:   { type: String, required: true, lowercase: true }, // e.g. "cobra-guppy"
    description: { type: String, required: true },
    price:       { type: Number, required: true, min: 0 },
    stock:       { type: Number, required: true, default: 0 },
    images:      [{ type: String }],
    gender:      { type: String, enum: ['male', 'female', 'pair', 'unsexed'], default: 'unsexed' },
    age:         { type: String }, // e.g. "2-3 months"
    size:        { type: String }, // e.g. "1.5 inch"
    color:       { type: String },
    isFeatured:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },

    // MULTI-VENDOR: Each product owned by a vendor. Currently always admin.
    // vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

productSchema.index({ breedSlug: 1 });
productSchema.index({ name: 'text', breed: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
