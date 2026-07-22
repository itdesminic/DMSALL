import express from 'express';
import { createUser, listUsers, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Only allow admin role to access user management endpoints
router.post('/', authenticate, authorize('admin'), createUser);
router.get('/', authenticate, authorize('admin'), listUsers);
router.put('/:id', authenticate, authorize('admin'), updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);

export default router;
