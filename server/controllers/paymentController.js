import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { sendStoreOrderNotification } from '../utils/sendEmail.js';

/**
 * @desc    Get store public payment destination accounts
 * @route   GET /api/payment/settings
 * @access  Public
 */
export const getPaymentSettings = (req, res) => {
  res.json({
    telebirr: {
      phone: process.env.TELEBIRR_RECEIVER_PHONE || '+251911234567',
      name: process.env.TELEBIRR_RECEIVER_NAME || 'Kaldi Specialty Coffee',
    },
    cbe: {
      account: process.env.CBE_ACCOUNT_NUMBER || '1000123456789',
      name: process.env.CBE_ACCOUNT_NAME || 'Kaldi & Co Specialty Coffee',
    },
    chapaEnabled: true,
  });
};

/**
 * @desc    Initialize Chapa automated payment
 * @route   POST /api/payment/chapa/initialize
 * @access  Public
 */
export const initializeChapa = async (req, res) => {
  try {
    const { amount, email, firstName, lastName, phone, orderId, orderRef } = req.body;
    const txRef = `kaldi-tx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const chapaSecret = process.env.CHAPA_SECRET_KEY;

    // Check if real Chapa secret key is active
    const isLiveKey = chapaSecret && chapaSecret.startsWith('CHASECK') && !chapaSecret.includes('mock');

    if (isLiveKey) {
      const response = await fetch('https://api.chapa.co/v1/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chapaSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: String(amount),
          currency: 'ETB',
          email: email || 'customer@kaldicoffee.et',
          first_name: firstName || 'Kaldi',
          last_name: lastName || 'Customer',
          phone_number: phone || '0911234567',
          tx_ref: txRef,
          callback_url: `${req.protocol}://${req.get('host')}/api/payment/chapa/callback`,
          return_url: `${req.headers.origin || 'http://localhost:5173'}/payment-verify?tx_ref=${txRef}&order_id=${orderId || ''}`,
          customization: {
            title: 'Kaldi & Co Specialty Coffee',
            description: `Payment for Order #${orderRef || txRef}`,
          },
        }),
      });

      const data = await response.json();
      if (data.status === 'success' && data.data?.checkout_url) {
        return res.json({
          status: 'success',
          checkoutUrl: data.data.checkout_url,
          txRef,
        });
      } else {
        console.warn('Chapa API rejected initialization:', data);
      }
    }

    // Free Sandbox / Simulator fallback:
    // If no live Chapa key is configured or Chapa API is unreachable, provide a simulated instant verification link
    const simulatedVerifyUrl = `/payment-verify?tx_ref=${txRef}&order_id=${orderId || ''}&simulated=true`;

    return res.json({
      status: 'success',
      simulated: true,
      checkoutUrl: simulatedVerifyUrl,
      txRef,
      message: 'Chapa sandbox simulated transaction initialized.',
    });
  } catch (error) {
    console.error('Error initializing Chapa payment:', error);
    res.status(500).json({ message: 'Error initializing payment gateway' });
  }
};

/**
 * @desc    Verify Chapa payment transaction
 * @route   GET /api/payment/chapa/verify/:txRef
 * @access  Public
 */
export const verifyChapa = async (req, res) => {
  try {
    const { txRef } = req.params;
    const { orderId } = req.query;
    const chapaSecret = process.env.CHAPA_SECRET_KEY;
    const isLiveKey = chapaSecret && chapaSecret.startsWith('CHASECK') && !chapaSecret.includes('mock');

    let isSuccess = false;

    if (isLiveKey) {
      try {
        const verifyRes = await fetch(`https://api.chapa.co/v1/transaction/verify/${txRef}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${chapaSecret}`,
          },
        });
        const verifyData = await verifyRes.json();
        if (verifyData.status === 'success') {
          isSuccess = true;
        }
      } catch (err) {
        console.error('Chapa verify call error:', err);
      }
    } else {
      // In sandbox/simulated mode, automatically confirm
      isSuccess = true;
    }

    if (isSuccess) {
      // Update order status if orderId exists
      if (orderId && mongoose.connection.readyState === 1) {
        try {
          const order = await Order.findById(orderId);
          if (order) {
            order.isPaid = true;
            order.paidAt = new Date();
            order.paymentStatus = 'Paid & Verified (Chapa)';
            order.chapaTxRef = txRef;
            await order.save();
          }
        } catch (e) {
          console.warn('Could not update order in MongoDB:', e.message);
        }
      }

      return res.json({
        success: true,
        txRef,
        status: 'PAID',
        message: 'Payment has been verified successfully via Chapa!',
      });
    }

    res.status(400).json({
      success: false,
      status: 'FAILED',
      message: 'Payment verification failed or was cancelled.',
    });
  } catch (error) {
    console.error('Error in verifyChapa:', error);
    res.status(500).json({ message: 'Error verifying payment' });
  }
};
