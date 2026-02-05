'use client';

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { booksAPI, userAPI, purchaseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './pages.css';

export default function BookDetailPage() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [owns, setOwns] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [resending, setResending] = useState(false);
  const { user, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadBook();
    if (isAuthenticated) {
      checkOwnership();
    }
  }, [id, isAuthenticated]);

  const loadBook = async () => {
    try {
      setLoading(true);
      const response = await booksAPI.getById(id);
      setBook(response.data);
    } catch (err) {
      setError('Failed to load book');
    } finally {
      setLoading(false);
    }
  };

  const checkOwnership = async () => {
    try {
      const response = await userAPI.ownsBook(id);
      setOwns(response.data.owns);
    } catch (err) {
      console.error('Ownership check failed:', err);
    }
  };

  const handleBuyWithWallet = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.walletBalance < book.price) {
      setError('Insufficient wallet balance. Please add funds.');
      return;
    }

    setPurchasing(true);
    try {
      await purchaseAPI.buyWithWallet(id);
      setError('');
      alert('Book purchased successfully! Check your email for the PDF.');
      await refreshUser();
      setOwns(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(false);
    }
  };

  const handleBuyWithRazorpay = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setPurchasing(true);
    try {
      const orderResponse = await purchaseAPI.createOrder(id);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount * 100,
        currency: 'INR',
        name: 'BookNest',
        description: `Purchase ${book.title}`,
        order_id: orderResponse.data.orderId,
        handler: async (response) => {
          try {
            await purchaseAPI.verifyPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setError('');
            alert('Book purchased successfully! Check your email for the PDF.');
            await refreshUser();
            setOwns(true);
            loadBook(); // Refresh book data for reviews
          } catch (err) {
            setError('Payment verification failed');
          }
        },
      };

      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const rzp = new window.Razorpay(options);
        rzp.open();
      };
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create payment order');
    } finally {
      setPurchasing(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await booksAPI.addReview(id, reviewData);
      alert('Review submitted successfully!');
      setReviewData({ rating: 5, comment: '' });
      loadBook();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      // Find the purchase ID for this book
      const response = await userAPI.getPurchases();
      const purchase = response.data.find(p => p.book._id === id && p.status === 'completed');
      if (purchase) {
        await purchaseAPI.resendPDF(purchase._id);
        alert('Email resent successfully!');
      } else {
        alert('Purchase not found');
      }
    } catch (err) {
      alert('Failed to resend email');
    } finally {
      setResending(false);
    }
  };

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
  if (error && !book) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!book) return <div className="container"><div className="empty-state">Book not found</div></div>;

  const isOwnBook = isAuthenticated && user?._id === book.seller._id;
  const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="page-container">
      <section className="book-detail container">
        <div className="book-detail-container">
          <div className="book-cover">
            {book.coverImage ? (
              <img
                src={book.coverImage.startsWith('http') ? book.coverImage : `${API_BASE_URL}${book.coverImage}`}
                alt={book.title}
              />
            ) : (
              <div style={{ fontSize: '80px' }}>📖</div>
            )}
          </div>

          <div className="book-info">
            <h1>{book.title}</h1>
            <p className="book-author">by {book.author}</p>
            <p className="book-price">₹{book.price}</p>

            {error && <div className="error-message">{error}</div>}

            {owns && (
              <div style={{ padding: '12px', background: '#4caf50', borderRadius: '6px', marginBottom: '20px', color: 'white' }}>
                ✓ You already own this book. Access it from your library.
              </div>
            )}

            {isOwnBook && (
              <div style={{ padding: '12px', background: '#ff9800', borderRadius: '6px', marginBottom: '20px', color: 'white' }}>
                This is your book listing
              </div>
            )}

            <div className="book-actions">
              {!owns && !isOwnBook && (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={handleBuyWithWallet}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : 'Buy with Wallet'}
                  </button>
                  <button
                    className="btn btn-primary"
                    onClick={handleBuyWithRazorpay}
                    disabled={purchasing}
                  >
                    {purchasing ? 'Processing...' : 'Buy with Razorpay'}
                  </button>
                </>
              )}
              {owns && (
                <button
                  className="btn btn-outline"
                  onClick={handleResendEmail}
                  disabled={resending}
                >
                  {resending ? 'Sending...' : '📧 Resend Book Email'}
                </button>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '20px' }}>
                ⭐ {book.rating ? book.rating.toFixed(1) : 'No rating yet'}
              </span>
              <span style={{ color: '#888', marginLeft: '10px' }}>
                ({book.reviews?.length || 0} reviews)
              </span>
            </div>

            <div className="book-description">
              <h3>About this book</h3>
              <p>{book.description}</p>
              {book.pages && <p><strong>Pages:</strong> {book.pages}</p>}
              {book.isbn && <p><strong>ISBN:</strong> {book.isbn}</p>}
            </div>

            <div className="seller-info">
              <h3>Seller Information</h3>
              <p><strong>Name:</strong> {book.seller.name}</p>
              <p><strong>Email:</strong> {book.seller.email}</p>
              <Link to={`/seller/${book.seller._id}`} className="btn btn-outline" style={{ marginTop: '10px', display: 'inline-block' }}>
                View More Books
              </Link>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '60px' }}>
          <h2>Customer Feedback</h2>

          {owns && (
            <div style={{ background: '#1a1a1a', padding: '30px', borderRadius: '12px', marginBottom: '40px', border: '1px solid #333' }}>
              <h3>Write a Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="form-group">
                  <label>Rating</label>
                  <select
                    value={reviewData.rating}
                    onChange={(e) => setReviewData({...reviewData, rating: parseInt(e.target.value)})}
                  >
                    <option value="5">5 - Excellent</option>
                    <option value="4">4 - Good</option>
                    <option value="3">3 - Average</option>
                    <option value="2">2 - Poor</option>
                    <option value="1">1 - Terrible</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Comment</label>
                  <textarea
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Share your thoughts about this book..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            </div>
          )}

          <div className="reviews-list">
            {book.reviews && book.reviews.length > 0 ? (
              book.reviews.map((review, index) => (
                <div key={index} style={{ padding: '20px', borderBottom: '1px solid #222' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ color: '#00d4ff', fontWeight: 'bold' }}>Rating: {review.rating} ⭐</span>
                    <span style={{ color: '#666', fontSize: '12px' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p style={{ color: '#ccc', lineHeight: '1.6' }}>{review.comment}</p>
                </div>
              ))
            ) : (
              <div className="empty-state">No reviews yet. Be the first to review!</div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
