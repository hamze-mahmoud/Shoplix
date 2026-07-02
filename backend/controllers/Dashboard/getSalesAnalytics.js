const Order = require("../../models/Order");

const getSalesAnalytics = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $match: { status: { $ne: "cancelled" } }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const formatted = data.map((item) => ({
      name: `Month ${item._id}`,
      value: item.total
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getSalesAnalytics;