const express = require('express')
const router = express.Router()
const ordersCtrl = require('../controllers/orders')
const { protect } = require('../middleware/authMiddleware')

// all order routes require authentication
router.use(protect)

router.get('/', ordersCtrl.getUserOrders)
router.post('/', ordersCtrl.createOrder)
router.get('/:id', ordersCtrl.getOrderById)
router.delete('/:id', ordersCtrl.cancelOrder)

module.exports = router
