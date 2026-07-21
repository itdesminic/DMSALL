import express from 'express';
import { authenticate } from '../middlewares/authMiddleware.js';
import {
  submitRequest,
  listRequests,
  updateRequestStatus,
  listLocations,
  createLocation,
  createRoom,
  deleteLocation,
  deleteRoom
} from '../controllers/lodgingController.js';

const router = express.Router();

// Public routes
router.post('/request', submitRequest);
router.get('/locations', listLocations);

// Admin / Authenticated routes
router.get('/requests', authenticate, listRequests);
router.patch('/requests/:id', authenticate, updateRequestStatus);
router.post('/locations', authenticate, createLocation);
router.delete('/locations/:id', authenticate, deleteLocation);
router.post('/rooms', authenticate, createRoom);
router.delete('/rooms/:id', authenticate, deleteRoom);

export default router;
