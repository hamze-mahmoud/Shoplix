const Category = require("../../models/Category");
const { cache } = require("../../config/cache");

const getRootCategories = async (req, res) => {
  try {
    const categories = await cache.getOrSet("categories:root", 300, async () => {
      return Category.find({ parent: null }).lean();
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getRootCategories;
