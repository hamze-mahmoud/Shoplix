const Notification = require('../../models/Notification')

// POST /api/notifications  (admin)
// Manual / broadcast notification. Omit userId to broadcast to everyone.
module.exports = async function sendNotification(req, res) {
  try {
    const { title, message, userId, type } = req.body

    if (!title || !message) {
      return res.status(400).json({ error: 'Title and message are required' })
    }

    const notification = await Notification.create({
      title,
      message,
      user: userId || null,
      type: type || 'system',
      read: false,
    })

    const io = req.app.get('io')

    if (io) {
      if (userId) {
        io.to(userId.toString()).emit('new_notification', notification)
      } else {
        io.emit('new_notification', notification)
      }
    }

    res.status(201).json(notification)
  } catch (err) {
    console.error('sendNotification error:', err)
    res.status(500).json({ error: 'Failed to create notification' })
  }
}
