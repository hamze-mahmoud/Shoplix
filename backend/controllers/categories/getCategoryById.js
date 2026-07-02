const Category = require("../../models/Category");

// GET ONE
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate("parent");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getCategoryById;