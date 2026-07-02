/**
 * ➖ Remove item from Wishlist
 */
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.id
    const { productId, variantId } = req.body

    const wishlist = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          items: {
            product: productId,
            variant: variantId || null
          }
        }
      },
      { new: true }
    )

    res.json({
      success: true,
      wishlist
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = removeFromWishlist