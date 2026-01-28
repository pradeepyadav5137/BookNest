'use client';

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksAPI } from '../services/api';
import './pages.css';

export default function SellPage() {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    category: 'fiction',
    isbn: '',
    pages: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.author || !formData.description || !formData.price || !formData.category) {
        throw new Error('Please fill all required fields');
      }

      await booksAPI.create({
        ...formData,
        price: parseFloat(formData.price),
        pages: formData.pages ? parseInt(formData.pages) : undefined,
      });

      alert('Book listed successfully!');
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to list book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="container">
        <div className="form-container">
          <h2 className="form-title">Sell Your Book on BookNest</h2>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="title">Book Title *</label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter book title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="author">Author *</label>
              <input
                id="author"
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                placeholder="Author name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="fiction">Fiction</option>
                <option value="non-fiction">Non-Fiction</option>
                <option value="self-help">Self-Help</option>
                <option value="business">Business</option>
                <option value="history">History</option>
                <option value="science">Science</option>
                <option value="technology">Technology</option>
                <option value="computer-science">Computer Science</option>
                <option value="biography">Biography</option>
                <option value="others">Others</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder="Describe the book (what's it about, condition, etc.)"
                rows="4"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="form-group">
                <label htmlFor="price">Price (₹) *</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="10"
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="pages">Number of Pages</label>
                <input
                  id="pages"
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  min="0"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="isbn">ISBN</label>
              <input
                id="isbn"
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="ISBN (optional)"
              />
            </div>

            <div style={{ background: '#1a3a3a', padding: '15px', borderRadius: '6px', marginBottom: '20px', borderLeft: '4px solid #00d4ff' }}>
              <p style={{ margin: 0, fontSize: '14px', color: '#ccc' }}>
                📝 <strong>Note:</strong> You'll need to upload the PDF file separately. Buyers will receive the PDF via email after payment.
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading}
            >
              {loading ? 'Listing Book...' : 'List Book'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
