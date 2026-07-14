import express from 'express';
import { createUser, listUsers } from '../controllers/userController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, createUser);
router.get('/', authenticate, listUsers);

export default router;
