const Category = require("../../models/Category");

const getCategoryBreadcrumb = async (req, res) => {
  try {
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const breadcrumb = [];

    while (category) {
      breadcrumb.unshift({
        _id: category._id,
        name: category.name,
      });

      category = category.parent
        ? await Category.findById(category.parent)
        : null;
    }

    res.json(breadcrumb);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
module.exports = getCategoryBreadcrumb;