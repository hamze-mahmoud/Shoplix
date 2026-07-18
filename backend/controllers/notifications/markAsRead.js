const Notification = require('../../models/Notification')

// PATCH /api/notifications/:id/read — mark a single notification read
// Personal → flip its `read` flag. Broadcast → record THIS user in `readBy`
// (the shared flag must never change, or one reader hides it for everyone).
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

    if (!notification.user) {
      await Notification.updateOne({ _id: id }, { $addToSet: { readBy: userId } })
    } else {
      notification.read = true
      await notification.save()
    }

    const out = notification.toObject()
    delete out.readBy
    out.read = true
    res.json(out)
  } catch (err) {
    console.error('markAsRead error', err)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
}
