import express from 'express';
import Book from '../models/Book.js';
import { verifyToken, optionalAuth } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

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
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
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
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, author, description, price, category, isbn, pages, coverImage, pdfFile } = req.body;

    // Validation
    if (!title || !author || !description || !price || !category) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (price < 0) {
      throw new AppError('Price must be positive', 400);
    }

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

    const books = await Book.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
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

export default router;
