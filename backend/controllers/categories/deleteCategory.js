const Category = require("../../models/Category");
const { cache } = require("../../config/cache");
const cloudinary = require("../../config/cloudinary");

// DELETE
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // check children
    const hasChildren = await Category.findOne({ parent: categoryId });

    if (hasChildren) {
      return res.status(400).json({
        message: "Cannot delete category with subcategories",
      });
    }

    const category = await Category.findByIdAndDelete(categoryId);

    if (category?.image?.public_id) {
      await cloudinary.uploader.destroy(category.image.public_id);
    }

    await cache.delByPrefix("categories:");
    await cache.delByPrefix("products:");

    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = deleteCategory;