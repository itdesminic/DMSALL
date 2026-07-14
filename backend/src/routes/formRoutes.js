import express from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authMiddleware.js';
import { listForms, createForm, submitForm, listSubmissions, listVehicles } from '../controllers/formController.js';
const router = express.Router();

router.get('/', optionalAuthenticate, listForms);
router.get('/vehicles', optionalAuthenticate, listVehicles);
router.get('/submissions', authenticate, listSubmissions);
router.post('/', authenticate, createForm);
router.post('/submit', optionalAuthenticate, submitForm);

export default router;
