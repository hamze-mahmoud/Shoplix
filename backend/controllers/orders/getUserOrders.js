const Order = require('../../models/Order');

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ user: userId })
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    console.error('getUserOrders error:', error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = getUserOrders;