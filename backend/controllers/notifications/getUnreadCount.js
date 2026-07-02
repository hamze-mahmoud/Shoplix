const Notification = require('../../models/Notification')

// GET /api/notifications/unread-count
module.exports = async function getUnreadCount(req, res) {
  try {
    const userId = req.user.id

    const unreadCount = await Notification.countDocuments({
      $or: [{ user: userId }, { user: null }],
      read: false,
    })

    res.json({ unreadCount })
  } catch (err) {
    console.error('getUnreadCount error', err)
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
}
