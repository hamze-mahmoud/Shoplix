const express = require('express')
const router = express.Router()
const authCtrl = require('../controllers/auth')
const auth = require('../middleware/authMiddleware')
const rateLimit = require('../utils/rateLimit')

// Sensitive endpoints share one limiter: 30 requests / 5 min per IP per
// endpoint. Protects against credential brute force and WhatsApp-send abuse
// (each send costs money on a real number).
const authLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 30 })

// public
router.post("/signup", authLimiter, authCtrl.signUp);
router.post("/signin", authLimiter, authCtrl.signIn);

// WhatsApp OTP: confirm the 6-digit signup code / re-send it
router.post("/verify-otp", authLimiter, authCtrl.verifyOtp);
router.post("/resend-otp", authLimiter, authCtrl.resendOtp);

// Forgot password: WhatsApp reset code → new password (+ fresh session)
router.post("/forgot-password", authLimiter, authCtrl.forgotPassword);
router.post("/reset-password", authLimiter, authCtrl.resetPassword);

router.get("/verify-email", authCtrl.verifyEmail);

// protected
router.get("/check-isVerified", authCtrl.checkIsVerified);
router.post("/refresh", authCtrl.refreshToken);

router.get("/me", auth.protect, authCtrl.getMe)
// Logout tears down the server session (deletes the refresh token + clears the
// cookie). Must be POST /logout to match the client; the old GET /logOut never
// matched the client call, so sessions were never actually destroyed.
router.post("/logout", authCtrl.logOut)

module.exports = router
