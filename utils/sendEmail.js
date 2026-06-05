const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })
    console.log(`Email sent to ${to}`)
  } catch (error) {
    console.error('Email error:', error.message)
    throw new Error('Email could not be sent')
  }
}

// Email templates
const otpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #4F46E5;">ShopSphere</h2>
    <p>Your OTP for verification is:</p>
    <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`

const orderConfirmTemplate = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #4F46E5;">Order Confirmed!</h2>
    <p>Thank you for your order. Here are your order details:</p>
    <p><strong>Order ID:</strong> ${order._id}</p>
    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
    <p><strong>Status:</strong> ${order.orderStatus}</p>
    <p>We will notify you when your order is shipped.</p>
    <p style="color: #999; font-size: 12px;">Team ShopSphere</p>
  </div>
`

const resetPasswordTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #4F46E5;">Reset Your Password</h2>
    <p>Your OTP to reset password is:</p>
    <h1 style="color: #4F46E5; letter-spacing: 8px;">${otp}</h1>
    <p>This OTP is valid for <strong>10 minutes</strong>.</p>
    <p style="color: #999; font-size: 12px;">If you didn't request this, please ignore this email.</p>
  </div>
`

module.exports = { sendEmail, otpTemplate, orderConfirmTemplate, resetPasswordTemplate }