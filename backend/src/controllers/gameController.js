import Game from '../models/Game.js';
import User from '../models/User.js';
import { generateGameConfig } from '../services/gameAI.js';

// Add request logging
const logRequest = (req, action) => {
  console.log(`[${new Date().toISOString()}] ${action}:`, {
    user: req.user?.email,
    body: req.body,
    params: req.params
  });
};

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
    console.log('User:', req.user?.email, 'Plan:', req.user?.plan, 'AI Credits:', req.user?.aiCredits);
    
    const { prompt } = req.body;
    
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({ error: 'Prompt is required and cannot be empty' });
    }
    
    if (prompt.length > 500) {
      return res.status(400).json({ error: 'Prompt too long (max 500 characters)' });
    }
    
    console.log('Generating config for prompt:', prompt);
    const config = await generateGameConfig(prompt);
    console.log('Generated config:', JSON.stringify(config, null, 2));
    
    // Validate the generated config
    if (!config || !config.title || !config.type) {
      throw new Error('Invalid game configuration generated');
    }
    
    const game = await Game.create({
      title: config.title,
      description: config.description || `AI-generated ${config.type} game: ${prompt.substring(0, 100)}`,
      creator: req.user._id,
      config,
      isPublic: false
    });
    
    console.log('Game created successfully:', game._id);

    // Update user stats
    await User.findByIdAndUpdate(req.user._id, { 
      $inc: { gamesCreated: 1, aiCredits: -1 }
    });
    
    console.log('User stats updated');
    
    res.status(201).json({ 
      game,
      message: 'Game generated successfully'
    });
  } catch (error) {
    console.error('AI generation error details:', {
      message: error.message,
      stack: error.stack,
      prompt: req.body?.prompt
    });
    
    // Return more specific error messages
    let errorMessage = 'Failed to generate game';
    if (error.message.includes('API key')) {
      errorMessage = 'AI service temporarily unavailable';
    } else if (error.message.includes('credits')) {
      errorMessage = 'Insufficient AI credits';
    } else if (error.message.includes('Invalid')) {
      errorMessage = 'Could not generate valid game from prompt';
    }
    
    res.status(400).json({ error: errorMessage });
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