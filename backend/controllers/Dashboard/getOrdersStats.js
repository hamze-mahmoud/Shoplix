const Order = require("../../models/Order");

const getOrdersStats = async (req, res) => {
  try {
    const data = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const formatted = data.map((item) => ({
      name: item._id,
      value: item.count
    }));

    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getOrdersStats;