import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  avatar: String,
  plan: { type: String, enum: ['free', 'pro', 'premium'], default: 'free' },
  gamesCreated: { type: Number, default: 0 },
  preferences: {
    theme: { type: String, default: 'cosmic' },
    soundEnabled: { type: Boolean, default: true },
    particlesEnabled: { type: Boolean, default: true }
  },
  stats: {
    gamesOwned: { type: Number, default: 0 },
    friends: { type: Number, default: 0 },
    achievements: { type: Number, default: 0 },
    hoursPlayed: { type: Number, default: 0 }
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);