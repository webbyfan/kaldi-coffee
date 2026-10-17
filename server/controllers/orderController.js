import mongoose from 'mongoose';
import Order from '../models/Order.js';
import { sendOrderReceiptEmail, sendStoreOrderNotification } from '../utils/sendEmail.js';

// Fallback in-memory order cache when MongoDB is offline
const fallbackOrders = [];

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice,
    userEmail,
    transactionId,
    paymentStatus: initialStatus,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const customerEmail = userEmail || shippingAddress?.email || '';
  const orderRef = 'KL-' + Math.random().toString(36).substring(2, 8).toUpperCase();

  // Determine initial payment status
  let paymentStatus = initialStatus;
  let isPaid = false;
  if (!paymentStatus) {
    if (paymentMethod === 'cod') {
      paymentStatus = 'Cash on Delivery';
    } else if (paymentMethod === 'chapa' && initialStatus === 'Paid & Verified (Chapa)') {
      paymentStatus = 'Paid & Verified (Chapa)';
      isPaid = true;
    } else {
      paymentStatus = 'Pending Verification';
    }
  }

  let createdOrder = null;

  try {
    // Attempt saving to MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      const order = new Order({
        orderItems,
        shippingAddress: {
          ...shippingAddress,
          email: customerEmail,
        },
        userEmail: customerEmail,
        orderRef,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        paymentStatus,
        transactionId: transactionId || '',
        totalPrice: Number(totalPrice) || 0,
        isPaid,
        paidAt: isPaid ? new Date() : undefined,
      });

      createdOrder = await order.save();
    }
  } catch (dbError) {
    console.warn('[ORDER DB NOTICE] Could not save order to MongoDB:', dbError.message);
  }

  // If MongoDB was offline or failed to save, build response order
  if (!createdOrder) {
    createdOrder = {
      _id: 'db-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      orderRef,
      orderItems,
      shippingAddress: {
        ...shippingAddress,
        email: customerEmail,
      },
      userEmail: customerEmail,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      paymentStatus,
      transactionId: transactionId || '',
      totalPrice: Number(totalPrice) || 0,
      isPaid,
      paidAt: isPaid ? new Date().toISOString() : undefined,
      isDelivered: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    fallbackOrders.unshift(createdOrder);
  }

  // Asynchronously dispatch real emails
  // 1. Receipt to customer (if email provided)
  // 2. Alert to store owner / manager (STORE_EMAIL in server/.env)
  Promise.allSettled([
    sendOrderReceiptEmail({
      ...createdOrder.toObject ? createdOrder.toObject() : createdOrder,
      customerEmail,
      orderRef,
    }),
    sendStoreOrderNotification({
      ...createdOrder.toObject ? createdOrder.toObject() : createdOrder,
      customerEmail,
      orderRef,
      transactionId,
      paymentStatus,
    }),
  ]).then((results) => {
    results.forEach((r, idx) => {
      const target = idx === 0 ? 'Customer receipt' : 'Store alert';
      if (r.status === 'fulfilled' && r.value?.sent) {
        console.log(`[ORDER EMAIL OK] ${target} sent successfully.`);
      } else {
        console.log(`[ORDER EMAIL NOTICE] ${target}:`, r.value?.reason || r.reason || 'Pending/Logged');
      }
    });
  }).catch((err) => {
    console.error('[ORDER EMAIL ERROR]', err);
  });

  return res.status(201).json(createdOrder);
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
export const getOrderById = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) return res.json(order);
    }

    const fallback = fallbackOrders.find((o) => o._id === req.params.id || o.orderRef === req.params.id);
    if (fallback) return res.json(fallback);

    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const orders = await Order.find({}).sort({ createdAt: -1 });
      return res.json(orders);
    }
    return res.json(fallbackOrders);
  } catch (error) {
    return res.json(fallbackOrders);
  }
};

// @desc    Admin manually verifies customer payment received
// @route   PUT /api/orders/:id/verify-payment
// @access  Private/Admin
export const verifyOrderPayment = async (req, res) => {
  try {
    const verifiedBy = req.user?.email || 'Admin Manager';

    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isPaid = true;
        order.paymentStatus = 'Paid & Verified';
        order.paidAt = new Date();
        order.verifiedAt = new Date();
        order.verifiedBy = verifiedBy;
        const updated = await order.save();
        return res.json(updated);
      }
    }

    const fallback = fallbackOrders.find((o) => o._id === req.params.id || o.orderRef === req.params.id);
    if (fallback) {
      fallback.isPaid = true;
      fallback.paymentStatus = 'Paid & Verified';
      fallback.paidAt = new Date().toISOString();
      fallback.verifiedAt = new Date().toISOString();
      fallback.verifiedBy = verifiedBy;
      return res.json(fallback);
    }

    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Server Error verifying payment' });
  }
};

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findById(req.params.id);
      if (order) {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
        const updatedOrder = await order.save();
        return res.json(updatedOrder);
      }
    }

    const fallback = fallbackOrders.find((o) => o._id === req.params.id);
    if (fallback) {
      fallback.isDelivered = true;
      fallback.deliveredAt = new Date().toISOString();
      return res.json(fallback);
    }

    res.status(404).json({ message: 'Order not found' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
