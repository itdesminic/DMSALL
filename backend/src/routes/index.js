import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import areaRoutes from './areaRoutes.js';
import meetingRoutes from './meetingRoutes.js';
import radioRoutes from './radioRoutes.js';
import foodRoutes from './foodRoutes.js';
import formRoutes from './formRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import lodgingRoutes from './lodgingRoutes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/areas', areaRoutes);
router.use('/meetings', meetingRoutes);
router.use('/radios', radioRoutes);
router.use('/food', foodRoutes);
router.use('/forms', formRoutes);
router.use('/notifications', notificationRoutes);
router.use('/settings', settingsRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/lodging', lodgingRoutes);

export default router;
