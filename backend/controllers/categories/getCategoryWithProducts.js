const Category = require("../../models/Category");
const Product = require("../../models/Product");

const getCategoryWithProducts = async (req, res) => {
  try {
    const id = req.params.id.trim(); // 🔥 remove spaces

    console.log("category id:", id);

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    const products = await Product.find({
      category: id,
    })
      .populate("category", "name")
      .limit(50)
      .sort({ createdAt: -1 });

    res.status(200).json({
      category,
      products,
      count: products.length,
    });

  } catch (error) {
    console.error(
      "getCategoryWithProducts error:",
      error
    );

    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = getCategoryWithProducts;