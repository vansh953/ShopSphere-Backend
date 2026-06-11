const { body, validationResult } = require('express-validator')

const handleValidation = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() })
  }
  next()
}

const validateRegister = async (req, res, next) => {
  try {
    await Promise.all([
      body('name').trim().notEmpty().withMessage('Name is required').run(req),
      body('email').isEmail().withMessage('Valid email is required').run(req),
      body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters').run(req)
    ])
    handleValidation(req, res, next)
  } catch (err) {
    next(err)
  }
}

const validateLogin = async (req, res, next) => {
  try {
    await Promise.all([
      body('email').isEmail().withMessage('Valid email is required').run(req),
      body('password').notEmpty().withMessage('Password is required').run(req)
    ])
    handleValidation(req, res, next)
  } catch (err) {
    next(err)
  }
}

const validateReview = async (req, res, next) => {
  try {
    await Promise.all([
      body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5').run(req),
      body('comment').trim().notEmpty().withMessage('Comment is required').run(req)
    ])
    handleValidation(req, res, next)
  } catch (err) {
    next(err)
  }
}

module.exports = { validateRegister, validateLogin, validateReview, handleValidation }