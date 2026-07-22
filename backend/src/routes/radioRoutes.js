import express from 'express';
import { 
  listRadios, createRadio, updateRadio, deleteRadio, 
  bulkUpload, submitReport, listReports, updateReportStatus 
} from '../controllers/radioController.js';
import { authenticate, optionalAuthenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/reports', submitReport);

// Authenticated/Optional routes
router.get('/', optionalAuthenticate, listRadios);
router.post('/', authenticate, createRadio);
router.put('/:id', authenticate, updateRadio);
router.delete('/:id', authenticate, deleteRadio);
router.post('/bulk', authenticate, bulkUpload);

// Admin reports routes
router.get('/reports', authenticate, listReports);
router.patch('/reports/:id', authenticate, updateReportStatus);

export default router;
