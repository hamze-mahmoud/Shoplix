const Cart = require('../../models/Cart')

exports.removeFromCart = async (req, res) => {
  const {  variantId } = req.params // Route is /:productId, renamed to variantId for clarity
     console.log("variantId, req.user.id", variantId, req.user.id)
  try {
    const cart = await Cart.findOne({ user: req.user.id })
    
    if (!cart) {
       return res.status(404).json({ error: 'Cart not found' })
    }

    // Remove item using filter
    cart.items = cart.items.filter(item => String(item.variantId) !== variantId)

    await cart.save()
    res.json({ success: true, cart })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}