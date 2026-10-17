import express from 'express';
import { sendInquiryEmail } from '../utils/sendEmail.js';

const router = express.Router();

/**
 * @desc    Submit customer contact message
 * @route   POST /api/contact
 * @access  Public
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    const emailResult = await sendInquiryEmail({
      type: 'contact',
      name,
      email,
      phone,
      subject,
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Your message has been forwarded to our roastery team.',
      emailSent: emailResult.sent,
    });
  } catch (error) {
    console.error('Error handling contact form:', error);
    res.status(500).json({ message: 'Server error processing contact message' });
  }
});

/**
 * @desc    Submit wholesale partner application
 * @route   POST /api/wholesale
 * @access  Public
 */
router.post('/wholesale', async (req, res) => {
  try {
    const {
      businessName,
      contactName,
      email,
      phone,
      businessType,
      volumeKg,
      coffeeInterest,
      message,
    } = req.body;

    if (!contactName || !email) {
      return res.status(400).json({ message: 'Contact name and email are required.' });
    }

    const emailResult = await sendInquiryEmail({
      type: 'wholesale',
      name: contactName,
      email,
      phone,
      businessName,
      businessType,
      volumeKg,
      coffeeInterest,
      message,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you! Your wholesale application has been sent to our partnership team.',
      emailSent: emailResult.sent,
    });
  } catch (error) {
    console.error('Error handling wholesale form:', error);
    res.status(500).json({ message: 'Server error processing wholesale inquiry' });
  }
});

export default router;
