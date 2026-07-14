import express from 'express';
import { login, register } from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;
