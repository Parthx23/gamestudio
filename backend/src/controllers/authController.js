import { generateToken } from '../services/authService.js';

export const googleCallback = (req, res) => {
  const token = generateToken(req.user._id);
  res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
};

export const getProfile = (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatar: req.user.avatar,
      plan: req.user.plan,
      stats: req.user.stats,
      gamesCreated: req.user.gamesCreated,
      aiCredits: req.user.aiCredits
    }
  });
};