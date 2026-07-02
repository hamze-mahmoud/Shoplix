const Variant = require('../../models/Variant')

const getVariant = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id)

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' })
    }

    res.json({
      success: true,
      variant
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports= getVariant