const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  label: {
    type: String,
    enum: ['home', 'office', 'hostel', 'other'],
    default: 'home'
  },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: String, required: true },
  latitude: { type: Number, default: null },
  longitude: { type: Number, default: null },
  isDefault: { type: Boolean, default: false }
}, { timestamps: true })

module.exports = mongoose.model('Address', addressSchema)