// BUILD TREE FUNCTION
const Category = require("../../models/Category");

function buildTree(categories, parent = null) {
  return categories
    .filter((c) =>
      parent === null
        ? !c.parent
        : String(c.parent) === String(parent)
    )
    .map((c) => ({
      ...c,
      children: buildTree(categories, c._id),
    }));
}

// GET ALL
const getAllCategories = async (req, res) => {
  try {
    console.log("🔥 getAllCategories hit");

    const categories = await Category.find().lean(); // IMPORTANT FIX

    console.log("categories:", categories);

    const tree = buildTree(categories);

    res.json(tree);
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = getAllCategories