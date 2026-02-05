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
    isCopyrighted: false,
  });
  const [files, setFiles] = useState({
    pdfFile: null,
    coverImage: null,
    copyrightProof: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFiles((prev) => ({ ...prev, [name]: files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.author || !formData.description || !formData.price || !formData.category) {
        throw new Error('Please fill all required fields');
      }

      if (!files.pdfFile) {
        throw new Error('Please upload the book PDF file');
      }

      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (files.pdfFile) data.append('pdfFile', files.pdfFile);
      if (files.coverImage) data.append('coverImage', files.coverImage);
      if (files.copyrightProof) data.append('copyrightProof', files.copyrightProof);

      await booksAPI.create(data);

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

            <div className="form-group">
              <label htmlFor="pdfFile">Book PDF *</label>
              <input
                id="pdfFile"
                type="file"
                name="pdfFile"
                accept=".pdf"
                onChange={handleFileChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">Cover Image</label>
              <input
                id="coverImage"
                type="file"
                name="coverImage"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <input
                id="isCopyrighted"
                type="checkbox"
                name="isCopyrighted"
                checked={formData.isCopyrighted}
                onChange={handleChange}
                style={{ width: 'auto' }}
              />
              <label htmlFor="isCopyrighted" style={{ marginBottom: 0 }}>This is a copyrighted book/notes</label>
            </div>

            {formData.isCopyrighted && (
              <div className="form-group">
                <label htmlFor="copyrightProof">Copyright Proof (PDF) *</label>
                <input
                  id="copyrightProof"
                  type="file"
                  name="copyrightProof"
                  accept=".pdf"
                  onChange={handleFileChange}
                  required={formData.isCopyrighted}
                />
                <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                  Please upload a document proving you own the rights to this work.
                </p>
              </div>
            )}

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
