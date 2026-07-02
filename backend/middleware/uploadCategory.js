const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('../config/cloudinary')

// 🔥 إعداد Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: 'categories', // 📁 اسم الفولدر في Cloudinary
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],

      // 🔥 اسم فريد للصورة
      public_id: `category_${Date.now()}_${file.originalname.split('.')[0]}`,

      // 🔥 تحسين الصور تلقائيًا
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto' }
      ]
    }
  }
})

// 📦 multer middleware
const uploadCategory = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPG, PNG, WEBP allowed'), false)
    }
  }
})

module.exports = uploadCategory
