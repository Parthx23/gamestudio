import dotenv from 'dotenv';
import { generateGameConfig } from '../services/gameAI.js';

dotenv.config();

async function testAI() {
  console.log('Testing AI generation...');
  console.log('API Key configured:', !!process.env.GEMINI_API_KEY);
  
  try {
    const result = await generateGameConfig('Create a space adventure game with aliens and lasers');
    console.log('Success! Generated config:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAI();