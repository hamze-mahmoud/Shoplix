const Category = require("../../models/Category");
const { cache } = require("../../config/cache");

const buildTree = (categories, parent = null) => {
  return categories
    .filter((cat) =>
      parent
        ? cat.parent?.toString() === parent.toString()
        : cat.parent === null
    )
    .map((cat) => ({
      ...cat,
      children: buildTree(categories, cat._id),
    }));
};

const getCategoryTree = async (req, res) => {
  try {
    const tree = await cache.getOrSet("categories:tree", 300, async () => {
      const categories = await Category.find().lean();
      return buildTree(categories);
    });
    res.json(tree);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getCategoryTree;
