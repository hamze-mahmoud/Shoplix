const Order = require('../../models/Order')
const notifyOrder = require('../../utils/notifyOrder')

module.exports = async function cancelOrder(req, res) {
  const { id } = req.params

  try {
    const order = await Order.findById(id)

    if (!order) return res.status(404).json({ error: 'Order not found' })

    if (order.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    if (['shipped', 'out_for_delivery', 'delivered'].includes(order.status)) {
      return res.status(400).json({ error: 'Cannot cancel a shipped or delivered order' })
    }

    order.status = 'cancelled'
    await order.save()

    // Notify the user their order was cancelled
    try {
      await notifyOrder(req.app.get('io'), order, 'cancelled')
    } catch (notifyErr) {
      console.error('notifyOrder (cancelled) failed:', notifyErr)
    }

    res.json({ message: 'Order cancelled', order })
  } catch (err) {
    console.error('cancelOrder error', err)
    res.status(500).json({ error: 'Failed to cancel order' })
  }
}
