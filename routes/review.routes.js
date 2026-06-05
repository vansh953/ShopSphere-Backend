const express = require('express')
const router = express.Router()
const { createReview, getProductReviews } = require('../controllers/review.controller')
const { protect } = require('../middleware/auth.middleware')
const { validateReview } = require('../middleware/validate')

router.get('/:productId', getProductReviews) // Public
router.post('/', protect, validateReview, createReview) // Protected

module.exports = router