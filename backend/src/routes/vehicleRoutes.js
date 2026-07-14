import express from 'express';
import { listVehicles, createVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Anyone logged in can read vehicles
router.get('/', authenticate, listVehicles);

// Only administrators can create, edit or delete vehicles
router.post('/', authenticate, createVehicle);
router.put('/:id', authenticate, updateVehicle);
router.delete('/:id', authenticate, deleteVehicle);

export default router;
