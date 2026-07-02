const router = require("express").Router();
const ctrl = require("../controllers/categories");
const { protect } = require("../middleware/authMiddleware");
const uploadCategory = require("../middleware/uploadCategory");

// ======================
// 🔥 SPECIFIC ROUTES FIRST
// ======================

router.get("/root/all", ctrl.getRootCategories);
router.get("/tree/all", ctrl.getCategoryTree);
router.get("/showcase/all", ctrl.getCategoriesShowcase);
router.get("/search/query", ctrl.searchCategories);

// ======================
// 🔥 CRUD
// ======================

router.get("/", ctrl.getAllCategories);
router.post("/", protect, uploadCategory.single("image"), ctrl.createCategory);

router.put("/:id", protect, uploadCategory.single("image"), ctrl.updateCategory);
router.delete("/:id", protect, ctrl.deleteCategory);

// ======================
// 🔥 DYNAMIC ROUTES LAST
// ======================

router.get("/:id/breadcrumb", ctrl.getCategoryBreadcrumb);
router.get("/:id/children", ctrl.getCategoryChildren);
router.get("/:id", ctrl.getCategoryById);
router.get("/:id/products", ctrl.getCategoryWithProducts);

module.exports = router;