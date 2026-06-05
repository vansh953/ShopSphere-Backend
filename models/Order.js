const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, default: 1 }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  couponCode: {
    type: String,
    default: null
  },
  paymentId: {
    type: String,
    default: null
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'placed'
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
    latitude: Number,
    longitude: Number
  },
  deliveryLocation: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null }
  },
  isReviewed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)