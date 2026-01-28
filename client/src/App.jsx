import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import BookDetailPage from './pages/BookDetailPage';
import ProfilePage from './pages/ProfilePage';
import SellPage from './pages/SellPage';
import SearchPage from './pages/SearchPage';
import SellerProfilePage from './pages/SellerProfilePage';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
              <Route path="/books/:id" element={<BookDetailPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/seller/:userId" element={<SellerProfilePage />} />
        
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/sell"
                element={
                  <ProtectedRoute>
                    <SellPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;