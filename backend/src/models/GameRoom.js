import mongoose from 'mongoose';

const gameRoomSchema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true },
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    socketId: String,
    position: { x: Number, y: Number, z: Number },
    score: { type: Number, default: 0 },
    status: { type: String, enum: ['waiting', 'playing', 'finished'], default: 'waiting' }
  }],
  gameState: {
    status: { type: String, enum: ['waiting', 'starting', 'playing', 'finished'], default: 'waiting' },
    startTime: Date,
    endTime: Date,
    currentRound: { type: Number, default: 1 },
    maxRounds: { type: Number, default: 3 }
  },
  maxPlayers: { type: Number, default: 4 },
  isPrivate: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('GameRoom', gameRoomSchema);