const express = require('express');
const router = express.Router();
const { 
  signupUser, 
  loginUser, 
  forgotPassword, 
  verifyOTP, 
  resetPassword
} = require('../controllers/authcontroller');
const protect = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Auth routes
router.post('/signup', signupUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);

// Profile routes
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: req.body.name },
      { new: true }
    );
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Activity summary
router.get('/activity-summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const projectsCount = await Project.countDocuments({ user: userId }) || 0;
    const tasksCount = await Task.countDocuments({ user: userId }) || 0;
    const completedTasksCount = await Task.countDocuments({ user: userId, status: 'completed' }) || 0;
    res.json({
      projectsCount,
      tasksCount,
      completedTasksCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity summary' });
  }
});

// User profile
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Password reset routes
router.post('/request-password-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: user.email,
      subject: 'Your OTP for Password Change',
      text: `Your OTP is: ${otp}`,
    });

    res.json({ message: 'OTP sent to your email' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/update-password', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.otp || !user.otpExpiry || String(user.otp) !== String(otp) || user.otpExpiry < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = await bcrypt.hash(password, 10);
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
