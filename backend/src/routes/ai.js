import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Sample game configurations for fallback
const sampleConfigs = {
  racing: {
    settings: { environment: "desert" },
    objects: [
      { id: "track1", type: "track", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 40, y: 1, z: 40 }, properties: { color: 6710886 } },
      { id: "car1", type: "car", position: { x: -10, y: 1, z: -10 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 2, y: 1, z: 4 }, properties: { color: 16711680 } },
      { id: "block1", type: "block", position: { x: 15, y: 2, z: 5 }, rotation: { x: 0, y: 0.5, z: 0 }, scale: { x: 3, y: 4, z: 3 }, properties: { color: 8421504 } },
      { id: "platform1", type: "platform", position: { x: -20, y: 3, z: 15 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 8, y: 1, z: 8 }, properties: { color: 65280 } }
    ]
  },
  space: {
    settings: { environment: "space" },
    objects: [
      { id: "platform1", type: "platform", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 30, y: 2, z: 30 }, properties: { color: 2105376 } },
      { id: "block1", type: "block", position: { x: -15, y: 3, z: -15 }, rotation: { x: 0, y: 0.3, z: 0 }, scale: { x: 4, y: 6, z: 4 }, properties: { color: 16776960 } },
      { id: "block2", type: "block", position: { x: 15, y: 4, z: 15 }, rotation: { x: 0, y: -0.3, z: 0 }, scale: { x: 3, y: 8, z: 3 }, properties: { color: 16711935 } },
      { id: "platform2", type: "platform", position: { x: 0, y: 8, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 12, y: 1, z: 12 }, properties: { color: 65535 } }
    ]
  },
  default: {
    settings: { environment: "forest" },
    objects: [
      { id: "ground", type: "track", position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 50, y: 1, z: 50 }, properties: { color: 3355443 } },
      { id: "platform1", type: "platform", position: { x: -20, y: 2, z: -20 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 6, y: 1, z: 6 }, properties: { color: 8421504 } },
      { id: "platform2", type: "platform", position: { x: 20, y: 4, z: 20 }, rotation: { x: 0, y: 0, z: 0 }, scale: { x: 8, y: 1, z: 8 }, properties: { color: 16711680 } },
      { id: "block1", type: "block", position: { x: 0, y: 6, z: 0 }, rotation: { x: 0, y: 0.7, z: 0 }, scale: { x: 4, y: 8, z: 4 }, properties: { color: 65280 } }
    ]
  }
};

router.post('/generate-game', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if we have a valid API key
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your-gemini-api-key') {
      console.log('Using fallback sample config for prompt:', prompt);
      
      // Generate based on prompt keywords
      let config;
      if (prompt.toLowerCase().includes('race') || prompt.toLowerCase().includes('car')) {
        config = sampleConfigs.racing;
      } else if (prompt.toLowerCase().includes('space') || prompt.toLowerCase().includes('alien')) {
        config = sampleConfigs.space;
      } else {
        config = sampleConfigs.default;
      }
      
      return res.json({ config });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const aiPrompt = `Generate a 3D game level configuration.
Return only valid JSON with this shape:
{ "settings": { "environment": "space" | "forest" | "desert" | "sky" }, "objects": [ { "id": string, "type": "car" | "track" | "block" | "platform", "position": { "x": number, "y": number, "z": number }, "rotation": { "x": number, "y": number, "z": number }, "scale": { "x": number, "y": number, "z": number }, "properties": { "color"?: number } } ] }.
Coordinates: x,z between -50 and 50, y between 0 and 20.
No text, comments, or markdown, just raw JSON for this user prompt: "${prompt}".`;

    const result = await model.generateContent(aiPrompt);
    const response = await result.response;
    const text = response.text();

    let config;
    try {
      // Clean the response text
      const cleanText = text.trim().replace(/```json\n?|```\n?/g, '');
      config = JSON.parse(cleanText);
    } catch (parseError) {
      // Try to extract JSON from response if it's wrapped in text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        config = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }

    res.json({ config });
  } catch (error) {
    console.error('AI generation error:', error.message || error);
    res.status(500).json({ 
      error: 'Failed to generate game',
      details: error.message || 'Unknown error'
    });
  }
});

export default router;