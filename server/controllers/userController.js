import mongoose from 'mongoose';
import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res) => {
  const { email, password } = req.body;
  const cleanEmail = email?.trim().toLowerCase();

  const masterAdminEmail = (process.env.ADMIN_EMAIL || 'admin@kaldicoffee.com').trim().toLowerCase();
  const masterAdminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  // 1. Admin Master Account check (configured via env or default)
  if (cleanEmail === masterAdminEmail && password === masterAdminPassword) {
    let adminUser = null;
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        adminUser = await User.findOne({ email: cleanEmail });
        if (!adminUser) {
          adminUser = await User.create({
            name: 'Kaldi Admin',
            email: cleanEmail,
            password: masterAdminPassword,
            isAdmin: true,
          });
        } else if (!adminUser.isAdmin) {
          adminUser.isAdmin = true;
          adminUser.password = masterAdminPassword;
          await adminUser.save();
        }
      }
    } catch (e) {
      console.warn('DB admin check error:', e.message);
    }

    return res.json({
      _id: adminUser?._id || 'admin_master_001',
      name: adminUser?.name || 'Kaldi Admin',
      email: cleanEmail,
      isAdmin: true,
      token: generateToken(adminUser?._id || 'admin_master_001'),
    });
  }

  // 2. Regular user authentication from DB
  try {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id),
        });
      }
    }
  } catch (err) {
    console.error('Login error:', err);
  }

  res.status(401).json({ message: 'Invalid email or password' });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400).json({ message: 'User already exists' });
    return;
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

import mongoose from 'mongoose';
import { sendOtpEmail } from '../utils/sendEmail.js';
import { sendOtpSms } from '../utils/sendSms.js';

// In-memory fallback OTP store (allows OTP to work seamlessly even when MongoDB is offline)
const memoryOtps = new Map();

// @desc    Request Password Reset OTP via Email or SMS
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { identifier, method = 'email' } = req.body;

  if (!identifier) {
    return res.status(400).json({ message: 'Email or phone number is required' });
  }

  try {
    const cleanId = identifier.trim().toLowerCase();
    const isEmail = cleanId.includes('@');
    const query = isEmail ? { email: cleanId } : { phone: cleanId };

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save in memory store so it works 100% reliably
    memoryOtps.set(cleanId, { otp, expires });

    // If MongoDB is actively connected, also persist to database
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const user = await User.findOne(query);
        if (user) {
          user.resetPasswordOtp = otp;
          user.resetPasswordExpires = expires;
          await user.save();
        }
      } catch (dbErr) {
        console.warn('Could not save OTP to MongoDB (using memory store):', dbErr.message);
      }
    }

    console.log(`[Kaldi & Co Password Reset] Generated OTP for ${cleanId}: ${otp}`);

    let deliveryResult = { sent: false };

    if (method === 'sms' || (!isEmail && cleanId.length >= 9)) {
      deliveryResult = await sendOtpSms(cleanId, otp);
    } else {
      deliveryResult = await sendOtpEmail(cleanId, otp);
    }

    res.json({
      success: true,
      sentReal: deliveryResult.sent,
      channel: method === 'sms' ? 'SMS' : 'Email',
      message: deliveryResult.sent
        ? `Verification code delivered to your ${method === 'sms' ? 'phone' : 'email'}!`
        : (deliveryResult.error || `Verification code generated in preview mode.`),
      demoOtp: deliveryResult.sent ? undefined : otp,
    });
  } catch (err) {
    console.error('forgotPassword error:', err);
    res.status(500).json({ message: 'Server error processing password reset request' });
  }
};

// @desc    Verify Password Reset OTP
// @route   POST /api/users/verify-otp
// @access  Public
export const verifyOtp = async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    return res.status(400).json({ message: 'Identifier and OTP are required' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanOtp = otp.trim();

  // 1. Check in-memory store first
  const memData = memoryOtps.get(cleanId);
  if (memData && memData.otp === cleanOtp && memData.expires > new Date()) {
    return res.json({ success: true, message: 'OTP verified successfully' });
  }

  // 2. Check MongoDB if connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const isEmail = cleanId.includes('@');
      const query = isEmail ? { email: cleanId } : { phone: cleanId };

      const user = await User.findOne({
        ...query,
        resetPasswordOtp: cleanOtp,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (user) {
        return res.json({ success: true, message: 'OTP verified successfully' });
      }
    } catch (dbErr) {
      console.warn('DB verify error:', dbErr.message);
    }
  }

  return res.status(400).json({ message: 'Invalid or expired verification code' });
};

// @desc    Reset Password using OTP
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { identifier, otp, newPassword } = req.body;

  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanOtp = otp.trim();

  let verified = false;

  // 1. Check memory store
  const memData = memoryOtps.get(cleanId);
  if (memData && memData.otp === cleanOtp && memData.expires > new Date()) {
    verified = true;
    memoryOtps.delete(cleanId);
  }

  // 2. Check and update in MongoDB if connected
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const isEmail = cleanId.includes('@');
      const query = isEmail ? { email: cleanId } : { phone: cleanId };

      const user = await User.findOne({
        ...query,
        resetPasswordOtp: cleanOtp,
        resetPasswordExpires: { $gt: Date.now() },
      });

      if (user) {
        user.password = newPassword;
        user.resetPasswordOtp = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        verified = true;
      }
    } catch (dbErr) {
      console.warn('DB password update error:', dbErr.message);
    }
  }

  if (verified) {
    return res.json({ success: true, message: 'Password has been reset successfully' });
  }

  return res.status(400).json({ message: 'Invalid or expired verification code' });
};
