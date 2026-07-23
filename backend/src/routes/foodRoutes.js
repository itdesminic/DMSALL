import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { listMenus, createMenu, confirmFood, submitFeedback } from '../controllers/foodController.js';

const router = express.Router();

router.get('/menus', authenticate, listMenus);
router.post('/menus', authenticate, createMenu);
router.post('/confirm', authenticate, confirmFood);
router.post('/feedback', authenticate, submitFeedback);

export default router;
