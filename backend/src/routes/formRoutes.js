import express from 'express';
import { authenticate, optionalAuthenticate } from '../middlewares/authMiddleware.js';
import { listForms, createForm, submitForm, listSubmissions, listVehicles, downloadPdf, listPublicChecklists, sendEmailWithPdf, listPublicCrimeaSubmissions } from '../controllers/formController.js';
const router = express.Router();

router.get('/', optionalAuthenticate, listForms);
router.get('/vehicles', optionalAuthenticate, listVehicles);
router.get('/public-submissions', listPublicChecklists);
router.get('/public-crimea', listPublicCrimeaSubmissions);
router.get('/submissions', authenticate, listSubmissions);
router.get('/pdf/:id', optionalAuthenticate, downloadPdf);
router.post('/share-email', optionalAuthenticate, sendEmailWithPdf);
router.post('/', authenticate, createForm);
router.post('/submit', optionalAuthenticate, submitForm);

export default router;
