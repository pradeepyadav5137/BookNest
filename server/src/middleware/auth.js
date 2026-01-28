import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      throw new AppError('No token provided', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = (req, res, next) => {
  try {
    const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
    }
  } catch (error) {
    // Continue without auth
  }
  next();
};
