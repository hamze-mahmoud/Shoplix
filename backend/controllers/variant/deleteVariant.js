const cloudinary = require('../../config/cloudinary')
const Variant = require('../../models/Variant')

const deleteVariant= async (req, res) => {
  try {
    const { id } = req.params
    const { imageUrl } = req.body

    const variant = await Variant.findById(id)

    if (!variant) {
      return res.status(404).json({ message: 'Variant not found' })
    }

    // استخراج public_id من الرابط
    const publicId = imageUrl.split('/').pop().split('.')[0]

    await cloudinary.uploader.destroy(`variants/${publicId}`)

    variant.images = variant.images.filter(img => img !== imageUrl)

    await variant.save()

    res.json({
      success: true,
      images: variant.images
    })

  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
module.exports = deleteVariant