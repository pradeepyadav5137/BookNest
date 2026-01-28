'use client';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './pages.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await axios.post(
        `${API_URL}/auth/forgot-password`,
        { email },
        { withCredentials: true }
      );
      
      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Forgot Password</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && (
          <div className="success-message" style={{ 
            backgroundColor: '#d4edda', 
            color: '#155724', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '20px',
            border: '1px solid #c3e6cb'
          }}>
            {message}
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '20px' }}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="form-link" style={{ marginTop: '20px' }}>
          Remember your password? <Link to="/login">Login here</Link>
        </div>
      </div>
    </div>
  );
}
