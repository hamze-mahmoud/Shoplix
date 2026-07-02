const Category = require("../../models/Category");

const searchCategories= async (req, res) => {
  try {
    const { q } = req.query;

    const categories = await Category.find({
      name: { $regex: q, $options: "i" },
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = searchCategories;