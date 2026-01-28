'use client';

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './pages.css';

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'fiction', label: 'Fiction' },
    { value: 'non-fiction', label: 'Non-Fiction' },
    { value: 'self-help', label: 'Self-Help' },
    { value: 'business', label: 'Business' },
    { value: 'history', label: 'History' },
    { value: 'science', label: 'Science' },
    { value: 'technology', label: 'Technology' },
  ];

  useEffect(() => {
    loadBooks();
  }, [selectedCategory]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const response = await booksAPI.getAll(category);
      setBooks(response.data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <section className="hero">
        <div className="hero-inner container">
          <div className="hero-content">
            <div className="hero-badge">Your Digital Library Marketplace</div>
            <h1>Discover, Buy &amp; Sell Books in One Place</h1>
            <p>
              Welcome to BookNest &mdash; where readers become sellers and knowledge
              becomes accessible. Browse thousands of books across multiple
              categories, or list your own collection for others to discover.
            </p>

            <div className="hero-actions">
              <Link to="/search" className="btn btn-primary">
                Browse Books →
              </Link>
              <Link to="/sell" className="btn btn-outline">
                Sell Your Books
              </Link>
            </div>

            <div className="hero-stats">
              <div className="hero-stat-card">
                <div className="hero-stat-icon">📘</div>
                <div className="hero-stat-value">10,000+</div>
                <div className="hero-stat-label">Books Available</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-icon">👥</div>
                <div className="hero-stat-value">5,000+</div>
                <div className="hero-stat-label">Active Readers</div>
              </div>
              <div className="hero-stat-card">
                <div className="hero-stat-icon">📈</div>
                <div className="hero-stat-value">98%</div>
                <div className="hero-stat-label">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="books-section container">
        <h2 className="section-title">Browse Our Collection</h2>

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat.value}
              className={`tab ${selectedCategory === cat.value ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading">Loading books...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <p>No books found in this category</p>
          </div>
        ) : (
          <div className="books-grid">
            {books.map((book) => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
