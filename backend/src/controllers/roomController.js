import GameRoom from '../models/GameRoom.js';
import { v4 as uuidv4 } from 'uuid';

export const createRoom = async (req, res) => {
  try {
    const { gameId, maxPlayers, isPrivate } = req.body;
    
    const roomId = uuidv4().substring(0, 8);
    
    const room = await GameRoom.create({
      roomId,
      gameId,
      host: req.user._id,
      maxPlayers: maxPlayers || 4,
      isPrivate: isPrivate || false,
      players: [{
        userId: req.user._id,
        score: 0,
        status: 'waiting'
      }]
    });

    await room.populate('gameId host players.userId');
    
    res.status(201).json({ room });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await GameRoom.findOne({ roomId });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.players.length >= room.maxPlayers) {
      return res.status(400).json({ error: 'Room is full' });
    }

    const isAlreadyInRoom = room.players.some(p => p.userId.toString() === req.user._id.toString());
    if (isAlreadyInRoom) {
      return res.status(400).json({ error: 'Already in room' });
    }

    room.players.push({
      userId: req.user._id,
      score: 0,
      status: 'waiting'
    });

    await room.save();
    await room.populate('gameId host players.userId');
    
    res.json({ room });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoomInfo = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    const room = await GameRoom.findOne({ roomId })
      .populate('gameId host players.userId');
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    res.json({ room });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};