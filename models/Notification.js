const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['order', 'payment', 'offer', 'review', 'general'],
    default: 'general'
  },
  isRead: { type: Boolean, default: false },
  link: { type: String, default: null }
}, { timestamps: true })

module.exports = mongoose.model('Notification', notificationSchema)