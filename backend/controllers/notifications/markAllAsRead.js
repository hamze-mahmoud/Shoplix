const Notification = require('../../models/Notification')

// PATCH /api/notifications/read-all — mark all of the user's notifications read
module.exports = async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id

    await Notification.updateMany(
      { $or: [{ user: userId }, { user: null }], read: false },
      { $set: { read: true } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error('markAllAsRead error', err)
    res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
}
