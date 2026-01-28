import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './BookCard.css';

export default function BookCard({ book }) {
  const navigate = useNavigate();

  // Format category for display
  const formatCategory = (category) => {
    if (!category) return 'General';
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get category class for styling
  const getCategoryClass = (category) => {
    if (!category) return '';
    return category.toLowerCase().replace(/\s+/g, '-');
  };

  // Handle buy button click
  const handleBuyClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/books/${book._id}`);
  };

  return (
    <div className="book-card">
      <Link to={`/books/${book._id}`} className="book-card-link">
        <div className="book-cover">
          {/* Category badge in corner */}
          <div className={`book-category ${getCategoryClass(book.category)}`}>
            {formatCategory(book.category)}
          </div>

          {/* Book cover image or placeholder */}
          {book.coverImage ? (
            <img src={book.coverImage} alt={book.title} />
          ) : (
            <div className="cover-placeholder">📚</div>
          )}
        </div>

        <div className="book-info">
          <div>
            <h3 className="book-title" title={book.title}>
              {book.title}
            </h3>
            <p className="book-author">{book.author}</p>
          </div>

          <div className="book-footer">
            <div className="book-price-section">
              <span className="book-price">₹{book.price}</span>
              <span className="book-rating">
                ⭐ 4.0
              </span>
            </div>
            
            <button 
              className="buy-now-btn" 
              onClick={handleBuyClick}
              aria-label={`Buy ${book.title}`}
            >
              Buy Now
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}