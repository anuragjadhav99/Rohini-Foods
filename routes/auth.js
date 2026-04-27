const express = require('express');
const speakeasy = require('speakeasy');
const router = express.Router();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@rohini-foods.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOTP_SECRET = process.env.ADMIN_TOTP_SECRET || 'JBSWY3DPEHPK3PXP';

// POST /api/auth/login
// First step: validate email and password, then ask for OTP.
router.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }

  return res.json({ success: true, otpRequired: true, message: 'Please verify with your Google Authenticator code.' });
});

// POST /api/auth/verify
// Second step: verify the OTP code from Google Authenticator.
router.post('/verify', (req, res) => {
  const { email, token } = req.body || {};
  if (!email || !token) {
    return res.status(400).json({ success: false, error: 'Email and OTP code are required.' });
  }

  if (email !== ADMIN_EMAIL) {
    return res.status(401).json({ success: false, error: 'Invalid email.' });
  }

  const verified = speakeasy.totp.verify({
    secret: ADMIN_TOTP_SECRET,
    encoding: 'base32',
    token: token.trim(),
    window: 1,
  });

  if (!verified) {
    return res.status(401).json({ success: false, error: 'Invalid or expired OTP code.' });
  }

  return res.json({ success: true, data: { email: ADMIN_EMAIL, name: 'Admin' } });
});

module.exports = router;
