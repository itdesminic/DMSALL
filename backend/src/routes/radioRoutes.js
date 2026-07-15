import express from 'express';
import { listRadios, createRadio, updateRadio } from '../controllers/radioController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authenticate, listRadios);
router.post('/', createRadio);
router.put('/:id', authenticate, updateRadio);

export default router;
