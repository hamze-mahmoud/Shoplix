const Order = require('../../models/Order');

module.exports = async function getOrderById(req, res) {
  const { id } = req.params;

  try {
    const order = await Order.findById(id)
      .populate('user', 'firstName lastName email');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // 🔒 check ownership (safe version)
    if (order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden',
      });
    }

    return res.json({
      success: true,
      data: order,
    });

  } catch (err) {
    console.error('getOrderById error', err);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch order',
    });
  }
};