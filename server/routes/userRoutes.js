import express from 'express';
import {
  authUser,
  registerUser,
  getUserProfile,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(registerUser);
router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

export default router;
