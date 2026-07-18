const Notification = require('../../models/Notification')

// GET /api/notifications/unread-count
// Personal notifications use their own `read` flag; broadcasts are unread
// for this user until they appear in the broadcast's `readBy`.
module.exports = async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id

    const [personal, broadcasts] = await Promise.all([
      Notification.countDocuments({ user: userId, read: false }),
      Notification.countDocuments({ user: null, readBy: { $ne: userId } }),
    ])

    res.json({ unreadCount: personal + broadcasts })
  } catch (err) {
    console.error('getUnreadCount error', err)
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
}
