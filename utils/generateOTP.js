const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const generateOTP = async () => {
  const otp = crypto.randomInt(100000, 999999).toString()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  const hashedOTP = await bcrypt.hash(otp, 10)
  return { otp, hashedOTP, expiresAt }
}

module.exports = generateOTP