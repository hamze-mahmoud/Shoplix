const express = require('express')
const multer = require('multer')
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const cloudinary = require('cloudinary').v2
const router = express.Router()
const productsCtrl = require('../controllers/products')
const categoriesCtrl = require('../controllers/categories/')
const usersCtrl = require('../controllers/users')
const ordersCtrl = require('../controllers/orders')
const reviewsCtrl = require('../controllers/reviews')
const bannersCtrl = require('../controllers/banners')
const offersCtrl = require('../controllers/offers')

const { protect, admin } = require('../middleware/authMiddleware')

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'green-light-shop', // Optional: folder name on Cloudinary
    allowed_formats: ['jpeg', 'png', 'jpg']
  }
})
const upload = multer({ storage })

// All routes in this file are for admins only, so apply middleware to all
router.use(protect, admin)

// User management routes
router.get('/users', usersCtrl.getAllUsers)
router.delete('/users/:id', usersCtrl.deleteUser)
//router.patch('/users/:id/role', usersCtrl.updateUserRole)

// Product management routes
router.get('/products', productsCtrl.getAllProducts)
// Lightweight paginated picker (bundle-offer admin) — declared before /:id-style routes
router.get('/products/search', productsCtrl.pickerSearchProducts)
router.post('/products', upload.any(), productsCtrl.createProduct);
router.put('/products/:id', upload.array('images', 10), productsCtrl.updateProduct)
router.delete('/products/:id', productsCtrl.deleteProduct)

// Order management routes
router.get('/orders', ordersCtrl.getAllOrders)
router.get('/orders/export/pdf', ordersCtrl.exportOrdersPdf)
router.put('/orders/:id/status', ordersCtrl.updateOrderStatus)

// Homepage banner management routes
router.get('/banners', bannersCtrl.adminGetBanners)
router.post('/banners', upload.single('image'), bannersCtrl.createBanner)
router.put('/banners/:id', upload.single('image'), bannersCtrl.updateBanner)
router.delete('/banners/:id', bannersCtrl.deleteBanner)

// Bundle offer management routes
router.get('/offers', offersCtrl.adminGetOffers)
router.get('/offers/:id', offersCtrl.adminGetOffer)
router.post('/offers', upload.array('images', 8), offersCtrl.createOffer)
router.put('/offers/:id', upload.array('images', 8), offersCtrl.updateOffer)
router.delete('/offers/:id', offersCtrl.deleteOffer)

// Review moderation routes
router.get('/reviews', reviewsCtrl.adminGetReviews)
router.patch('/reviews/:id/status', reviewsCtrl.adminSetReviewStatus)

// Category management routes
router.get('/categories', categoriesCtrl.getAllCategories)
router.post('/categories', categoriesCtrl.createCategory)
router.put('/categories/:id', categoriesCtrl.updateCategory)
router.delete('/categories/:id', categoriesCtrl.deleteCategory)

module.exports = router