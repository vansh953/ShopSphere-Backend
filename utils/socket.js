const { Server } = require('socket.io')

let io

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        'http://localhost:3000',
        process.env.USER_FRONTEND_URL
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)

    socket.on('join', (userId) => {
      socket.join(userId)
      console.log(`User ${userId} joined their room`)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id)
    })
  })
}

const getIO = () => {
  if (!io) throw new Error('Socket not initialized')
  return io
}

module.exports = { initSocket, getIO }