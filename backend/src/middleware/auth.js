import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const checkPlanLimits = (limitType) => {
  return async (req, res, next) => {
    const user = req.user;
    
    // Demo user bypasses all limits
    if (user.email === 'demo@test.com') {
      return next();
    }
    
    const planLimits = {
      free: { maxGames: 5, aiCreditsPerMonth: 5 },
      pro: { maxGames: 50, aiCreditsPerMonth: 100 },
      premium: { maxGames: -1, aiCreditsPerMonth: 500 }
    };

    const limits = planLimits[user.plan];
    
    if (limitType === 'games' && limits.maxGames !== -1 && user.gamesCreated >= limits.maxGames) {
      return res.status(403).json({ error: 'Game creation limit reached' });
    }
    
    if (limitType === 'ai' && user.aiCredits <= 0) {
      return res.status(403).json({ error: 'AI credits exhausted' });
    }

    next();
  };
};