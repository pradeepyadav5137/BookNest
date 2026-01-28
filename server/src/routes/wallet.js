import express from 'express';
import User from '../models/User.js';
import Withdrawal from '../models/Withdrawal.js';
import { verifyToken } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const router = express.Router();

// Get wallet balance
router.get('/balance', verifyToken, async (req, res) => {
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

// Create withdrawal request
router.post('/withdraw', verifyToken, async (req, res) => {
  try {
    const { amount, paymentMethod, bankAccount, upiId } = req.body;

    // Validation
    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    const user = await User.findById(req.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.walletBalance < amount) {
      throw new AppError('Insufficient wallet balance', 400);
    }

    if (paymentMethod === 'bank_transfer') {
      if (!bankAccount || !bankAccount.accountNumber || !bankAccount.ifscCode) {
        throw new AppError('Bank account details required', 400);
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        throw new AppError('UPI ID required', 400);
      }
    } else {
      throw new AppError('Invalid payment method', 400);
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: req.userId,
      amount,
      paymentMethod,
      bankAccount: paymentMethod === 'bank_transfer' ? bankAccount : undefined,
      upiId: paymentMethod === 'upi' ? upiId : undefined,
    });

    // Deduct from wallet (can be reversed if withdrawal fails)
    user.walletBalance -= amount;
    await user.save();

    res.status(201).json({
      message: 'Withdrawal request created',
      withdrawal,
    });
  } catch (error) {
    throw error;
  }
});

// Get withdrawal requests
router.get('/requests', verifyToken, async (req, res) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.userId }).sort({ createdAt: -1 });

    res.json(withdrawals);
  } catch (error) {
    throw error;
  }
});

// Get withdrawal details
router.get('/requests/:withdrawalId', verifyToken, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    if (withdrawal.user.toString() !== req.userId) {
      throw new AppError('Not authorized', 403);
    }

    res.json(withdrawal);
  } catch (error) {
    throw error;
  }
});

// Cancel withdrawal (only if pending)
router.post('/requests/:withdrawalId/cancel', verifyToken, async (req, res) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.withdrawalId);

    if (!withdrawal) {
      throw new AppError('Withdrawal not found', 404);
    }

    if (withdrawal.user.toString() !== req.userId) {
      throw new AppError('Not authorized', 403);
    }

    if (withdrawal.status !== 'pending') {
      throw new AppError('Cannot cancel non-pending withdrawal', 400);
    }

    // Refund wallet
    const user = await User.findById(req.userId);
    user.walletBalance += withdrawal.amount;
    await user.save();

    // Update withdrawal status
    withdrawal.status = 'cancelled';
    await withdrawal.save();

    res.json({
      message: 'Withdrawal cancelled successfully',
      withdrawal,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
