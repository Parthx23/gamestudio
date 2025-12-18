import mongoose from 'mongoose';
import Plan from '../models/Plan.js';
import dotenv from 'dotenv';

dotenv.config();

const plans = [
  {
    name: 'free',
    price: 0,
    limits: {
      maxGames: 5,
      aiCreditsPerMonth: 5,
      maxPlayersPerRoom: 4,
      storageGB: 1
    },
    features: [
      'Create up to 5 games',
      '5 AI generations per month',
      'Basic multiplayer (4 players)',
      '1GB storage'
    ]
  },
  {
    name: 'pro',
    price: 9.99,
    limits: {
      maxGames: 50,
      aiCreditsPerMonth: 100,
      maxPlayersPerRoom: 8,
      storageGB: 10
    },
    features: [
      'Create up to 50 games',
      '100 AI generations per month',
      'Enhanced multiplayer (8 players)',
      '10GB storage',
      'Priority support'
    ]
  },
  {
    name: 'premium',
    price: 19.99,
    limits: {
      maxGames: -1,
      aiCreditsPerMonth: 500,
      maxPlayersPerRoom: 16,
      storageGB: 100
    },
    features: [
      'Unlimited games',
      '500 AI generations per month',
      'Large multiplayer (16 players)',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Custom branding'
    ]
  }
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    await Plan.insertMany(plans);
    console.log('Seeded plans successfully');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding plans:', error);
    process.exit(1);
  }
}

seedPlans();