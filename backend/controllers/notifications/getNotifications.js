const Notification = require('../../models/Notification')

// GET /api/notifications — current user's notifications (+ broadcasts)
module.exports = async function getNotifications(req, res) {
  try {
    const userId = req.user.id

    const notifications = await Notification.find({
      $or: [{ user: userId }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50)

    const unreadCount = await Notification.countDocuments({
      $or: [{ user: userId }, { user: null }],
      read: false,
    })

    res.json({ notifications, unreadCount })
  } catch (err) {
    console.error('getNotifications error', err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}
