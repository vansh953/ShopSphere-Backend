const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authorized, please login' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' })
    }

    // Verify token version — invalidates old tokens after logout
    if (user.tokenVersion !== decoded.tokenVersion) {
      return res.status(401).json({ success: false, message: 'Session expired, please login again' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

module.exports = { protect }