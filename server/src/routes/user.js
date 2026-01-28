import express from 'express';
import User from '../models/User.js';
import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import { verifyToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get user profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .populate({
        path: 'booksOwned',
        select: 'title author price',
      })
      .populate({
        path: 'booksSold',
        select: 'title author price',
      });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json(user.toJSON());
  } catch (error) {
    throw error;
  }
});

// Update user profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio, profilePicture } = req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();
    res.json(user.toJSON());
  } catch (error) {
    throw error;
  }
});

// Get wallet balance
router.get('/wallet', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.json({ walletBalance: user.walletBalance });
  } catch (error) {
    throw error;
  }
});

// Get purchase history
router.get('/purchases', verifyToken, async (req, res) => {
  try {
    const purchases = await Purchase.find({ buyer: req.userId })
      .populate('book', 'title author price')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json(purchases);
  } catch (error) {
    throw error;
  }
});

// Get sales history
router.get('/sales', verifyToken, async (req, res) => {
  try {
    const sales = await Purchase.find({ seller: req.userId })
      .populate('book', 'title author price')
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });

    res.json(sales);
  } catch (error) {
    throw error;
  }
});

// Check if user owns a book
router.get('/owns/:bookId', verifyToken, async (req, res) => {
  try {
    const purchase = await Purchase.findOne({
      buyer: req.userId,
      book: req.params.bookId,
      status: 'completed',
    });

    res.json({ owns: !!purchase });
  } catch (error) {
    throw error;
  }
});

// Get public user profile
router.get('/public/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name bio profilePicture createdAt');

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const booksCount = await Book.countDocuments({ seller: req.params.userId });

    res.json({
      ...user.toJSON(),
      booksCount,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
