const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const upload = require('../middleware/upload')
const { uploadToCloudinary } = require('../config/cloudinary')

// POST /api/upload/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer)

    const User = require('../models/User')
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    )

    res.status(200).json({ success: true, avatar: result.secure_url, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/upload/product-image (admin only)
router.post('/product-image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' })

    const result = await uploadToCloudinary(req.file.buffer)
    res.status(200).json({ success: true, url: result.secure_url })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router