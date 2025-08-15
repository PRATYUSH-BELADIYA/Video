// require('dotenv').config();
// const express = require('express');
// const http = require('http');
// const socketIO = require('socket.io');
// const path = require('path');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const authRoutes = require('./routes/authRoutes');

// const app = express();
// const server = http.createServer(app);
// const io = socketIO(server, {
//   cors: {
//     origin: 'http://localhost:5173', // React app URL
//     methods: ['GET', 'POST'],
//     credentials: true
//   }
// });

// app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // Use Auth Routes
// app.use('/api/auth', authRoutes);
// const usersInRoom = {}
// // WebRTC logic here (same as before)...
// io.on('connection', (socket) => {
//   console.log('User connected:', socket.id);

//   socket.on('join', (roomId) => {
//     const room = io.sockets.adapter.rooms.get(roomId);
//     const numClients = room ? room.size : 0;

//     if (numClients >= 2) {
//       socket.emit('room-full');
//       return;
//     }

//     socket.join(roomId);
//     console.log(`User ${socket.id} joined room ${roomId}`);

//     const otherUser = [...(room || [])].find(id => id !== socket.id);
//     if (otherUser) {
//       socket.emit('other-user', otherUser);
//       socket.to(otherUser).emit('user-joined', socket.id);
//     }
//   });

//   socket.on('chat-message', ({ room, message, sender }) => {
//     socket.to(room).emit('chat-message', { message, sender });
//   });

//   socket.on('offer', (payload) => {
//     io.to(payload.target).emit('offer', payload);
//   });

//   socket.on('answer', (payload) => {
//     io.to(payload.target).emit('answer', payload);
//   });

//   socket.on('ice-candidate', (incoming) => {
//     io.to(incoming.target).emit('ice-candidate', incoming.candidate);
//   });
// });

// server.listen(2000, () => {
//   console.log('Server running at http://localhost:2000');
// });

require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

// Auth routes
app.use('/api/auth', authRoutes);

// Store { roomId: { socketId: name } }
const usersInRoom = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // When user joins a room with a name
  socket.on('join', ({ roomId, name }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const numClients = room ? room.size : 0;

    if (numClients >= 2) {
      socket.emit('room-full');
      return;
    }

    socket.join(roomId);

    // Save name
    if (!usersInRoom[roomId]) usersInRoom[roomId] = {};
    usersInRoom[roomId][socket.id] = name || 'Anonymous';

    console.log(`User ${socket.id} (${name}) joined room ${roomId}`);

    const otherUser = [...(room || [])].find(id => id !== socket.id);
    if (otherUser) {
      socket.emit('other-user', { userId: otherUser, name: usersInRoom[roomId][otherUser] });
      socket.to(otherUser).emit('user-joined', { userId: socket.id, name });
    }

    // Send all users to new user
    io.to(socket.id).emit('users-list', usersInRoom[roomId]);
  });

  // Chat messages now include name
  socket.on('chat-message', ({ room, message }) => {
    let name = 'Anonymous';
    for (const r in usersInRoom) {
      if (usersInRoom[r][socket.id]) {
        name = usersInRoom[r][socket.id];
        break;
      }
    }
    io.to(room).emit('chat-message', { message, sender: socket.id, name });
  });

  // WebRTC signaling
  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', payload);
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', payload);
  });

  socket.on('ice-candidate', (incoming) => {
    io.to(incoming.target).emit('ice-candidate', incoming.candidate);
  });

  // Handle user leaving
  socket.on('leave-room', (roomId) => {
    if (usersInRoom[roomId] && usersInRoom[roomId][socket.id]) {
      const name = usersInRoom[roomId][socket.id];
      delete usersInRoom[roomId][socket.id];
      socket.leave(roomId);
      socket.to(roomId).emit('user-left', { userId: socket.id, name });
    }
  });

  socket.on('disconnect', () => {
    for (const roomId in usersInRoom) {
      if (usersInRoom[roomId][socket.id]) {
        const name = usersInRoom[roomId][socket.id];
        delete usersInRoom[roomId][socket.id];
        socket.to(roomId).emit('user-left', { userId: socket.id, name });
        if (Object.keys(usersInRoom[roomId]).length === 0) {
          delete usersInRoom[roomId];
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

server.listen(2000, () => {
  console.log('Server running at http://localhost:2000');
});
