import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import './pages.css';

const AdminDashboard = () => {
  const [books, setBooks] = useState([]);
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, statsRes, claimsRes] = await Promise.all([
        adminAPI.getBooks(),
        adminAPI.getStats(),
        adminAPI.getCopyrightClaims(),
      ]);
      setBooks(booksRes.data);
      setStats(statsRes.data);
      setClaims(claimsRes.data);
    } catch (err) {
      setError('Failed to fetch admin data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await adminAPI.verifyBook(id, status);
      fetchData(); // Refresh
      alert(`Book ${status} successfully`);
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleUpdateClaim = async (id, status) => {
    try {
      await adminAPI.updateCopyrightClaim(id, status);
      fetchData();
      alert(`Claim ${status} successfully`);
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleTakedown = async (id, currentStatus) => {
    try {
      await adminAPI.takedownBook(id, !currentStatus);
      fetchData(); // Refresh
      alert(`Book ${!currentStatus ? 'restored' : 'taken down'} successfully`);
    } catch (err) {
      alert('Action failed');
    }
  };

  if (loading) return <div className="page-container"><div className="container">Loading...</div></div>;

  return (
    <div className="page-container">
      <div className="container">
        <h1 className="form-title">Admin Dashboard</h1>

        {error && <div className="error-message">{error}</div>}

        {stats && (
          <div className="hero-stats" style={{ marginBottom: '40px' }}>
            <div className="hero-stat-card">
              <div className="hero-stat-value">{stats.totalUsers}</div>
              <div className="hero-stat-label">Total Users</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value">{stats.totalBooks}</div>
              <div className="hero-stat-label">Total Books</div>
            </div>
            <div className="hero-stat-card">
              <div className="hero-stat-value">₹{stats.totalRevenue.toFixed(2)}</div>
              <div className="hero-stat-label">Total Revenue</div>
            </div>
            <div className="hero-stat-card" style={{ border: '2px solid #00d4ff' }}>
              <div className="hero-stat-value">₹{stats.adminWalletBalance.toFixed(2)}</div>
              <div className="hero-stat-label">Admin Wallet (Commission)</div>
            </div>
          </div>
        )}

        <section>
          <h2 className="section-title">Manage Books</h2>
          <div className="table-responsive" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Seller</th>
                  <th style={{ padding: '12px' }}>Copyrighted</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book._id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>{book.title}</td>
                    <td style={{ padding: '12px' }}>{book.seller?.name} ({book.seller?.email})</td>
                    <td style={{ padding: '12px' }}>
                      {book.isCopyrighted ? 'Yes' : 'No'}
                      {book.copyrightProof && (
                        <a
                          href={`http://localhost:5000${book.copyrightProof}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ marginLeft: '10px', color: '#00d4ff', fontSize: '12px' }}
                        >
                          View Proof
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${book.verificationStatus}`} style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: book.verificationStatus === 'verified' ? '#28a745' : book.verificationStatus === 'rejected' ? '#dc3545' : '#ffc107',
                        color: '#000'
                      }}>
                        {book.verificationStatus}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {book.verificationStatus === 'pending' && (
                          <>
                            <button onClick={() => handleVerify(book._id, 'verified')} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>Approve</button>
                            <button onClick={() => handleVerify(book._id, 'rejected')} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px', borderColor: '#dc3545', color: '#dc3545' }}>Reject</button>
                          </>
                        )}
                        <button onClick={() => handleTakedown(book._id, book.isAvailable)} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px' }}>
                          {book.isAvailable ? 'Take Down' : 'Restore'}
                        </button>
                        <a
                          href={`http://localhost:5000${book.pdfFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          View PDF
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: '60px' }}>
          <h2 className="section-title">Copyright Claims</h2>
          <div className="table-responsive" style={{ background: '#1a1a1a', padding: '20px', borderRadius: '8px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #333', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Book</th>
                  <th style={{ padding: '12px' }}>Claimer</th>
                  <th style={{ padding: '12px' }}>Explanation</th>
                  <th style={{ padding: '12px' }}>Status</th>
                  <th style={{ padding: '12px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '12px' }}>{claim.book?.title}</td>
                    <td style={{ padding: '12px' }}>{claim.claimer?.name} ({claim.claimer?.email})</td>
                    <td style={{ padding: '12px' }}>{claim.explanation}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={`badge ${claim.status}`} style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: claim.status === 'approved' ? '#28a745' : claim.status === 'rejected' ? '#dc3545' : '#ffc107',
                        color: '#000'
                      }}>
                        {claim.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {claim.status === 'pending' && (
                          <>
                            <button onClick={() => handleUpdateClaim(claim._id, 'approved')} className="btn btn-primary" style={{ padding: '5px 10px', fontSize: '12px' }}>Approve (Take Down Book)</button>
                            <button onClick={() => handleUpdateClaim(claim._id, 'rejected')} className="btn btn-outline" style={{ padding: '5px 10px', fontSize: '12px', borderColor: '#dc3545', color: '#dc3545' }}>Reject</button>
                          </>
                        )}
                        <a
                          href={`http://localhost:5000${claim.proofDocument}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline"
                          style={{ padding: '5px 10px', fontSize: '12px' }}
                        >
                          View Proof
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
