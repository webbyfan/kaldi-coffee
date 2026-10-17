import express from 'express';
import {
  getPaymentSettings,
  initializeChapa,
  verifyChapa,
} from '../controllers/paymentController.js';

const router = express.Router();

router.get('/settings', getPaymentSettings);
router.post('/chapa/initialize', initializeChapa);
router.get('/chapa/verify/:txRef', verifyChapa);

export default router;
