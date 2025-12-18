import express from 'express';
import { createGame, generateAIGame, getUserGames, getGame, deleteGame } from '../controllers/gameController.js';
import { authenticateToken, checkPlanLimits } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, checkPlanLimits('games'), createGame);
router.post('/generate', authenticateToken, checkPlanLimits('ai'), generateAIGame);
router.get('/my-games', authenticateToken, getUserGames);
router.get('/:id', getGame);
router.delete('/:id', authenticateToken, deleteGame);

export default router;