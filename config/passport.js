const passport = require('passport')
const { Strategy: GoogleStrategy } = require('passport-google-oauth20')
const User = require('../models/User')

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists with this googleId
        let user = await User.findOne({ googleId: profile.id })

        if (user) {
          return done(null, user)
        }

        // Check if user exists with same email (registered normally)
        user = await User.findOne({ email: profile.emails[0].value })

        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id
          if (!user.avatar) user.avatar = profile.photos[0]?.value || ''
          user.isVerified = true
          await user.save()
          return done(null, user)
        }

        // Create new user from Google profile
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          avatar: profile.photos[0]?.value || '',
          isVerified: true
        })

        return done(null, user)
      } catch (error) {
        return done(error, null)
      }
    }
  )
)

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    done(error, null)
  }
})

module.exports = passport