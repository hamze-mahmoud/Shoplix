exports.updateCartItem = async (req, res) => {
  const { variantId, quantity } = req.body

  try {
    const cart = await Cart.findOne({ user: req.user.id })

    const item = cart.items.find(
      i => String(i.variantId) === variantId
    )

    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }

    item.quantity = quantity

    await cart.save()

    res.json({ success: true, cart })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}