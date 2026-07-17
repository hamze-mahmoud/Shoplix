const express = require('express')
const router = express.Router()
const usersCtrl = require('../controllers/users')
const { protect } = require('../middleware/authMiddleware')

// Public route
router.post('/', usersCtrl.createUser)

// Protected routes (require authentication)
// A user can get and update their own profile
router.get('/me', protect, usersCtrl.getCurrentUser)
router.put('/me', protect, usersCtrl.updateUser) // Controller should use req.user.id
router.put('/me/password', protect, usersCtrl.changePassword)

module.exports = router
