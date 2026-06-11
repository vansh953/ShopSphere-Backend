const express = require('express')
const router = express.Router()
const { protect } = require('../middleware/auth.middleware')
const Notification = require('../models/Notification')

router.use(protect)

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
    const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false })
    res.status(200).json({ success: true, notifications, unreadCount })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// FIX: mark-all-read MUST be before /:id/read — otherwise Express matches "mark-all-read" as an :id
router.put('/mark-all-read', async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true })
    res.status(200).json({ success: true, message: 'All notifications marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true }
    )
    res.status(200).json({ success: true, message: 'Marked as read' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// DELETE /api/notifications/:id
router.delete('/:id', async (req, res) => {
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.status(200).json({ success: true, message: 'Notification deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

module.exports = router