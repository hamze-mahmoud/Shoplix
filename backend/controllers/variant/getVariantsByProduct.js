const Variant = require('../../models/Variant')
const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params

    const variants = await Variant.find({ product: productId })

    res.json({
      success: true,
      count: variants.length,
      variants
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = getVariantsByProduct