const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/authMiddleware')

// Controllers
const productsCtrl = require('../controllers/products')
const variantCtrl=require("../controllers/variant")

// 🔥 Get variants by product
router.get('/:id/variants',variantCtrl.getVariantsByProduct)

// 🔥 Products
router.get('/', productsCtrl.getAllProducts)
router.get("/featured", productsCtrl.getFeaturedProducts)
router.get("/bestsellers", productsCtrl.getBestSellers)
// AI-curated picks (season/holiday-aware, diverse, rotates every 6h)
router.get("/recommendations/smart", productsCtrl.getSmartRecommendations)
router.get("/search", productsCtrl.searchProducts)
router.get("/autocomplete", productsCtrl.autocompleteSearch)

router.get('/:id', productsCtrl.getProduct) // ⚠️ ALWAYS LAST

// ==============================
// 🔒 PROTECTED ROUTES
// ==============================
router.get(
  "/:id/recommendations",
  productsCtrl.getRecommendedProducts
);
router.use(protect)

router.post('/', productsCtrl.createProduct)

router.put('/:id', productsCtrl.updateProduct)
router.delete('/:id', productsCtrl.deleteProduct)



module.exports = router