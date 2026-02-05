import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'express-async-errors';
import dotenv from 'dotenv';
// dotenv.config();
dotenv.config({ path: './.env' });
console.log("ENV LOADED:", process.env.RAZORPAY_KEY_ID);



import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import { errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.js';
import booksRoutes from './routes/books.js';
import userRoutes from './routes/user.js';
import purchaseRoutes from './routes/purchase.js';
import walletRoutes from './routes/wallet.js';
import adminRoutes from './routes/admin.js';


const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

// Static files for uploads
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Connect to MongoDB
connectDB();

// Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/books', booksRoutes);
// API routes (primary)
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);

// 🔥 Compatibility routes (guaranteed fix)
// app.use('/auth', authRoutes);
// app.use('/books', booksRoutes);

app.use('/api/user', userRoutes);
app.use('/api/purchase', purchaseRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
