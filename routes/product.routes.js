const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProductById,
  getCategories,
  getRecentViews
} = require('../controllers/product.controller')
const { protect } = require('../middleware/auth.middleware')

// Public routes
router.get('/', getProducts)
router.get('/categories', getCategories)

// Protected routes
router.get('/recent-views', protect, getRecentViews)

// Must be last — catches /:id
router.get('/:id', protect, getProductById)

module.exports = router