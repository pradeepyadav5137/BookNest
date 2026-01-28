import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { verifyToken } from '../middleware/auth.js';
import { sendPasswordResetEmail } from '../utils/email.js';

const router = express.Router();

const generateToken = (userId, email) => {
  return jwt.sign({ userId, email }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const setCookie = (res, token) => {
  res.cookie('authToken', token, {
    httpOnly: process.env.COOKIE_HTTP_ONLY === 'true',
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: process.env.COOKIE_SAME_SITE || 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validation
    if (!name || !email || !password) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    // Generate token
    const token = generateToken(user._id, user.email);
    setCookie(res, token);

    res.status(201).json({
      message: 'Registration successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    throw error;
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = generateToken(user._id, user.email);
    setCookie(res, token);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      token,
    });
  } catch (error) {
    throw error;
  }
});

// Get Profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate('booksOwned', 'title author price')
      .populate('booksSold', 'title author price');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user.toJSON());
  } catch (error) {
    throw error;
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logged out successfully' });
});

// Refresh token
router.post('/refresh', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const token = generateToken(user._id, user.email);
    setCookie(res, token);

    res.json({ token, user: user.toJSON() });
  } catch (error) {
    throw error;
  }
});

// Forgot Password - Send reset email
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Please provide your email', 400);
    }

    const user = await User.findOne({ email });
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Save hashed token to user
    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send email
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({ 
      message: 'If an account exists with this email, you will receive a password reset link.' 
    });
  } catch (error) {
    throw error;
  }
});

// Reset Password
router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      throw new AppError('Please provide password and confirmation', 400);
    }

    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Hash the token from URL
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Generate new auth token
    const authToken = generateToken(user._id, user.email);
    setCookie(res, authToken);

    res.json({
      message: 'Password reset successful',
      user: user.toJSON(),
      token: authToken,
    });
  } catch (error) {
    throw error;
  }
});

export default router;