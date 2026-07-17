const express = require('express')
const router = express.Router()
const authCtrl = require('../controllers/auth')
const auth = require('../middleware/authMiddleware')
const rateLimit = require('../utils/rateLimit')

// General limiter for sensitive endpoints: 30 requests / 5 min per IP per
// endpoint (WhatsApp OTP resends etc. — each send costs money on a real number).
const authLimiter = rateLimit({ windowMs: 5 * 60 * 1000, max: 30 })

// Stricter limiter for the credential endpoints most targeted by brute force:
// 8 attempts / 10 min per IP. Legit users rarely fail this many times.
const loginLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 8 })

// public
router.post("/signup", authLimiter, authCtrl.signUp);
// Direct signup (no WhatsApp code) — temporary while Meta business
// verification is pending; creates the account verified + logs straight in.
router.post("/signup-direct", authLimiter, authCtrl.signUpDirect);
router.post("/signin", loginLimiter, authCtrl.signIn);

// WhatsApp OTP: confirm the 6-digit signup code / re-send it
router.post("/verify-otp", authLimiter, authCtrl.verifyOtp);
router.post("/resend-otp", authLimiter, authCtrl.resendOtp);

// WhatsApp "tap-to-verify" signup: customer sends a code from their number to
// prove ownership (no template / business verification needed). wa-start creates
// the pending account + code; the page polls wa-status until the webhook matches.
router.post("/wa-start", authLimiter, authCtrl.waStart);
router.get("/wa-status", authCtrl.waStatus);

// Forgot password: WhatsApp reset code → new password (+ fresh session)
router.post("/forgot-password", authLimiter, authCtrl.forgotPassword);
router.post("/reset-password", loginLimiter, authCtrl.resetPassword);

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
