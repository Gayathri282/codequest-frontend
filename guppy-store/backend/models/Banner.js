const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title:     { type: String },
    subtitle:  { type: String },
    image:     { type: String, required: true }, // file path
    link:      { type: String, default: '/' },
    order:     { type: Number, default: 0 },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);
