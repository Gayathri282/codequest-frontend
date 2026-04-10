const OTP = require('../models/OTP');

exports.generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

exports.saveOTP = async (identifier, type, otp, purpose = 'register') => {
  await OTP.deleteMany({ identifier, type, purpose }); // remove old
  await OTP.create({
    identifier,
    type,
    otp,
    purpose,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
  });
};

exports.verifyOTP = async (identifier, type, otp, purpose = 'register') => {
  const record = await OTP.findOne({
    identifier,
    type,
    purpose,
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!record || record.otp !== otp) return false;
  record.used = true;
  await record.save();
  return true;
};
