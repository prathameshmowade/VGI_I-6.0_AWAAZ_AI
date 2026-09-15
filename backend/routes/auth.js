const express = require('express');
const router = express.Router();
const { register, verifyOTP, sendOTP, login, googleLogin, googleVerifyOtp } = require('../controllers/authController');

router.post('/register', register);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);

// Google OAuth + Email OTP
router.post('/google', googleLogin);
router.post('/google-verify-otp', googleVerifyOtp);

module.exports = router;
