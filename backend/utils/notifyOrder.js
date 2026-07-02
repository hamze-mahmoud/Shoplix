const Notification = require('../models/Notification')

// Map legacy statuses to canonical lifecycle events
const EVENT_ALIAS = {
  pending: 'placed',
  paid: 'confirmed',
  processing: 'preparing',
}

// English fallback text (the frontend renders the i18n keys; this is a safety net
// for any non-i18n consumer and for readability in the DB).
const FALLBACK = {
  placed: { title: 'Order placed', message: 'Your order #{id} has been placed successfully.' },
  confirmed: { title: 'Order confirmed', message: 'Your order #{id} has been confirmed.' },
  preparing: { title: 'Preparing your order', message: 'Your order #{id} is being prepared.' },
  shipped: { title: 'Order shipped', message: 'Your order #{id} has been shipped and is on the way.' },
  out_for_delivery: { title: 'Out for delivery', message: 'Your order #{id} is out for delivery.' },
  delivered: { title: 'Order delivered', message: 'Your order #{id} has been delivered. Enjoy!' },
  cancelled: { title: 'Order cancelled', message: 'Your order #{id} has been cancelled.' },
}

/**
 * Create an order notification + push it in real time to the order owner.
 * @param {object} io   - socket.io server instance (req.app.get('io'))
 * @param {object} order - the order document (must have _id and user)
 * @param {string} status - the new order status / event
 */
async function notifyOrder(io, order, status) {
  const event = EVENT_ALIAS[status] || status
  const fallback = FALLBACK[event]
  if (!fallback) return null // unknown event → skip

  const orderId = order._id.toString().slice(-6)
  const userId = (order.user._id || order.user).toString()

  const notification = await Notification.create({
    user: userId,
    order: order._id,
    type: 'order',
    event,
    titleKey: `notifications.events.${event}.title`,
    messageKey: `notifications.events.${event}.message`,
    params: { orderId },
    title: fallback.title,
    message: fallback.message.replace('{id}', orderId),
    read: false,
  })

  // Real-time push to the user's personal room (joined on socket connect)
  if (io) {
    io.to(userId).emit('new_notification', notification)
  }

  return notification
}

module.exports = notifyOrder
