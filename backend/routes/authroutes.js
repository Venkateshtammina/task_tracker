const express = require('express');
const router = express.Router();
const { 
  signupUser, 
  loginUser, 
  forgotPassword, 
  verifyOTP, 
  resetPassword,
  updateUserProfile
} = require('../controllers/authcontroller');
const protect = require('../middleware/auth');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

console.log('Registering /signup');
router.post('/signup', signupUser);
console.log('Registering /login');
router.post('/login', loginUser);
console.log('Registering /forgot-password');
router.post('/forgot-password', forgotPassword);
console.log('Registering /verify-otp');
router.post('/verify-otp', verifyOTP);
console.log('Registering /reset-password');
router.post('/reset-password', resetPassword);
console.log('Registering /profile PUT');
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

console.log('Registering /activity-summary');
// Activity summary endpoint
router.get('/activity-summary', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const projectsCount = await Project.countDocuments({ user: userId }) || 0;
    const tasksCount = await Task.countDocuments({ user: userId }) || 0;
    const completedTasksCount = await Task.countDocuments({ user: userId, status: 'completed' }) || 0;
    console.log('Activity summary for user:', userId.toString(), { projectsCount, tasksCount, completedTasksCount });
    res.json({
      projectsCount,
      tasksCount,
      completedTasksCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch activity summary' });
  }
});

console.log('Registering /profile GET');
// Add user profile endpoint
router.get('/profile', protect, async (req, res) => {
  res.json(req.user);
});

// Request OTP for password change
router.post('/request-password-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Configure nodemailer transporter (reuse your existing config if available)
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

// Update password with OTP
router.put('/update-password', async (req, res) => {
  try {
    const { email, password, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Debug log
    console.log('DB OTP:', user.otp, 'User input OTP:', otp, 'Expiry:', user.otpExpiry, 'Now:', Date.now());

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
