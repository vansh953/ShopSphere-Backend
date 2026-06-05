const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const Wishlist = require('../models/Wishlist')
const Interaction = require('../models/Interaction')

router.use(protect)

// GET /api/wishlist
router.get('/', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
      .populate('products')
    res.status(200).json({ success: true, wishlist: wishlist || { products: [] } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/wishlist/add
router.post('/add', async (req, res) => {
  try {
    const { productId } = req.body
    let wishlist = await Wishlist.findOne({ userId: req.user._id })

    if (!wishlist) {
      wishlist = new Wishlist({ userId: req.user._id, products: [] })
    }

    if (!wishlist.products.includes(productId)) {
      wishlist.products.push(productId)
      await wishlist.save()
      await Interaction.create({ userId: req.user._id, productId, action: 'wishlist', score: 2 })
    }

    res.status(200).json({ success: true, message: 'Added to wishlist', wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/wishlist/remove/:productId
router.delete('/remove/:productId', async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id })
    if (!wishlist) return res.status(404).json({ success: false, message: 'Wishlist not found' })

    wishlist.products = wishlist.products.filter(
      p => p.toString() !== req.params.productId
    )
    await wishlist.save()

    res.status(200).json({ success: true, message: 'Removed from wishlist', wishlist })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router