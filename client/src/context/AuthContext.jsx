'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data);
      } catch (err) {
        // User not logged in
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (name, email, password, confirmPassword) => {
    try {
      setError(null);
      const response = await authAPI.register({
        name,
        email,
        password,
        confirmPassword,
      });
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authAPI.login(email, password);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data);
    } catch (err) {
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
