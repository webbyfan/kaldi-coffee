import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getOrders,
  updateOrderToDelivered,
  verifyOrderPayment,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(addOrderItems).get(protect, admin, getOrders);
router.route('/:id').get(getOrderById);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);
router.route('/:id/verify-payment').put(protect, admin, verifyOrderPayment);

export default router;
