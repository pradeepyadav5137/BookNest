import express from 'express';
import Book from '../models/Book.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import CopyrightClaim from '../models/CopyrightClaim.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Middleware to protect all admin routes
router.use(verifyToken, isAdmin);

// Get all books for verification
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    throw error;
  }
});

// Verify/Reject a book
router.patch('/books/:id/verify', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'rejected', 'pending'].includes(status)) {
      throw new AppError('Invalid status', 400);
    }

    const book = await Book.findById(req.params.id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    book.verificationStatus = status;
    // If verified, make sure it's available. If rejected, maybe hide it.
    if (status === 'rejected') {
      book.isAvailable = false;
    } else if (status === 'verified') {
      book.isAvailable = true;
    }

    await book.save();
    res.json(book);
  } catch (error) {
    throw error;
  }
});

// Take down a book (manual override)
router.patch('/books/:id/takedown', async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const book = await Book.findById(req.params.id);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    book.isAvailable = isAvailable;
    await book.save();
    res.json(book);
  } catch (error) {
    throw error;
  }
});

// Get platform stats
router.get('/stats', async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalPurchases = await Purchase.countDocuments({ status: 'completed' });

    const adminUser = await User.findById(req.userId);

    const salesData = await Purchase.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
    ]);

    res.json({
      totalBooks,
      totalUsers,
      totalPurchases,
      totalRevenue: salesData[0]?.totalRevenue || 0,
      adminWalletBalance: adminUser.walletBalance
    });
  } catch (error) {
    throw error;
  }
});

// Get all copyright claims
router.get('/copyright-claims', async (req, res) => {
  try {
    const claims = await CopyrightClaim.find()
      .populate('book', 'title seller')
      .populate('claimer', 'name email')
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (error) {
    throw error;
  }
});

// Approve/Reject a copyright claim
router.patch('/copyright-claims/:id', async (req, res) => {
  try {
    const { status } = req.body;
    const claim = await CopyrightClaim.findById(req.params.id);
    if (!claim) {
      throw new AppError('Claim not found', 404);
    }

    claim.status = status;
    await claim.save();

    if (status === 'approved') {
      // Take down the book
      const book = await Book.findById(claim.book);
      if (book) {
        book.isAvailable = false;
        book.verificationStatus = 'rejected'; // Mark as rejected/copyright issue
        await book.save();
      }
    }

    res.json(claim);
  } catch (error) {
    throw error;
  }
});

export default router;
