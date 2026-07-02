const User = require('../models/User')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Category = require('../models/Category')
const cloudinary = require('cloudinary').v2

const VALID_USER_ROLES = ['user', 'admin']
const VALID_ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

const handleServerError = (res, err, context) => {
  console.error(`${context} error`, err)
  res.status(500).json({ error: `Failed to ${context.toLowerCase()}` })
}

// User management
async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-passwordHash').sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    handleServerError(res, err, 'fetch users')
  }
}

async function deleteUser(req, res) {
  const { id } = req.params
  try {
    const user = await User.findByIdAndDelete(id)
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ message: 'User deleted' })
  } catch (err) {
    handleServerError(res, err, 'delete user')
  }
}

async function updateUserRole(req, res) {
  const { id } = req.params
  const { role } = req.body
  if (!VALID_USER_ROLES.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }
  try {
    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch (err) {
    handleServerError(res, err, 'update user role')
  }
}

// Product management
async function getAllProducts(req, res) {
  try {
    const products = await Product.find().populate('category', 'name').sort({ createdAt: -1 })
    res.json(products)
  } catch (err) {
    handleServerError(res, err, 'fetch products')
  }
}

const Variant = require('../models/Variant')

async function createProduct(req, res) {
  try {
    let { name, description, category, variants } = req.body

    if (!name || !category || !variants) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // 🧠 مهم: لأن variants جاي JSON string من frontend
    variants = JSON.parse(variants)

    // 📸 صور Cloudinary
    const uploadedImages = req.files
      ? req.files.map(file => ({
          url: file.path,
          public_id: file.filename
        }))
      : []

    // 🧱 إنشاء المنتج
    const product = new Product({
      name,
      description,
      category
    })

    await product.save()

    // 🎯 إنشاء variants
    const variantDocs = variants.map(v => ({
      productId: product._id,
      color: v.color,
      storage: v.storage || 0,
      price: v.price,
      discount: v.discount || 0,
      stock: v.stock || 0,
      images: uploadedImages // نفس الصور لكل variant
    }))

    await Variant.insertMany(variantDocs)

    res.status(201).json({
      success: true,
      product
    })

  } catch (err) {
    handleServerError(res, err, 'create product')
  }
}

async function updateProduct(req, res) {
  const { id } = req.params
  const { imagesToDelete, ...updates } = req.body
  // Store both the URL (file.path) and the public_id (file.filename)
  const newImages = req.files ? req.files.map(file => ({
    url: file.path, public_id: file.filename
  })) : []

  try {
    const product = await Product.findById(id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    // Explicitly assign fields to avoid mass-assignment vulnerabilities
    const allowedUpdates = ['name', 'description', 'price', 'category', 'stock', 'discount']
    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        product[key] = updates[key]
      }
    }

    // 1. Delete images that were marked for deletion
    if (imagesToDelete && imagesToDelete.length > 0) {
      // Tell Cloudinary to delete the files
      await cloudinary.uploader.destroy(imagesToDelete)

      // Remove the deleted images from the product's image array
      product.images = product.images.filter(
        (img) => !imagesToDelete.includes(img.public_id)
      )
    }

    // 2. Add any newly uploaded images
    if (newImages.length > 0) {
      product.images.push(...newImages)
    }

    await product.save()
    res.json(product)
  } catch (err) {
    handleServerError(res, err, 'update product')
  }
}

async function deleteProduct(req, res) {
  const { id } = req.params
  try {
    const product = await Product.findByIdAndDelete(id)
    if (!product) return res.status(404).json({ error: 'Product not found' })

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      // Extract all public_ids from the images array
      const publicIds = product.images.map(img => img.public_id)
      // Tell Cloudinary to delete all these images
      await cloudinary.uploader.destroy(publicIds)
    }

    res.json({ message: 'Product deleted' })
  } catch (err) {
    handleServerError(res, err, 'delete product')
  }
}

// Order management
async function getAllOrders(req, res) {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 })
    res.json(orders)
  } catch (err) {
    handleServerError(res, err, 'fetch orders')
  }
}

async function updateOrderStatus(req, res) {
  const { id } = req.params
  const { status } = req.body

  if (!status || !VALID_ORDER_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_ORDER_STATUSES.join(', ')}` })
  }

  try {
    const order = await Order.findById(id)
    if (!order) return res.status(404).json({ error: 'Order not found' })

    order.status = status
    await order.save()
    res.json(order)
  } catch (err) {
    handleServerError(res, err, 'update order')
  }
}

// Category management
async function getAllCategories(req, res) {
  try {
    const categories = await Category.find().sort({ name: 1 })
    res.json(categories)
  } catch (err) {
    handleServerError(res, err, 'fetch categories')
  }
}

async function createCategory(req, res) {
  const { name, description } = req.body

  if (!name) {
    return res.status(400).json({ error: 'Name is required' })
  }

  try {
    const category = new Category({ name, description })
    await category.save()
    res.status(201).json(category)
  } catch (err) {
    handleServerError(res, err, 'create category')
  }
}

async function updateCategory(req, res) {
  const { id } = req.params
  const updates = req.body

  try {
    const category = await Category.findByIdAndUpdate(id, updates, { new: true })
    if (!category) return res.status(404).json({ error: 'Category not found' })
    res.json(category)
  } catch (err) {
    handleServerError(res, err, 'update category')
  }
}

async function deleteCategory(req, res) {
  const { id } = req.params
  try {
    const category = await Category.findByIdAndDelete(id)
    if (!category) return res.status(404).json({ error: 'Category not found' })
    res.json({ message: 'Category deleted' })
  } catch (err) {
    handleServerError(res, err, 'delete category')
  }
}

module.exports = {
  getAllUsers,
  deleteUser,
  updateUserRole,
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
}