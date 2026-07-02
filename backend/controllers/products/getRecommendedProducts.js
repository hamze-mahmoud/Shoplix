const Product = require("../../models/Product");
const mongoose = require("mongoose");

const getRecommendedProducts = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const recommendations =
      await Product.find({
        category: product.category,
        _id: {
          $ne: product._id,
        },
      })
        .limit(8)
        .sort({
          createdAt: -1,
        });

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

module.exports =
  getRecommendedProducts;