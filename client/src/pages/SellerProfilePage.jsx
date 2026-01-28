'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { userAPI, booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './pages.css';

export default function SellerProfilePage() {
  const { userId } = useParams();
  const [seller, setSeller] = useState(null);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSellerInfo();
  }, [userId]);

  const loadSellerInfo = async () => {
    try {
      setLoading(true);
      const [sellerResponse, booksResponse] = await Promise.all([
        userAPI.getPublicProfile(userId),
        booksAPI.getSellerBooks(userId),
      ]);
      setSeller(sellerResponse.data);
      setBooks(booksResponse.data);
    } catch (err) {
      setError('Failed to load seller information');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
  if (error) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!seller) return <div className="container"><div className="empty-state">Seller not found</div></div>;

  return (
    <div className="page-container">
      <section className="container" style={{ paddingTop: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>👤</div>
          <h1 style={{ marginBottom: '10px' }}>{seller.name}</h1>
          <p style={{ color: '#888', marginBottom: '20px' }}>{seller.bio || 'Book seller on BookNest'}</p>
          {seller.booksCount && (
            <p style={{ color: '#00d4ff', fontWeight: '600' }}>📚 {seller.booksCount} books available</p>
          )}
        </div>

        <div>
          <h2 style={{ marginBottom: '20px' }}>Books by {seller.name}</h2>

          {books.length === 0 ? (
            <div className="empty-state">No books available from this seller</div>
          ) : (
            <div className="books-grid">
              {books.map((book) => (
                <BookCard key={book._id} book={book} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
