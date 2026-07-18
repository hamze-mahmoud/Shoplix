const Notification = require('../../models/Notification')

// GET /api/notifications — current user's notifications (+ broadcasts)
//
// Broadcasts (user: null) are shared documents, so their per-user read state
// lives in `readBy`; we compute each viewer's `read` here and never expose
// the raw reader list.
module.exports = async function getNotifications(req, res) {
  try {
    const userId = req.user.id

    const docs = await Notification.find({
      $or: [{ user: userId }, { user: null }],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()

    const notifications = docs.map((n) => {
      const isBroadcast = !n.user
      const read = isBroadcast
        ? (n.readBy || []).some((id) => id.toString() === userId)
        : n.read
      const { readBy, ...rest } = n
      return { ...rest, read }
    })

    const unreadCount = notifications.filter((n) => !n.read).length

    res.json({ notifications, unreadCount })
  } catch (err) {
    console.error('getNotifications error', err)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
}
