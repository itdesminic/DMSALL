import express from 'express';
import { listAreas, createArea } from '../controllers/areaController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
const router = express.Router();

router.get('/', authenticate, listAreas);
router.post('/', authenticate, createArea);

export default router;
