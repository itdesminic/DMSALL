import express from 'express';
import { listRadios, createRadio } from '../controllers/radioController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, listRadios);
router.post('/', createRadio);

export default router;
