import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  limits: {
    maxGames: { type: Number, required: true },
    aiCreditsPerMonth: { type: Number, required: true },
    maxPlayersPerRoom: { type: Number, required: true },
    storageGB: { type: Number, required: true }
  },
  features: [String],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('Plan', planSchema);