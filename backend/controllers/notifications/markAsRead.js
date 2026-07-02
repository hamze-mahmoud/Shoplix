const Notification = require('../../models/Notification')

// PATCH /api/notifications/:id/read — mark a single notification read
module.exports = async function markAsRead(req, res) {
  try {
    const userId = req.user.id
    const { id } = req.params

    const notification = await Notification.findOne({
      _id: id,
      $or: [{ user: userId }, { user: null }],
    })

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' })
    }

    notification.read = true
    await notification.save()

    res.json(notification)
  } catch (err) {
    console.error('markAsRead error', err)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}
