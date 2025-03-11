const socketIo = require('socket.io');
let io;

const setupSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*', // 允许所有来源的跨域请求
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
};

const emitUpdate = (data) => {
  if (io) {
    io.emit('update', data);
  }
};

module.exports = { setupSocket, emitUpdate };