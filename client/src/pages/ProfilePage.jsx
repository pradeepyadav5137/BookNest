'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, walletAPI } from '../services/api';
import BookCard from '../components/BookCard';
import './pages.css';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('library');
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawData, setWithdrawData] = useState({
    amount: '',
    paymentMethod: 'upi',
    upiId: '',
  });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'library') {
        const response = await userAPI.getPurchases();
        setPurchases(response.data);
      } else if (activeTab === 'sales') {
        const response = await userAPI.getSales();
        setSales(response.data);
      } else if (activeTab === 'wallet') {
        const response = await walletAPI.getWithdrawals();
        setWithdrawals(response.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    try {
      await walletAPI.withdraw({
        amount: parseFloat(withdrawData.amount),
        paymentMethod: withdrawData.paymentMethod,
        upiId: withdrawData.paymentMethod === 'upi' ? withdrawData.upiId : undefined,
      });
      alert('Withdrawal request created successfully!');
      setShowWithdrawForm(false);
      setWithdrawData({ amount: '', paymentMethod: 'upi', upiId: '' });
      loadData();
    } catch (error) {
      alert(error.response?.data?.error || 'Withdrawal failed');
    }
  };

  return (
    <div className="page-container">
      <section className="container" style={{ paddingTop: '40px' }}>
        <div className="profile-container">
          <div className="profile-sidebar">
            <div className="profile-avatar">👤</div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '6px', textAlign: 'center' }}>
              <div style={{ fontSize: '12px', color: '#888', marginBottom: '8px' }}>Wallet Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#00d4ff' }}>
                ₹{user?.walletBalance?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div className="tabs">
              <div className="tab-buttons">
                <button
                  className={`tab-btn ${activeTab === 'library' ? 'active' : ''}`}
                  onClick={() => setActiveTab('library')}
                >
                  My Library
                </button>
                <button
                  className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`}
                  onClick={() => setActiveTab('sales')}
                >
                  My Sales
                </button>
                <button
                  className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
                  onClick={() => setActiveTab('wallet')}
                >
                  Wallet
                </button>
              </div>
            </div>

            {loading ? (
              <div className="loading">Loading...</div>
            ) : activeTab === 'library' ? (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Purchased Books</h3>
                {purchases.length === 0 ? (
                  <div className="empty-state">No books purchased yet</div>
                ) : (
                  <div className="books-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                    {purchases.map((purchase) => (
                      <BookCard key={purchase._id} book={purchase.book} />
                    ))}
                  </div>
                )}
              </div>
            ) : activeTab === 'sales' ? (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Books Sold</h3>
                {sales.length === 0 ? (
                  <div className="empty-state">No books sold yet</div>
                ) : (
                  <div>
                    {sales.map((sale) => (
                      <div key={sale._id} style={{ padding: '15px', background: '#2a2a2a', borderRadius: '6px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: '600' }}>{sale.book.title}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>by {sale.book.author}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: '#00d4ff', fontWeight: '600' }}>₹{sale.amount}</div>
                          <div style={{ fontSize: '12px', color: '#888' }}>{new Date(sale.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3>Wallet & Withdrawals</h3>
                  <button
                    className="btn btn-primary"
                    onClick={() => setShowWithdrawForm(!showWithdrawForm)}
                  >
                    {showWithdrawForm ? 'Cancel' : 'Withdraw Money'}
                  </button>
                </div>

                {showWithdrawForm && (
                  <form onSubmit={handleWithdraw} style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
                    <div className="form-group">
                      <label htmlFor="amount">Amount (₹)</label>
                      <input
                        id="amount"
                        type="number"
                        value={withdrawData.amount}
                        onChange={(e) => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                        required
                        min="100"
                        step="100"
                        max={user?.walletBalance}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="paymentMethod">Payment Method</label>
                      <select
                        id="paymentMethod"
                        value={withdrawData.paymentMethod}
                        onChange={(e) => setWithdrawData({ ...withdrawData, paymentMethod: e.target.value })}
                      >
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                      </select>
                    </div>

                    {withdrawData.paymentMethod === 'upi' && (
                      <div className="form-group">
                        <label htmlFor="upiId">UPI ID</label>
                        <input
                          id="upiId"
                          type="text"
                          value={withdrawData.upiId}
                          onChange={(e) => setWithdrawData({ ...withdrawData, upiId: e.target.value })}
                          required
                          placeholder="yourname@upi"
                        />
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                      Request Withdrawal
                    </button>
                  </form>
                )}

                <h4 style={{ marginBottom: '15px' }}>Withdrawal History</h4>
                {withdrawals.length === 0 ? (
                  <div className="empty-state">No withdrawals yet</div>
                ) : (
                  <div>
                    {withdrawals.map((withdrawal) => (
                      <div key={withdrawal._id} style={{ padding: '15px', background: '#2a2a2a', borderRadius: '6px', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: '600' }}>₹{withdrawal.amount}</div>
                            <div style={{ fontSize: '12px', color: '#888' }}>
                              {withdrawal.paymentMethod === 'upi' ? withdrawal.upiId : `Account ending in ${withdrawal.bankAccount?.accountNumber?.slice(-4)}`}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', color: withdrawal.status === 'completed' ? '#4caf50' : '#ff9800' }}>
                              {withdrawal.status.toUpperCase()}
                            </div>
                            <div style={{ fontSize: '12px', color: '#888' }}>{new Date(withdrawal.createdAt).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
