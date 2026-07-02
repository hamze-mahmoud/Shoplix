const express = require('express')
const router = express.Router()

const {
  addToWishlist,
  getUserWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/WishlistController')

const auth = require('../middleware/auth')

router.post('/', auth, addToWishlist)
router.get('/', auth, getUserWishlist)
router.delete('/', auth, removeFromWishlist)
router.delete('/clear', auth, clearWishlist)

module.exports = router