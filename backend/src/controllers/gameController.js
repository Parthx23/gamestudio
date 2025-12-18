import Game from '../models/Game.js';
import User from '../models/User.js';
import { generateGameConfig } from '../services/gameAI.js';

export const createGame = async (req, res) => {
  try {
    const { title, description, config, isPublic } = req.body;
    
    const game = await Game.create({
      title,
      description,
      creator: req.user._id,
      config,
      isPublic: isPublic || false
    });

    await User.findByIdAndUpdate(req.user._id, { $inc: { gamesCreated: 1 } });
    
    res.status(201).json({ game });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const generateAIGame = async (req, res) => {
  try {
    console.log('AI generation request:', req.body);
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    console.log('Generating config for prompt:', prompt);
    const config = await generateGameConfig(prompt);
    console.log('Generated config:', config);
    
    const game = await Game.create({
      title: config.title,
      description: `AI-generated game from prompt: "${prompt}"`,
      creator: req.user._id,
      config,
      isPublic: false
    });
    
    console.log('Game created:', game._id);

    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { gamesCreated: 1, aiCredits: -1 }
    });
    
    res.status(201).json({ game });
  } catch (error) {
    console.error('AI generation error:', error);
    res.status(400).json({ error: error.message });
  }
};

export const getUserGames = async (req, res) => {
  try {
    const games = await Game.find({ creator: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ games });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('creator', 'name avatar');
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json({ game });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteGame = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    if (game.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this game' });
    }
    
    await Game.findByIdAndDelete(req.params.id);
    await User.findByIdAndUpdate(req.user._id, { $inc: { gamesCreated: -1 } });
    
    res.json({ message: 'Game deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};