'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { booksAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './pages.css';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, [query]);

  const loadResults = async () => {
    try {
      setLoading(true);
      const response = query
        ? await booksAPI.search(query)
        : await booksAPI.getAll();
      setBooks(response.data);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <section className="books-section container">
        <h2 className="section-title">
          {query ? `Search Results for "${query}"` : 'All Books'}
        </h2>

        {loading ? (
          <div className="loading">Searching...</div>
        ) : books.length === 0 ? (
          <div className="empty-state">
            <p>No books found matching your search.</p>
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
