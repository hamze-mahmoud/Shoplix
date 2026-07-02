module.exports = {
    getCategoryWithProducts: require('./getCategoryWithProducts'),

  getCategoryById: require('./getCategoryById'),
  getAllCategories: require('./getAllCategories'),
  createCategory: require('./createCategory'),
  updateCategory: require('./updateCategory'),
  deleteCategory: require('./deleteCategory'),

  // 🔥 NEW (IMPORTANT)
  getCategoryTree: require('./getCategoryTree'),
  getCategoryChildren: require('./getCategoryChildren'),
  getRootCategories: require('./getRootCategories'),
  getCategoriesShowcase: require('./getCategoriesShowcase'),
  getCategoryBreadcrumb: require('./getCategoryBreadcrumb'),

  // 🔹 OPTIONAL (ADVANCED)
  searchCategories: require('./searchCategories'),
};