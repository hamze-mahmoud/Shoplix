/**
 * 📥 Get User Wishlist
 */
const getUserWishlist = async (req, res) => {
  try {
    const userId = req.user.id

    const wishlist = await Wishlist.findOne({ user: userId })
      .populate('items.product')
      .populate('items.variant')

    if (!wishlist) {
      return res.json({
        success: true,
        items: []
      })
    }

    res.json({
      success: true,
      wishlist
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = getUserWishlist