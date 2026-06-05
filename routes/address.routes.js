const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const Address = require('../models/Address')

router.use(protect)

// GET /api/address
router.get('/', async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1 })
    res.status(200).json({ success: true, addresses })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// POST /api/address
router.post('/', async (req, res) => {
  try {
    const { label, name, phone, address, city, pincode, latitude, longitude, isDefault } = req.body

    if (isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false })
    }

    const newAddress = await Address.create({
      userId: req.user._id,
      label, name, phone, address, city, pincode, latitude, longitude, isDefault
    })

    res.status(201).json({ success: true, message: 'Address added', address: newAddress })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/address/:id
router.put('/:id', async (req, res) => {
  try {
    if (req.body.isDefault) {
      await Address.updateMany({ userId: req.user._id }, { isDefault: false })
    }

    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' })

    res.status(200).json({ success: true, message: 'Address updated', address })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/address/:id
router.delete('/:id', async (req, res) => {
  try {
    await Address.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.status(200).json({ success: true, message: 'Address deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/address/:id/set-default
router.put('/:id/set-default', async (req, res) => {
  try {
    await Address.updateMany({ userId: req.user._id }, { isDefault: false })
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isDefault: true },
      { new: true }
    )
    res.status(200).json({ success: true, message: 'Default address updated', address })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router