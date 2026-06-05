const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Price is required']
  },
  discounted_price: {
    type: Number,
    default: 0
  },
  category: {
    type: String,
    required: [true, 'Category is required']
  },
  brand: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  images: [{ type: String }],
  stock: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  numReviews: {
    type: Number,
    default: 0
  },
  tags: [{ type: String }],
  specifications: {
    type: Map,
    of: String,
    default: {}
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

// Text index for search
productSchema.index({ name: 'text', description: 'text', category: 'text', brand: 'text' })

module.exports = mongoose.model('Product', productSchema)