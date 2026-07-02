const express = require('express')
const router = express.Router()
const cartCtrl = require('../controllers/cart')
const { protect } = require('../middleware/authMiddleware')

// cart operations require authentication
router.use(protect)

router.route('/').get(cartCtrl.getCart).post(cartCtrl.addToCart)
router.delete('/:variantId', cartCtrl.removeFromCart)
router.put("/item/:productId/:variantId", cartCtrl.updateCartItemQuantity);
module.exports = router
