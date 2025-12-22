import { Server } from 'socket.io';
import GameRoom from '../models/GameRoom.js';

export const initializeSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: true,
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join-room', async (data) => {
      const { roomId, userId, userName } = data;
      
      try {
        const room = await GameRoom.findOne({ roomId }).populate('gameId players.userId');
        if (!room) return socket.emit('error', 'Room not found');

        socket.join(roomId);
        
        // Update player socket ID
        const playerIndex = room.players.findIndex(p => p.userId._id.toString() === userId);
        if (playerIndex !== -1) {
          room.players[playerIndex].socketId = socket.id;
          room.players[playerIndex].connected = true;
          await room.save();
        }

        // Store room info
        if (!rooms.has(roomId)) {
          rooms.set(roomId, { players: new Set(), gameState: {} });
        }
        rooms.get(roomId).players.add(socket.id);

        socket.to(roomId).emit('player-joined', { 
          userId, 
          socketId: socket.id, 
          userName,
          playerCount: rooms.get(roomId).players.size
        });
        
        socket.emit('room-joined', { 
          roomId, 
          players: room.players.filter(p => p.connected),
          gameState: rooms.get(roomId).gameState
        });
      } catch (error) {
        socket.emit('error', error.message);
      }
    });

    socket.on('player-move', (data) => {
      const { roomId, position, rotation, velocity } = data;
      socket.to(roomId).emit('player-moved', {
        socketId: socket.id,
        position,
        rotation,
        velocity,
        timestamp: Date.now()
      });
    });

    socket.on('game-action', (data) => {
      const { roomId, action, payload } = data;
      
      // Update game state
      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        if (action === 'score-update') {
          room.gameState[socket.id] = payload;
        }
      }
      
      socket.to(roomId).emit('game-action', {
        socketId: socket.id,
        action,
        payload,
        timestamp: Date.now()
      });
    });

    // Enhanced WebRTC signaling
    socket.on('offer', (data) => {
      const { roomId, offer, targetId } = data;
      if (targetId) {
        socket.to(targetId).emit('offer', {
          offer,
          from: socket.id
        });
      } else {
        socket.to(roomId).emit('offer', {
          offer,
          from: socket.id
        });
      }
    });

    socket.on('answer', (data) => {
      const { roomId, answer, targetId } = data;
      if (targetId) {
        socket.to(targetId).emit('answer', {
          answer,
          from: socket.id
        });
      } else {
        socket.to(roomId).emit('answer', {
          answer,
          from: socket.id
        });
      }
    });

    socket.on('ice-candidate', (data) => {
      const { roomId, candidate, targetId } = data;
      if (targetId) {
        socket.to(targetId).emit('ice-candidate', {
          candidate,
          from: socket.id
        });
      } else {
        socket.to(roomId).emit('ice-candidate', {
          candidate,
          from: socket.id
        });
      }
    });

    // Chat system
    socket.on('chat-message', (data) => {
      const { roomId, message, userName } = data;
      socket.to(roomId).emit('chat-message', {
        message,
        userName,
        socketId: socket.id,
        timestamp: Date.now()
      });
    });

    // Game events
    socket.on('game-start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('game-started', {
        startedBy: socket.id,
        timestamp: Date.now()
      });
    });

    socket.on('disconnect', async () => {
      console.log('User disconnected:', socket.id);
      
      // Clean up room data
      for (const [roomId, roomData] of rooms.entries()) {
        if (roomData.players.has(socket.id)) {
          roomData.players.delete(socket.id);
          socket.to(roomId).emit('player-left', {
            socketId: socket.id,
            playerCount: roomData.players.size
          });
          
          if (roomData.players.size === 0) {
            rooms.delete(roomId);
          }
        }
      }
      
      // Update database
      try {
        await GameRoom.updateMany(
          { 'players.socketId': socket.id },
          { $set: { 'players.$.connected': false } }
        );
      } catch (error) {
        console.error('Error updating player disconnect:', error);
      }
    });
  });

  return io;
};