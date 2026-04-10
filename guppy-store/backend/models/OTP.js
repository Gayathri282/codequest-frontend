const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  identifier: { type: String, required: true }, // email or phone
  type:       { type: String, enum: ['email', 'phone'], required: true },
  otp:        { type: String, required: true },
  purpose:    { type: String, enum: ['register', 'login', 'reset'], default: 'register' },
  expiresAt:  { type: Date, required: true },
  used:       { type: Boolean, default: false },
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // auto-delete expired

module.exports = mongoose.model('OTP', otpSchema);
