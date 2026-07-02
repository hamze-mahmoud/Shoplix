module.exports = {
  getAllProducts: require('./getAllProducts'),
  getProduct: require('./getProductById'),
  createProduct: require('./createProduct'),
  updateProduct: require('./updateProduct'),
  deleteProduct: require('./deleteProduct'),
  searchProducts: require('./searchProducts'),
  autocompleteSearch: require('./autocompleteSearch'),
  getFeaturedProducts:require("./getFeaturedProducts"),
  getBestSellers:require("./getBestSellers"),
  getRecommendedProducts:require("./getRecommendedProducts")
}
