const Notification = require('../../models/Notification')

// PATCH /api/notifications/read-all — mark all of the user's notifications read
// Personal docs flip `read`; broadcasts get this user added to `readBy`.
module.exports = async function markAllAsRead(req, res) {
  try {
    const userId = req.user.id

    await Promise.all([
      Notification.updateMany(
        { user: userId, read: false },
        { $set: { read: true } }
      ),
      Notification.updateMany(
        { user: null, readBy: { $ne: userId } },
        { $addToSet: { readBy: userId } }
      ),
    ])

    res.json({ success: true })
  } catch (err) {
    console.error('markAllAsRead error', err)
    res.status(500).json({ error: 'Failed to mark notifications as read' })
  }
}
