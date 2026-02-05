import express from 'express';
import Book from '../models/Book.js';
import Purchase from '../models/Purchase.js';
import CopyrightClaim from '../models/CopyrightClaim.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Get all books with optional category filter
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, search } = req.query;
    let filter = { isAvailable: true };

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (search) {
      const searchTerms = search.split(' ').filter(term => term.length > 0);
      const searchRegex = searchTerms.map(term => new RegExp(term, 'i'));

      filter.$or = [
        { title: { $in: searchRegex } },
        { author: { $in: searchRegex } },
        { description: { $in: searchRegex } },
      ];
    }

    const books = await Book.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(books);
  } catch (error) {
    throw error;
  }
});

// Get book by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('seller', 'name email bio');

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    res.json(book);
  } catch (error) {
    throw error;
  }
});

// Create book (upload)
router.post('/', verifyToken, upload.fields([
  { name: 'pdfFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'copyrightProof', maxCount: 1 }
]), async (req, res) => {
  try {
    const { title, author, description, price, category, isbn, pages, isCopyrighted } = req.body;

    // Validation
    if (!title || !author || !description || !price || !category) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (price < 0) {
      throw new AppError('Price must be positive', 400);
    }

    const pdfFile = req.files['pdfFile'] ? `/uploads/books/${req.files['pdfFile'][0].filename}` : null;
    const coverImage = req.files['coverImage'] ? `/uploads/covers/${req.files['coverImage'][0].filename}` : null;
    const copyrightProof = req.files['copyrightProof'] ? `/uploads/proofs/${req.files['copyrightProof'][0].filename}` : null;

    const book = await Book.create({
      title,
      author,
      description,
      price,
      category,
      isbn,
      pages,
      coverImage,
      pdfFile,
      isCopyrighted: isCopyrighted === 'true' || isCopyrighted === true,
      copyrightProof,
      verificationStatus: isCopyrighted === 'true' || isCopyrighted === true ? 'pending' : 'verified', // If not copyrighted, maybe it doesn't need verification? Or all need?
      seller: req.userId,
    });

    res.status(201).json(book);
  } catch (error) {
    throw error;
  }
});

// Get seller's books
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const books = await Book.find({ seller: req.params.sellerId }).populate('seller', 'name email');
    res.json(books);
  } catch (error) {
    throw error;
  }
});

// Update book
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.seller.toString() !== req.userId) {
      throw new AppError('Not authorized to update this book', 403);
    }

    const { title, author, description, price, category, coverImage, isbn, pages } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (description) book.description = description;
    if (price !== undefined) book.price = price;
    if (category) book.category = category;
    if (coverImage) book.coverImage = coverImage;
    if (isbn) book.isbn = isbn;
    if (pages) book.pages = pages;

    await book.save();
    res.json(book);
  } catch (error) {
    throw error;
  }
});

// Delete book
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      throw new AppError('Book not found', 404);
    }

    if (book.seller.toString() !== req.userId) {
      throw new AppError('Not authorized to delete this book', 403);
    }

    await Book.deleteOne({ _id: req.params.id });
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    throw error;
  }
});

// Search books
router.get('/search/query', optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const searchTerms = q.split(' ').filter(term => term.length > 0);
    const searchRegex = searchTerms.map(term => new RegExp(term, 'i'));

    const books = await Book.find({
      $or: [
        { title: { $in: searchRegex } },
        { author: { $in: searchRegex } },
        { description: { $in: searchRegex } },
      ],
      isAvailable: true,
    })
      .populate('seller', 'name email')
      .limit(20);

    res.json(books);
  } catch (error) {
    throw error;
  }
});

// Add a review to a book
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const bookId = req.params.id;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Please provide a rating between 1 and 5', 400);
    }

    const book = await Book.findById(bookId);
    if (!book) {
      throw new AppError('Book not found', 404);
    }

    // Check if user has purchased the book
    const hasPurchased = await Purchase.findOne({
      buyer: req.userId,
      book: bookId,
      status: 'completed',
    });

    if (!hasPurchased && book.seller.toString() !== req.userId) {
      throw new AppError('You must purchase the book before reviewing it', 403);
    }

    // Check if user already reviewed
    const existingReview = book.reviews.find(
      (r) => r.userId.toString() === req.userId
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.createdAt = Date.now();
    } else {
      // Add new review
      book.reviews.push({
        userId: req.userId,
        rating,
        comment,
      });
    }

    // Calculate average rating
    const totalRating = book.reviews.reduce((acc, r) => acc + r.rating, 0);
    book.rating = totalRating / book.reviews.length;

    await book.save();

    res.status(201).json({
      message: 'Review added successfully',
      rating: book.rating,
      reviews: book.reviews,
    });
  } catch (error) {
    throw error;
  }
});

// Submit a copyright claim
router.post('/:id/copyright-claim', verifyToken, upload.single('proofDocument'), async (req, res) => {
  try {
    const { explanation } = req.body;
    const bookId = req.params.id;

    if (!explanation) {
      throw new AppError('Please provide an explanation', 400);
    }

    if (!req.file) {
      throw new AppError('Please upload a proof document', 400);
    }

    const proofDocument = `/uploads/proofs/${req.file.filename}`;

    const claim = await CopyrightClaim.create({
      book: bookId,
      claimer: req.userId,
      proofDocument,
      explanation,
    });

    res.status(201).json({
      message: 'Copyright claim submitted successfully. Admin will verify it.',
      claim,
    });
  } catch (error) {
    throw error;
  }
});

export default router;
