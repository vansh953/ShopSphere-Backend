const express = require('express')
const router = express.Router()
const {
  getDashboard,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getReturns,
  updateReturn
} = require('../controllers/admin.controller')
const { protect } = require('../middleware/auth.middleware')
const { adminOnly } = require('../middleware/admin.middleware')
const upload = require('../middleware/upload')

// All admin routes require auth + admin role
router.use(protect, adminOnly)

// Dashboard
router.get('/dashboard', getDashboard)

// Analytics
router.get('/analytics', async (req, res) => {
  try {
    const Order = require('../models/Order')

    const salesByMonth = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      {
        $group: {
          _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ])

    const topProducts = await Order.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products.productId', name: { $first: '$products.name' }, totalSold: { $sum: '$products.quantity' } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ])

    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
    ])

    res.status(200).json({ success: true, salesByMonth, topProducts, ordersByStatus })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Products
router.post('/products', upload.single('image'), addProduct)
router.put('/products/:id', upload.single('image'), updateProduct)
router.delete('/products/:id', deleteProduct)

// Orders
router.get('/orders', getAllOrders)
router.put('/orders/:id/status', updateOrderStatus)

// Delivery location update (for live tracking)
router.put('/orders/:id/location', async (req, res) => {
  try {
    const { latitude, longitude } = req.body
    const Order = require('../models/Order')
    const { getIO } = require('../utils/socket')

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { deliveryLocation: { latitude, longitude } },
      { new: true }
    )

    const io = getIO()
    io.to(order.userId.toString()).emit('locationUpdate', { orderId: order._id, latitude, longitude })

    res.status(200).json({ success: true, message: 'Location updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Users
router.get('/users', getAllUsers)

// Coupons
router.get('/coupons', async (req, res) => {
  try {
    const Coupon = require('../models/Coupon')
    const coupons = await Coupon.find().sort({ createdAt: -1 })
    res.status(200).json({ success: true, coupons })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/coupons', async (req, res) => {
  try {
    const Coupon = require('../models/Coupon')
    const coupon = await Coupon.create(req.body)
    res.status(201).json({ success: true, message: 'Coupon created', coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/coupons/:id', async (req, res) => {
  try {
    const Coupon = require('../models/Coupon')
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true })
    res.status(200).json({ success: true, message: 'Coupon updated', coupon })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/coupons/:id', async (req, res) => {
  try {
    const Coupon = require('../models/Coupon')
    await Coupon.findByIdAndDelete(req.params.id)
    res.status(200).json({ success: true, message: 'Coupon deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Returns
router.get('/returns', getReturns)
router.put('/returns/:id', updateReturn)

module.exports = router