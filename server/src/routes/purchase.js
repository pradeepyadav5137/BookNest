import express from "express";
import Razorpay from "razorpay";
import crypto from "crypto";

import User from "../models/User.js";
import Book from "../models/Book.js";
import Purchase from "../models/Purchase.js";

import { verifyToken } from "../middleware/auth.js";
import { AppError } from "../middleware/errorHandler.js";
import { sendPdfEmail } from "../utils/email.js";

const router = express.Router();

/* ------------------------------------------------------------------
   Razorpay (LAZY INITIALIZATION – VERY IMPORTANT)
------------------------------------------------------------------- */

let razorpayInstance = null;

const getRazorpayInstance = () => {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay keys not loaded from environment");
    }

    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

/* ------------------------------------------------------------------
   CREATE RAZORPAY ORDER
------------------------------------------------------------------- */
router.post("/create-order", verifyToken, async (req, res) => {
  const { bookId } = req.body;

  const book = await Book.findById(bookId).populate("seller");
  if (!book) {
    throw new AppError("Book not found", 404);
  }

  // Buyer cannot be seller
  if (book.seller._id.toString() === req.userId) {
    throw new AppError("You cannot buy your own book", 400);
  }

  // Check if already purchased
  const existingPurchase = await Purchase.findOne({
    buyer: req.userId,
    book: bookId,
    status: "completed",
  });

  if (existingPurchase) {
    throw new AppError("You already own this book", 400);
  }

  const razorpay = getRazorpayInstance();

  // Generate a short receipt ID (max 40 chars for Razorpay)
  // Using timestamp + random string to keep it under 40 characters
  const shortReceipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const order = await razorpay.orders.create({
    amount: Math.round(book.price * 100), // rupees → paise
    currency: "INR",
    receipt: shortReceipt, // FIXED: Short receipt ID (under 40 chars)
    notes: {
      bookId,
      buyerId: req.userId,
      sellerId: book.seller._id.toString(),
    },
  });

  const purchase = await Purchase.create({
    buyer: req.userId,
    book: bookId,
    seller: book.seller._id,
    amount: book.price,
    paymentMethod: "razorpay",
    razorpayOrderId: order.id,
    status: "pending",
  });

  res.status(201).json({
    orderId: order.id,
    amount: book.price,
    purchaseId: purchase._id,
    book: {
      id: book._id,
      title: book.title,
      author: book.author,
    },
  });
});

/* ------------------------------------------------------------------
   VERIFY PAYMENT
------------------------------------------------------------------- */
router.post("/verify-payment", verifyToken, async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  const shasum = crypto.createHmac(
    "sha256",
    process.env.RAZORPAY_KEY_SECRET
  );

  shasum.update(`${razorpayOrderId}|${razorpayPaymentId}`);
  const digest = shasum.digest("hex");

  if (digest !== razorpaySignature) {
    throw new AppError("Invalid payment signature", 400);
  }

  const purchase = await Purchase.findOne({ razorpayOrderId })
    .populate("book")
    .populate("buyer")
    .populate("seller");

  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }

  purchase.razorpayPaymentId = razorpayPaymentId;
  purchase.razorpaySignature = razorpaySignature;
  purchase.status = "completed";
  purchase.pdfDelivered = false;
  await purchase.save();

  // Add book to buyer
  const buyer = await User.findById(purchase.buyer._id);
  if (!buyer.booksOwned.includes(purchase.book._id)) {
    buyer.booksOwned.push(purchase.book._id);
    await buyer.save();
  }

  // Credit seller wallet
  const seller = await User.findById(purchase.seller._id);
  if (!seller.booksSold.includes(purchase.book._id)) {
    seller.booksSold.push(purchase.book._id);
  }
  seller.walletBalance += purchase.amount;
  await seller.save();

  // Send PDF
  await sendPdfEmail(purchase);

  res.json({
    message: "Payment verified successfully",
    purchase: purchase.toObject(),
  });
});

/* ------------------------------------------------------------------
   BUY WITH WALLET
------------------------------------------------------------------- */
router.post("/buy-with-wallet", verifyToken, async (req, res) => {
  const { bookId } = req.body;

  const user = await User.findById(req.userId);
  const book = await Book.findById(bookId).populate("seller");

  if (!book) {
    throw new AppError("Book not found", 404);
  }

  if (book.seller._id.toString() === req.userId) {
    throw new AppError("You cannot buy your own book", 400);
  }

  if (user.walletBalance < book.price) {
    throw new AppError("Insufficient wallet balance", 400);
  }

  const purchase = await Purchase.create({
    buyer: req.userId,
    book: bookId,
    seller: book.seller._id,
    amount: book.price,
    paymentMethod: "wallet",
    status: "completed",
    pdfDelivered: false,
  });

  user.walletBalance -= book.price;
  if (!user.booksOwned.includes(bookId)) {
    user.booksOwned.push(bookId);
  }
  await user.save();

  const seller = await User.findById(book.seller._id);
  seller.walletBalance += book.price;
  if (!seller.booksSold.includes(bookId)) {
    seller.booksSold.push(bookId);
  }
  await seller.save();

  await sendPdfEmail(purchase);

  res.status(201).json({
    message: "Book purchased successfully",
    purchase: purchase.toObject(),
  });
});

/* ------------------------------------------------------------------
   RESEND PDF
------------------------------------------------------------------- */
router.post("/resend-pdf/:purchaseId", verifyToken, async (req, res) => {
  const purchase = await Purchase.findById(req.params.purchaseId)
    .populate("book")
    .populate("buyer")
    .populate("seller");

  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }

  if (purchase.buyer._id.toString() !== req.userId) {
    throw new AppError("Not authorized", 403);
  }

  if (purchase.status !== "completed") {
    throw new AppError("Purchase not completed", 400);
  }

  purchase.pdfDeliveryAttempts += 1;
  purchase.lastDeliveryAttempt = new Date();
  await purchase.save();

  await sendPdfEmail(purchase);

  res.json({ message: "PDF resent successfully" });
});

/* ------------------------------------------------------------------
   GET PURCHASE DETAILS
------------------------------------------------------------------- */
router.get("/:purchaseId", verifyToken, async (req, res) => {
  const purchase = await Purchase.findById(req.params.purchaseId)
    .populate("book")
    .populate("seller", "name email");

  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }

  if (
    purchase.buyer.toString() !== req.userId &&
    purchase.seller._id.toString() !== req.userId
  ) {
    throw new AppError("Not authorized", 403);
  }

  res.json(purchase);
});

export default router;