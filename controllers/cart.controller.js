const Cart = require('../models/Cart')
const Product = require('../models/Product')
const Interaction = require('../models/Interaction')

// @GET /api/cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
      .populate('products.productId')
    res.status(200).json({ success: true, cart: cart || { products: [] } })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @POST /api/cart/add
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    const product = await Product.findById(productId)
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' })

    let cart = await Cart.findOne({ userId: req.user._id })

    if (!cart) {
      cart = new Cart({ userId: req.user._id, products: [] })
    }

    const existingItem = cart.products.find(
      p => p.productId.toString() === productId
    )

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.products.push({ productId, quantity })
    }

    await cart.save()

    // Track interaction for ML
    await Interaction.create({ userId: req.user._id, productId, action: 'cart', score: 3 })

    res.status(200).json({ success: true, message: 'Added to cart', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @PUT /api/cart/update
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body

    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    const item = cart.products.find(p => p.productId.toString() === productId)
    if (!item) return res.status(404).json({ success: false, message: 'Item not in cart' })

    if (quantity <= 0) {
      cart.products = cart.products.filter(p => p.productId.toString() !== productId)
    } else {
      item.quantity = quantity
    }

    await cart.save()
    res.status(200).json({ success: true, message: 'Cart updated', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @DELETE /api/cart/remove/:productId
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id })
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' })

    cart.products = cart.products.filter(
      p => p.productId.toString() !== req.params.productId
    )

    await cart.save()
    res.status(200).json({ success: true, message: 'Item removed from cart', cart })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

// @DELETE /api/cart/clear
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { products: [] }
    )
    res.status(200).json({ success: true, message: 'Cart cleared' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart }