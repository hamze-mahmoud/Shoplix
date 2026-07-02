const Order = require('../../models/Order')
const notifyOrder = require('../../utils/notifyOrder')

// Canonical lifecycle + legacy values (kept for backward compatibility)
const validStatuses = [
  'placed', 'confirmed', 'preparing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled',
  'pending', 'paid', 'processing'
]

module.exports = async function updateOrderStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    })
  }

  try {
    const order = await Order.findById(id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const previousStatus = order.status
    order.status = status
    await order.save()

    // Only notify when the status actually changed
    if (previousStatus !== status) {
      try {
        await notifyOrder(req.app.get('io'), order, status)
      } catch (notifyErr) {
        console.error('notifyOrder (status change) failed:', notifyErr)
      }
    }

    res.json(order)
  } catch (err) {
    console.error('updateOrderStatus error', err)
    res.status(500).json({ error: 'Failed to update order' })
  }
}
