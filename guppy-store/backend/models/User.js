const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:   { type: String, required: false, trim: true, default: '' },
    password:{ type: String, select: false },
    googleId:{ type: String },
    avatar:  { type: String },
    role:    { type: String, enum: ['customer', 'admin' /*, 'vendor'*/], default: 'customer' },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    address: {
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },

    // ── MULTI-VENDOR: Uncomment block below to enable vendor verification ───
    // vendorInfo: {
    //   status:      { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    //   idProofType: { type: String, enum: ['aadhar', 'driving_license', 'voter_id', 'passport'] },
    //   idProofImage:{ type: String }, // file path to uploaded ID
    //   shopName:    { type: String },
    //   shopBio:     { type: String },
    //   rejectionReason: { type: String },
    // },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
