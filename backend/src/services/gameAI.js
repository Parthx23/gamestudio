import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateGameConfig = async (prompt) => {
  console.log('Generating game config for:', prompt);
  
  // Validate API key first
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
    console.warn('Gemini API key not configured, using fallback');
    throw new Error('API key not configured');
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const aiPrompt = `Create a game config based on: "${prompt}"

Analyze the prompt and determine the best game type (racing, platformer, shooting, puzzle, snake, pong, flappy, etc.).
Create appropriate game objects and settings.

Return ONLY this JSON structure:
{
  "title": "Creative Game Name",
  "type": "detected_game_type",
  "maxPlayers": 1-4,
  "description": "Engaging description",
  "difficulty": "Easy/Medium/Hard",
  "theme": "modern/retro/fantasy/sci-fi",
  "objects": [
    {"type": "player", "name": "Player Name", "properties": {"speed": 5, "health": 100}},
    {"type": "enemy/obstacle/powerup/platform", "name": "Object Name", "properties": {"relevant": "properties"}}
  ],
  "settings": {"gravity": 9.8, "lighting": "bright", "environment": "arena", "music": "electronic"}
}

Must be valid JSON only.`;
    
    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    let text = response.text().replace(/```json|```/g, '').trim();
    
    // Clean up the response to ensure valid JSON
    text = text.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
    
    const config = JSON.parse(text);
    
    // Validate required fields
    if (!config.title || !config.type || !config.objects) {
      throw new Error('Invalid AI response structure');
    }
    
    console.log('AI Generated config:', config);
    return config;
  } catch (error) {
    console.error('AI generation failed, using fallback:', error);
    
    // Enhanced fallback logic for any custom prompt
    const lowerPrompt = prompt.toLowerCase();
    let gameType = "platformer";
    let title = "Custom Game";
    let objects = [];
    
    // Detect game type from prompt
    if (lowerPrompt.includes('race') || lowerPrompt.includes('car') || lowerPrompt.includes('speed')) {
      gameType = "racing";
      title = "Racing Adventure";
      objects = [
        { type: "player", name: "Player Car", properties: { speed: 8, health: 100 } },
        { type: "obstacle", name: "Barrier", properties: { damage: 20 } },
        { type: "powerup", name: "Speed Boost", properties: { speedBoost: 3 } }
      ];
    } else if (lowerPrompt.includes('snake')) {
      gameType = "snake";
      title = "Snake Master";
      objects = [
        { type: "player", name: "Snake", properties: { speed: 3, length: 3 } },
        { type: "powerup", name: "Food", properties: { points: 10 } }
      ];
    } else if (lowerPrompt.includes('pong') || lowerPrompt.includes('paddle')) {
      gameType = "pong";
      title = "Pong Champion";
      objects = [
        { type: "player", name: "Paddle", properties: { speed: 5 } },
        { type: "enemy", name: "Ball", properties: { speed: 4 } }
      ];
    } else if (lowerPrompt.includes('shoot') || lowerPrompt.includes('gun') || lowerPrompt.includes('bullet')) {
      gameType = "shooting";
      title = "Space Shooter";
      objects = [
        { type: "player", name: "Ship", properties: { speed: 5, health: 100 } },
        { type: "enemy", name: "Enemy Ship", properties: { health: 50, damage: 25 } },
        { type: "powerup", name: "Weapon Upgrade", properties: { damage: 50 } }
      ];
    } else if (lowerPrompt.includes('puzzle') || lowerPrompt.includes('match') || lowerPrompt.includes('solve')) {
      gameType = "puzzle";
      title = "Puzzle Quest";
      objects = [
        { type: "platform", name: "Puzzle Piece", properties: { color: "blue" } },
        { type: "powerup", name: "Hint", properties: { hints: 3 } }
      ];
    } else if (lowerPrompt.includes('flappy') || lowerPrompt.includes('bird') || lowerPrompt.includes('fly')) {
      gameType = "flappy";
      title = "Flappy Adventure";
      objects = [
        { type: "player", name: "Bird", properties: { speed: 3, jumpPower: 8 } },
        { type: "obstacle", name: "Pipe", properties: { damage: 100 } }
      ];
    } else if (lowerPrompt.includes('platform') || lowerPrompt.includes('jump') || lowerPrompt.includes('mario')) {
      gameType = "platformer";
      title = "Platform Adventure";
      objects = [
        { type: "player", name: "Hero", properties: { speed: 5, jumpPower: 10, health: 100 } },
        { type: "platform", name: "Ground", properties: { solid: true } },
        { type: "enemy", name: "Goomba", properties: { speed: 2, damage: 25 } },
        { type: "powerup", name: "Coin", properties: { points: 100 } }
      ];
    } else {
      // For any other custom prompt, create a generic platformer with custom elements
      title = prompt.split(' ').slice(0, 3).join(' ') || "Custom Game";
      objects = [
        { type: "player", name: "Player", properties: { speed: 5, health: 100 } },
        { type: "platform", name: "Platform", properties: { solid: true } },
        { type: "powerup", name: "Collectible", properties: { points: 50 } }
      ];
    }
    
    return {
      title,
      type: gameType,
      maxPlayers: gameType === "pong" ? 2 : 1,
      description: `${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}`,
      difficulty: "Medium",
      theme: "modern",
      objects,
      settings: {
        gravity: gameType === "flappy" ? 15 : gameType === "racing" ? 5 : 9.8,
        lighting: "bright",
        environment: gameType === "racing" ? "track" : "arena",
        music: "electronic"
      }
    };
  }
};