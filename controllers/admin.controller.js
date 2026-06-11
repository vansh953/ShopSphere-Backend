const Product = require('../models/Product')
const Order = require('../models/Order')
const User = require('../models/User')
const Return = require('../models/Return')
const Notification = require('../models/Notification')
const { uploadToCloudinary } = require('../config/cloudinary')
const { getIO } = require('../utils/socket')
const axios = require('axios')

// @GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments()
    const totalOrders = await Order.countDocuments()
    const totalUsers = await User.countDocuments({ role: 'user' })
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ])

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name email')

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        totalOrders,
        totalUsers,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/admin/products
const addProduct = async (req, res) => {
  try {
    let productData = req.body

    if (req.body.useAI && req.body.name) {
      const aiResponse = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Generate product details for an e-commerce product named "${req.body.name}". 
            Return ONLY a JSON object with these fields: 
            description (2-3 sentences), price (realistic INR price as number), 
            category (one of: Clothing, Electronics, Footwear, Beauty and Personal Care, 
            Kitchen & Dining, Furniture, Toys, Sports & Fitness, Books, Mobiles & Accessories), 
            brand, tags (array of 5 keywords), specifications (object with key-value pairs).
            No extra text, just the JSON.`
          }]
        },
        {
          headers: {
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json'
          }
        }
      )

      const aiText = aiResponse.data.content[0].text
      const aiData = JSON.parse(aiText.replace(/```json|```/g, '').trim())
      productData = { ...productData, ...aiData }
    }

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer)
      productData.image = result.secure_url
    }

    const product = await Product.create(productData)

    const io = getIO()
    io.emit('newProduct', { message: `New product added: ${product.name}`, product })

    res.status(201).json({ success: true, message: 'Product added', product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PUT /api/admin/products/:id
const updateProduct = async (req, res) => {
  try {
    let updateData = req.body

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer)
      updateData.image = result.secure_url
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true })
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    res.status(200).json({ success: true, message: 'Product updated', product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @DELETE /api/admin/products/:id
const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false })
    res.status(200).json({ success: true, message: 'Product deactivated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/admin/orders
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query

    const query = status ? { orderStatus: status } : {}

    const total = await Order.countDocuments(query)
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('userId', 'name email')

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PUT /api/admin/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body

    const validStatuses = ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid order status' })
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    )
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' })

    const notification = await Notification.create({
      userId: order.userId,
      title: 'Order Update',
      message: `Your order #${order._id} status updated to: ${orderStatus}`,
      type: 'order',
      link: `/orders/${order._id}`
    })

    const io = getIO()
    io.to(order.userId.toString()).emit('notification', notification)
    io.to(order.userId.toString()).emit('orderUpdate', { orderId: order._id, orderStatus })

    res.status(200).json({ success: true, message: 'Order status updated', order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query

    const query = { role: 'user' }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const total = await User.countDocuments(query)
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      users
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/admin/returns
const getReturns = async (req, res) => {
  try {
    const returns = await Return.find()
      .populate('userId', 'name email')
      .populate('orderId')
      .sort({ createdAt: -1 })
    res.status(200).json({ success: true, returns })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PUT /api/admin/returns/:id
const updateReturn = async (req, res) => {
  try {
    const { status, adminNote } = req.body
    const returnReq = await Return.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    )
    res.status(200).json({ success: true, returnReq })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getDashboard, addProduct, updateProduct, deleteProduct,
  getAllOrders, updateOrderStatus, getAllUsers, getReturns, updateReturn
}