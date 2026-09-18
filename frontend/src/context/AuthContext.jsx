import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('banking_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data && res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user profile', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password });
    if (res.data && res.data.success) {
      const authData = res.data.data;
      localStorage.setItem('banking_token', authData.token);
      setToken(authData.token);
      await fetchCurrentUser();
      return authData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.data && res.data.success) {
      const authData = res.data.data;
      localStorage.setItem('banking_token', authData.token);
      setToken(authData.token);
      await fetchCurrentUser();
      return authData;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('banking_token');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser: fetchCurrentUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
