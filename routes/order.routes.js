const express = require('express')
const router = express.Router()
const {
  createOrder,
  getMyOrders,
  getOrderById,
  downloadInvoice,
  requestReturn
} = require('../controllers/order.controller')
const { protect } = require('../middleware/auth.middleware')

router.use(protect) // All order routes are protected

router.post('/create', createOrder)
router.get('/my-orders', getMyOrders)
router.get('/:id', getOrderById)
router.get('/:id/invoice', downloadInvoice)
router.post('/:id/return', requestReturn)

module.exports = router