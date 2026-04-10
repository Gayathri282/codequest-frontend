const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.EMAIL_HOST || 'smtp.gmail.com',
  port:   Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOTPEmail = async (to, otp, purpose = 'verification') => {
  const subject =
    purpose === 'reset'
      ? 'GuppyStore — Password Reset OTP'
      : 'GuppyStore — Email Verification OTP';

  const html = `
    <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
      <h2 style="color:#0ea5e9">🐟 GuppyStore</h2>
      <p>Your OTP for ${purpose} is:</p>
      <h1 style="letter-spacing:8px;color:#0f172a">${otp}</h1>
      <p style="color:#64748b;font-size:13px">Valid for 10 minutes. Do not share this with anyone.</p>
    </div>`;

  await transporter.sendMail({ from: `"GuppyStore" <${process.env.EMAIL_USER}>`, to, subject, html });
};
