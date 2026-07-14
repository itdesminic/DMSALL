import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import { listSettings, updateSetting } from '../controllers/settingsController.js';
const router = express.Router();

router.get('/', authenticate, listSettings);
router.post('/', authenticate, updateSetting);

export default router;
