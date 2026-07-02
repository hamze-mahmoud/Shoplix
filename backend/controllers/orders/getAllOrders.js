const Order = require('../../models/Order');

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    console.error('getAllOrders error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
    });
  }
};

module.exports = getAllOrders;