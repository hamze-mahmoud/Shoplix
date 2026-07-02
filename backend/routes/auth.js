const express = require('express')
const router = express.Router()
const authCtrl = require('../controllers/auth')
const auth = require('../middleware/authMiddleware')

// public
router.post("/signup", authCtrl.signUp);
router.post("/signin", authCtrl.signIn);

// social login (Google / Facebook)
router.post("/google", authCtrl.googleAuth);
router.post("/facebook", authCtrl.facebookAuth);

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
