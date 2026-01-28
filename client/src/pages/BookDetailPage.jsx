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

  if (loading) return <div className="container"><div className="loading">Loading...</div></div>;
  if (error && !book) return <div className="container"><div className="error-message">{error}</div></div>;
  if (!book) return <div className="container"><div className="empty-state">Book not found</div></div>;

  const isOwnBook = isAuthenticated && user?._id === book.seller._id;

  return (
    <div className="page-container">
      <section className="book-detail container">
        <div className="book-detail-container">
          <div className="book-cover">
            {book.coverImage ? (
              <img src={book.coverImage || "/placeholder.svg"} alt={book.title} />
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
      </section>
    </div>
  );
}
