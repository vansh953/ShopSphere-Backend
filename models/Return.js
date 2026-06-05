const mongoose = require('mongoose')

const returnSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'rejected', 'completed'],
    default: 'requested'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  adminNote: {
    type: String,
    default: ''
  }
}, { timestamps: true })

module.exports = mongoose.model('Return', returnSchema)