import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      console.log('User not found for token');
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = user;
    console.log('User authenticated:', user.email);
    next();
  } catch (error) {
    console.log('Token verification failed:', error.message);
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const checkPlanLimits = (limitType) => {
  return async (req, res, next) => {
    const user = req.user;
    
    console.log(`Checking ${limitType} limits for user:`, {
      email: user.email,
      plan: user.plan,
      gamesCreated: user.gamesCreated,
      aiCredits: user.aiCredits
    });
    
    // Demo user bypasses all limits
    if (user.email === 'demo@test.com') {
      console.log('Demo user - bypassing limits');
      return next();
    }
    
    const planLimits = {
      free: { maxGames: 5, aiCreditsPerMonth: 5 },
      pro: { maxGames: 50, aiCreditsPerMonth: 100 },
      premium: { maxGames: -1, aiCreditsPerMonth: 500 }
    };

    const limits = planLimits[user.plan] || planLimits.free;
    
    if (limitType === 'games' && limits.maxGames !== -1 && user.gamesCreated >= limits.maxGames) {
      console.log('Game creation limit reached');
      return res.status(403).json({ 
        error: `Game creation limit reached (${user.gamesCreated}/${limits.maxGames})` 
      });
    }
    
    if (limitType === 'ai' && user.aiCredits <= 0) {
      console.log('AI credits exhausted');
      return res.status(403).json({ 
        error: `AI credits exhausted (${user.aiCredits} remaining)` 
      });
    }

    console.log('Limits check passed');
    next();
  };
};