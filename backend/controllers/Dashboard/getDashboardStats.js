const Product = require("../../models/Product");
const Order = require("../../models/Order");
const User = require("../../models/User");

const getDashboardStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();

    const revenueResult = await Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" }
        }
      }
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    res.json({
      totalProducts,
      totalUsers,
      totalOrders,
      totalRevenue,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getDashboardStats;