import express from 'express';
import { listRooms, requestRoom } from '../controllers/meetingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/rooms', authenticate, listRooms);
router.post('/request', authenticate, requestRoom);

export default router;
