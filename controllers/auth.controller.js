const User = require('../models/User')
const generateToken = require('../utils/generateToken')
const generateOTP = require('../utils/generateOTP')
const { sendEmail, otpTemplate, resetPasswordTemplate } = require('../utils/sendEmail')

// @POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' })
    }

    const { otp, expiresAt } = generateOTP()

    const user = await User.create({
      name, email, password,
      otp: { code: otp, expiresAt },
      isVerified: false
    })

    await sendEmail({
      to: email,
      subject: 'Verify your ShopSphere account',
      html: otpTemplate(otp)
    })

    res.status(201).json({ success: true, message: 'OTP sent to your email', userId: user._id })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' })
    }

    user.isVerified = true
    user.otp = { code: null, expiresAt: null }
    await user.save()

    generateToken(res, user._id, user.role)

    res.status(200).json({ success: true, message: 'Account verified successfully', user: { _id: user._id, name: user.name, email: user.email, role: user.role } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email }).select('+password')
    if (!user) return res.status(400).json({ success: false, message: 'Invalid email or password' })

    if (!user.isVerified) return res.status(400).json({ success: false, message: 'Please verify your email first' })

    const isMatch = await user.comparePassword(password)
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid email or password' })

    generateToken(res, user._id, user.role)

    res.status(200).json({ success: true, message: 'Login successful', user: { _id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/auth/logout
const logout = async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) })
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

// @POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' })

    const { otp, expiresAt } = generateOTP()
    user.otp = { code: otp, expiresAt }
    await user.save()

    await sendEmail({
      to: email,
      subject: 'Reset your ShopSphere password',
      html: resetPasswordTemplate(otp)
    })

    res.status(200).json({ success: true, message: 'OTP sent to your email', userId: user._id })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { userId, otp, newPassword } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ success: false, message: 'User not found' })

    if (user.otp.code !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' })
    }

    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' })
    }

    user.password = newPassword
    user.otp = { code: null, expiresAt: null }
    await user.save()

    res.status(200).json({ success: true, message: 'Password reset successful' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PUT /api/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone },
      { new: true }
    )
    res.status(200).json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { register, verifyOTP, login, logout, forgotPassword, resetPassword, getMe, updateProfile }