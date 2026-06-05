const mongoose = require('mongoose')

const interactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: ['view', 'wishlist', 'cart', 'purchase', 'review'],
    required: true
  },
  score: {
    type: Number,
    default: 1
    // view=1, wishlist=2, cart=3, purchase=5, review=5
  }
}, { timestamps: true })

module.exports = mongoose.model('Interaction', interactionSchema)