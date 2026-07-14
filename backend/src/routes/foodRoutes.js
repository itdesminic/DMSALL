import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { listMenus, createMenu, confirmFood } from '../controllers/foodController.js';

const router = express.Router();

router.get('/menus', authenticate, listMenus);
router.post('/menus', authenticate, createMenu);
router.post('/confirm', authenticate, confirmFood);

export default router;
