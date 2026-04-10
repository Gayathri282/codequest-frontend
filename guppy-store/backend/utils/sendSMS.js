// Twilio SMS — configure TWILIO_* env vars to enable
const twilio = require('twilio');

exports.sendOTPSMS = async (phone, otp) => {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await client.messages.create({
    body: `GuppyStore OTP: ${otp}. Valid for 10 minutes.`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone.startsWith('+') ? phone : `+91${phone}`, // default India prefix
  });
};
