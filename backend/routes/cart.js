const express = require('express')
const router = express.Router()
const cartCtrl = require('../controllers/cart')
const { protect } = require('../middleware/authMiddleware')

// cart operations require authentication
router.use(protect)

router.route('/').get(cartCtrl.getCart).post(cartCtrl.addToCart)

// Bundle-offer cart lines (declared BEFORE the /:variantId route so "bundle"
// isn't swallowed as a variantId).
router.post('/bundle', cartCtrl.addBundleToCart)
router.delete('/bundle/:bundleId', cartCtrl.removeBundleFromCart)

router.delete('/:variantId', cartCtrl.removeFromCart)
router.put("/item/:productId/:variantId", cartCtrl.updateCartItemQuantity);
module.exports = router
