import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { listNotifications, createNotification } from '../controllers/notificationController.js';
const router = express.Router();

router.get('/', authenticate, listNotifications);
router.post('/', authenticate, createNotification);

export default router;
