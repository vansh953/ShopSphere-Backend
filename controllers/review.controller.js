const Review = require('../models/Review')
const Product = require('../models/Product')
const Order = require('../models/Order')
const Interaction = require('../models/Interaction')

// @POST /api/reviews
const createReview = async (req, res) => {
  try {
    const { productId, orderId, rating, comment } = req.body

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required to submit a review' })
    }

    const order = await Order.findById(orderId)
    if (!order || order.orderStatus !== 'delivered') {
      return res.status(400).json({ success: false, message: 'You can only review delivered orders' })
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' })
    }

    const existing = await Review.findOne({ userId: req.user._id, productId })
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this product' })
    }

    const review = await Review.create({
      userId: req.user._id,
      productId,
      orderId,
      rating,
      comment
    })

    // Update product rating
    const reviews = await Review.find({ productId })
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
    await Product.findByIdAndUpdate(productId, {
      rating: avgRating.toFixed(1),
      numReviews: reviews.length
    })

    // Track interaction for ML
    await Interaction.create({ userId: req.user._id, productId, action: 'review', score: 5 })

    // Mark order as reviewed
    await Order.findByIdAndUpdate(orderId, { isReviewed: true })

    res.status(201).json({ success: true, message: 'Review submitted', review })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/reviews/:productId
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId })
      .populate('userId', 'name avatar')
      .sort({ createdAt: -1 })
    res.status(200).json({ success: true, reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createReview, getProductReviews }