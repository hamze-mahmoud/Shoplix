const { Variant } = require('../../models/Variant')
const updateVariant = async (req, res) => {
  try {
    const variant = await Variant.findById(req.params.id)

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' })
    }

    let images = variant.images

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path)
      images = [...images, ...newImages]
    }

    const updated = await Variant.findByIdAndUpdate(
      req.params.id,
      { ...req.body, images },
      { new: true }
    )

    res.json({
      success: true,
      variant: updated
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = updateVariant