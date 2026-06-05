const Order = require('../models/Order')
const Cart = require('../models/Cart')
const Product = require('../models/Product')
const Notification = require('../models/Notification')
const Interaction = require('../models/Interaction')
const { sendEmail, orderConfirmTemplate } = require('../utils/sendEmail')
const generateInvoice = require('../utils/generateInvoice')
const { getIO } = require('../utils/socket')

// @POST /api/orders/create
const createOrder = async (req, res) => {
  try {
    const { products, totalAmount, discount, couponCode, paymentId, shippingAddress } = req.body

    const order = await Order.create({
      userId: req.user._id,
      products,
      totalAmount,
      discount: discount || 0,
      couponCode: couponCode || null,
      paymentId,
      paymentStatus: 'paid',
      orderStatus: 'placed',
      shippingAddress
    })

    // Clear cart after order
    await Cart.findOneAndUpdate({ userId: req.user._id }, { products: [] })

    // Track interaction for ML
    for (const item of products) {
      await Interaction.create({
        userId: req.user._id,
        productId: item.productId,
        action: 'purchase',
        score: 5
      })
      // Reduce stock
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      })
    }

    // Create notification
    const notification = await Notification.create({
      userId: req.user._id,
      title: 'Order Placed Successfully!',
      message: `Your order #${order._id} has been placed. Total: ₹${totalAmount}`,
      type: 'order',
      link: `/orders/${order._id}`
    })

    // Emit socket notification
    const io = getIO()
    io.to(req.user._id.toString()).emit('notification', notification)

    // Send confirmation email
    await sendEmail({
      to: req.user.email,
      subject: 'Order Confirmed - ShopSphere',
      html: orderConfirmTemplate(order)
    })

    res.status(201).json({ success: true, message: 'Order placed successfully', order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/orders/my-orders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 })
    res.status(200).json({ success: true, orders })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/orders/:id/invoice
const downloadInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const pdfBuffer = await generateInvoice(order)

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice-${order._id}.pdf`
    })

    res.send(pdfBuffer)
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/orders/:id/return
const requestReturn = async (req, res) => {
  try {
    const { reason } = req.body
    const Return = require('../models/Return')

    const order = await Order.findById(req.params.id)
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    if (order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'Only delivered orders can be returned' })
    }

    const returnRequest = await Return.create({
      userId: req.user._id,
      orderId: order._id,
      reason,
      refundAmount: order.totalAmount
    })

    res.status(201).json({ success: true, message: 'Return request submitted', returnRequest })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createOrder, getMyOrders, getOrderById, downloadInvoice, requestReturn }