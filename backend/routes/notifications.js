const express = require('express')
const router = express.Router()
const notifCtrl = require('../controllers/notifications')
const { protect, admin } = require('../middleware/authMiddleware')

// All notification routes require an authenticated user
router.use(protect)

// GET /api/notifications — current user's notifications + unread count
router.get('/', notifCtrl.getNotifications)

// GET /api/notifications/unread-count
router.get('/unread-count', notifCtrl.getUnreadCount)

// PATCH /api/notifications/read-all — mark all as read
router.patch('/read-all', notifCtrl.markAllAsRead)

// PATCH /api/notifications/:id/read — mark one as read
router.patch('/:id/read', notifCtrl.markAsRead)

// POST /api/notifications — admin broadcast / manual send
router.post('/', admin, notifCtrl.sendNotification)

module.exports = router
