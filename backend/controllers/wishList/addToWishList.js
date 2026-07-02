const Wishlist = require('../models/Wishlist')

/**
 * ➕ Add to Wishlist
 */
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.id   // لازم يكون عندك auth middleware
    const { productId, variantId } = req.body

    let wishlist = await Wishlist.findOne({ user: userId })

    // إذا ما عنده wishlist
    if (!wishlist) {
      wishlist = new Wishlist({
        user: userId,
        items: [{ product: productId, variant: variantId }]
      })
    } else {
      // منع التكرار باستخدام addToSet
      const exists = wishlist.items.find(
        item =>
          item.product.toString() === productId &&
          item.variant?.toString() === variantId
      )

      if (exists) {
        return res.status(400).json({
          message: 'Item already in wishlist'
        })
      }

      wishlist.items.push({
        product: productId,
        variant: variantId
      })
    }

    await wishlist.save()

    res.json({
      success: true,
      wishlist
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = addToWishlist  