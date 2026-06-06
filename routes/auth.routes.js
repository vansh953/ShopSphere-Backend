const express = require('express')
const router = express.Router()
const {
  register,
  verifyOTP,
  login,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile
} = require('../controllers/auth.controller')
const { protect } = require('../middleware/auth.middleware')
const { validateRegister, validateLogin } = require('../middleware/validate')
const { authLimiter } = require('../middleware/rateLimit')

// Public routes
router.post('/register', authLimiter, validateRegister, register)
router.post('/verify-otp', authLimiter, verifyOTP)
router.post('/login', authLimiter, validateLogin, login)
router.post('/logout', logout)
router.post('/forgot-password', authLimiter, forgotPassword)
router.post('/reset-password', authLimiter, resetPassword)

router.get('/google/callback',
  require('passport').authenticate('google', { 
    session: false,                                                    // ← add this
    failureRedirect: `${process.env.USER_FRONTEND_URL}/login` 
  }),
  (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.USER_FRONTEND_URL}/login`)
      }
      const generateToken = require('../utils/generateToken')
      generateToken(res, req.user._id, req.user.role)
      res.redirect(`${process.env.USER_FRONTEND_URL}/`)
    } catch (err) {
      console.error('Google callback error:', err)   // ← this will show in Render logs
      res.redirect(`${process.env.USER_FRONTEND_URL}/login`)
    }
  }
)

// Protected routes
router.get('/me', protect, getMe)
router.put('/update-profile', protect, updateProfile)

module.exports = router