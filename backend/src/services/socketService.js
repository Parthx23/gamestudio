import { Server } from 'socket.io';
import GameRoom from '../models/GameRoom.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (data) => {
      const { roomId, userId } = data;
      
      try {
        const room = await GameRoom.findOne({ roomId });
        if (!room) return socket.emit('error', 'Room not found');

        socket.join(roomId);
        
        // Update player socket ID
        const playerIndex = room.players.findIndex(p => p.userId.toString() === userId);
        if (playerIndex !== -1) {
          room.players[playerIndex].socketId = socket.id;
          await room.save();
        }

        socket.to(roomId).emit('player-joined', { userId, socketId: socket.id });
        socket.emit('room-joined', { roomId, players: room.players });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('player-move', (data) => {
      const { roomId, position, rotation } = data;
      socket.to(roomId).emit('player-moved', {
        socketId: socket.id,
        position,
        rotation
      });
    });

    socket.on('game-action', (data) => {
      const { roomId, action, payload } = data;
      socket.to(roomId).emit('game-action', {
        socketId: socket.id,
        action,
        payload
      });
    });

    // WebRTC signaling
    socket.on('offer', (data) => {
      socket.to(data.roomId).emit('offer', {
        offer: data.offer,
        from: socket.id
      });
    });

    socket.on('answer', (data) => {
      socket.to(data.roomId).emit('answer', {
        answer: data.answer,
        from: socket.id
      });
    });

    socket.on('ice-candidate', (data) => {
      socket.to(data.roomId).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};