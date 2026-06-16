const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')
const http = require('http')
const passport = require('passport')
const connectDB = require('./config/db')
const { initSocket } = require('./utils/socket')

dotenv.config()
connectDB()
require('./config/passport')

const app = express()
const server = http.createServer(app)
initSocket(server)

app.use(helmet())
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api/auth',          require('./routes/auth.routes'))
app.use('/api/products',      require('./routes/product.routes'))
app.use('/api/cart',          require('./routes/cart.routes'))
app.use('/api/wishlist',      require('./routes/wishlist.routes'))
app.use('/api/orders',        require('./routes/order.routes'))
app.use('/api/payment',       require('./routes/payment.routes'))
app.use('/api/reviews',       require('./routes/review.routes'))
app.use('/api/address',       require('./routes/address.routes'))
app.use('/api/notifications', require('./routes/notification.routes'))
app.use('/api/coupons',       require('./routes/coupon.routes'))
app.use('/api/upload',        require('./routes/upload.routes'))
app.use('/api/admin',         require('./routes/admin.routes'))

app.get('/', (req, res) => res.send('ShopSphere API running'))

// Global error handler
app.use((err, req, res, next) => {
  console.error('GLOBAL ERROR:', err.stack)
  res.status(500).json({ success: false, message: err.message })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))