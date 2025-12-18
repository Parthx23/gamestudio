import mongoose from 'mongoose';

const gameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  config: {
    type: { type: String, enum: ['racing', 'platformer', 'puzzle', 'shooter', 'pong', 'snake', 'flappy'], required: true },
    maxPlayers: { type: Number, default: 4 },
    objects: mongoose.Schema.Types.Mixed,
    settings: mongoose.Schema.Types.Mixed
  },
  thumbnail: String,
  isPublic: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  playCount: { type: Number, default: 0 },
  tags: [String]
}, { timestamps: true });

export default mongoose.model('Game', gameSchema);