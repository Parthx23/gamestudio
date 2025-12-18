import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { generateToken } from '../services/authService.js';

const router = express.Router();

router.get('/google', (req, res) => {
  res.status(501).json({ error: 'Google OAuth not configured yet' });
});

router.get('/google/callback', (req, res) => {
  res.status(501).json({ error: 'Google OAuth not configured yet' });
});

// Demo login for testing
router.post('/demo-login', async (req, res) => {
  try {
    let user = await User.findOne({ email: 'demo@test.com' });
    if (!user) {
      user = await User.create({
        email: 'demo@test.com',
        name: 'Demo User',
        plan: 'premium',
        gamesCreated: 0,
        aiCredits: 999,
        stats: {
          gamesOwned: 25,
          friends: 42,
          achievements: 87,
          hoursPlayed: 156
        }
      });
    } else {
      user.plan = 'premium';
      user.aiCredits = 999;
      await user.save();
    }
    const token = generateToken(user._id);
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

export default router;