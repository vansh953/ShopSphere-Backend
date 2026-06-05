const Razorpay = require('razorpay')
const crypto = require('crypto')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

// @POST /api/payment/create-order
const createPaymentOrder = async (req, res) => {
  try {
    const { amount } = req.body

    const options = {
      amount: amount * 100, // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    }

    const order = await razorpay.orders.create(options)
    res.status(200).json({ success: true, order })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/payment/verify
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' })
    }

    res.status(200).json({ success: true, message: 'Payment verified', paymentId: razorpay_payment_id })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { createPaymentOrder, verifyPayment }