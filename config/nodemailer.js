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
  } catch (error) {
    console.error('Email send error:', error.message)
    throw error
  }
}

// OTP email template
const otpTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #e63946; text-align: center;">ShopSphere</h2>
    <h3 style="text-align: center;">Verify Your Account</h3>
    <p>Thank you for registering! Use the OTP below to verify your email address:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e63946; background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
        ${otp}
      </span>
    </div>
    <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">If you didn't create an account, please ignore this email.</p>
  </div>
`

// Reset password email template
const resetPasswordTemplate = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #e63946; text-align: center;">ShopSphere</h2>
    <h3 style="text-align: center;">Reset Your Password</h3>
    <p>We received a request to reset your password. Use the OTP below:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e63946; background: #f8f9fa; padding: 15px 30px; border-radius: 8px;">
        ${otp}
      </span>
    </div>
    <p style="color: #666;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">If you didn't request a password reset, please ignore this email.</p>
  </div>
`

// Order confirmation email template
const orderConfirmTemplate = (order) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
    <h2 style="color: #e63946; text-align: center;">ShopSphere</h2>
    <h3 style="text-align: center; color: #2d6a4f;">✅ Order Confirmed!</h3>
    <p>Hi there! Your order has been placed successfully.</p>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p><strong>Order ID:</strong> #${order._id}</p>
      <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
      <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
      <p><strong>Order Status:</strong> ${order.orderStatus}</p>
    </div>

    <h4>Items Ordered:</h4>
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #e63946; color: white;">
          <th style="padding: 10px; text-align: left;">Product</th>
          <th style="padding: 10px; text-align: center;">Qty</th>
          <th style="padding: 10px; text-align: right;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${order.products.map(p => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px;">${p.name}</td>
            <td style="padding: 10px; text-align: center;">${p.quantity}</td>
            <td style="padding: 10px; text-align: right;">₹${p.price}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="text-align: right; margin-top: 15px;">
      ${order.discount > 0 ? `<p>Discount: -₹${order.discount}</p>` : ''}
      <p><strong>Total: ₹${order.totalAmount}</strong></p>
    </div>

    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4>Shipping Address:</h4>
      <p>${order.shippingAddress.name} | ${order.shippingAddress.phone}</p>
      <p>${order.shippingAddress.address}, ${order.shippingAddress.city} - ${order.shippingAddress.pincode}</p>
    </div>

    <p style="color: #666;">You can track your order on the ShopSphere app.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
    <p style="color: #999; font-size: 12px; text-align: center;">Thank you for shopping with ShopSphere!</p>
  </div>
`

module.exports = { sendEmail, otpTemplate, resetPasswordTemplate, orderConfirmTemplate }