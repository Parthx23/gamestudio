import express from 'express';
import { createRoom, joinRoom, getRoomInfo } from '../controllers/roomController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, createRoom);
router.post('/:roomId/join', authenticateToken, joinRoom);
router.get('/:roomId', getRoomInfo);

export default router;