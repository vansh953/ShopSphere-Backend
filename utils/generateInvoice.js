const PDFDocument = require('pdfkit')

const generateInvoice = (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 })
    const buffers = []

    doc.on('data', buffers.push.bind(buffers))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    // Header
    doc.fontSize(20).fillColor('#4F46E5').text('ShopSphere', 50, 50)
    doc.fontSize(10).fillColor('#999').text('Your one stop shop', 50, 75)

    // Invoice title
    doc.fontSize(16).fillColor('#000').text('INVOICE', 400, 50)
    doc.fontSize(10).fillColor('#555')
      .text(`Order ID: ${order._id}`, 400, 75)
      .text(`Date: ${new Date(order.createdAt).toDateString()}`, 400, 90)

    doc.moveTo(50, 110).lineTo(550, 110).stroke()

    // Shipping address
    doc.fontSize(12).fillColor('#000').text('Shipping To:', 50, 125)
    doc.fontSize(10).fillColor('#555')
      .text(order.shippingAddress.name, 50, 142)
      .text(order.shippingAddress.phone, 50, 157)
      .text(order.shippingAddress.address, 50, 172)

    // Products table header
    doc.moveTo(50, 200).lineTo(550, 200).stroke()
    doc.fontSize(10).fillColor('#000')
      .text('Product', 50, 210)
      .text('Qty', 350, 210)
      .text('Price', 420, 210)
      .text('Total', 490, 210)
    doc.moveTo(50, 225).lineTo(550, 225).stroke()

    // Products list
    let y = 235
    order.products.forEach((item) => {
      doc.fontSize(9).fillColor('#333')
        .text(item.name.substring(0, 40), 50, y)
        .text(item.quantity, 350, y)
        .text(`₹${item.price}`, 420, y)
        .text(`₹${item.price * item.quantity}`, 490, y)
      y += 20
    })

    doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke()

    // Total
    doc.fontSize(12).fillColor('#000')
      .text('Total Amount:', 380, y + 20)
      .text(`₹${order.totalAmount}`, 490, y + 20)

    if (order.discount > 0) {
      doc.fontSize(10).fillColor('green')
        .text(`Discount: -₹${order.discount}`, 380, y + 38)
    }

    // Footer
    doc.fontSize(9).fillColor('#999')
      .text('Thank you for shopping with ShopSphere!', 50, y + 70, { align: 'center' })

    doc.end()
  })
}

module.exports = generateInvoice