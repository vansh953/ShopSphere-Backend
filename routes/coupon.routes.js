const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const Coupon = require('../models/Coupon')

router.use(protect)

// POST /api/coupons/apply
router.post('/apply', async (req, res) => {
  try {
    const { code, orderAmount } = req.body

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true })
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid or expired coupon' })

    if (coupon.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Coupon has expired' })
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit reached' })
    }

    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ₹${coupon.minOrderAmount}`
      })
    }

    let discount = 0
    if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    } else {
      discount = coupon.discountValue
    }

    res.status(200).json({
      success: true,
      message: 'Coupon applied',
      discount: Math.round(discount),
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router