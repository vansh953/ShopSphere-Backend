const Product = require('../models/Product')
const RecentView = require('../models/RecentView')
const Interaction = require('../models/Interaction')

// @GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query

    let query = { isActive: true }

    if (search) {
      query.$text = { $search: search }
    }

    if (category) query.category = category

    if (minPrice || maxPrice) {
      query.discounted_price = {}
      if (minPrice) query.discounted_price.$gte = Number(minPrice)
      if (maxPrice) query.discounted_price.$lte = Number(maxPrice)
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'price_asc') sortOption = { discounted_price: 1 }
    if (sort === 'price_desc') sortOption = { discounted_price: -1 }
    if (sort === 'rating') sortOption = { rating: -1 }

    const skip = (page - 1) * limit
    const total = await Product.countDocuments(query)
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit))

    res.status(200).json({ success: true, total, page: Number(page), pages: Math.ceil(total / limit), products })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    // Track recent view if user logged in
    if (req.user) {
      await trackRecentView(req.user._id, product._id)
      await trackInteraction(req.user._id, product._id, 'view', 1)
    }

    res.status(200).json({ success: true, product })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category')
    res.status(200).json({ success: true, categories })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// Helper: track recent view
const trackRecentView = async (userId, productId) => {
  let recentView = await RecentView.findOne({ userId })
  if (!recentView) {
    recentView = new RecentView({ userId, products: [] })
  }
  // Remove if already exists
  recentView.products = recentView.products.filter(
    p => p.productId.toString() !== productId.toString()
  )
  // Add to front
  recentView.products.unshift({ productId, viewedAt: new Date() })
  // Keep only last 10
  recentView.products = recentView.products.slice(0, 10)
  await recentView.save()
}

// Helper: track interaction for ML
const trackInteraction = async (userId, productId, action, score) => {
  await Interaction.create({ userId, productId, action, score })
}

// @GET /api/products/recent-views
const getRecentViews = async (req, res) => {
  try {
    const recentView = await RecentView.findOne({ userId: req.user._id })
      .populate('products.productId')
    res.status(200).json({ success: true, products: recentView ? recentView.products : [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getProducts, getProductById, getCategories, getRecentViews }