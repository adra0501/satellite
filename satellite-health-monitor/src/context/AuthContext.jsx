// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Load user data on first render
  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      
      // Check for token in localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found in localStorage');
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        return;
      }
      
      try {
        console.log('Fetching user data with token');
        const config = {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        };
        
        const response = await axios.get(`${apiUrl}/users/me`, config);
        console.log('User data fetched successfully:', response.data.username);
        
        setIsAuthenticated(true);
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Error loading user:', err.message);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setError('Session expired. Please log in again.');
      }
      
      setLoading(false);
    };
    
    loadUser();
  }, [apiUrl]);

  // Login user
  const login = async (username, password, mfaToken = null) => {
    setLoading(true);
    try {
      console.log('Attempting login for user:', username);
      const body = { username, password };
      if (mfaToken) {
        body.mfaToken = mfaToken;
      }
      
      const response = await axios.post(`${apiUrl}/users/login`, body);
      console.log('Login response:', response.data);
      
      // Check if MFA is required
      if (response.data.requiresMfa) {
        console.log('MFA required for user:', username);
        setLoading(false);
        return { requiresMfa: true, userId: response.data.userId };
      }
      
      // Login successful
      console.log('Login successful, storing token and user data');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      setUser(response.data.user);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Login failed');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      return { error: err.response?.data?.error || 'Login failed' };
    }
  };

  // Verify MFA
  const verifyMfa = async (userId, token) => {
    setLoading(true);
    try {
      console.log('Verifying MFA token for user ID:', userId);
      const response = await axios.post(`${apiUrl}/users/mfa/verify`, { userId, token });
      console.log('MFA verification successful');
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      setUser(response.data.user);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      console.error('MFA verification error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'MFA verification failed');
      setLoading(false);
      
      return { error: err.response?.data?.error || 'MFA verification failed' };
    }
  };

  // Register user
  const register = async (userData) => {
    setLoading(true);
    try {
      console.log('Registering new user:', userData.username);
      const response = await axios.post(`${apiUrl}/users/register`, userData);
      console.log('Registration successful');
      
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      setIsAuthenticated(true);
      setUser(response.data.user);
      setError(null);
      setLoading(false);
      
      return { success: true };
    } catch (err) {
      console.error('Registration error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Registration failed');
      setIsAuthenticated(false);
      setUser(null);
      setLoading(false);
      
      return { error: err.response?.data?.error || 'Registration failed' };
    }
  };

  // Logout user
  const logout = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Setup MFA
  const setupMfa = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Setting up MFA with token:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        console.error('No token found for MFA setup');
        setLoading(false);
        return { error: 'No authentication token found. Please log in again.' };
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      console.log('Sending MFA setup request');
      const response = await axios.post(`${apiUrl}/users/mfa/setup`, {}, config);
      console.log('MFA setup successful, received secret and QR code');
      
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('MFA setup error:', err.response?.data?.error || err.message);
      
      // Handle token expiration specifically
      if (err.response && err.response.status === 401) {
        console.log('Authentication token expired, clearing session');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        setError('Your session has expired. Please log in again.');
      } else {
        setError(err.response?.data?.error || 'Failed to set up MFA');
      }
      
      setLoading(false);
      return { error: err.response?.data?.error || 'Failed to set up MFA. Please try again.' };
    }
  };

  // Enable MFA
  const enableMfa = async (token) => {
    setLoading(true);
    try {
      const authToken = localStorage.getItem('token');
      console.log('Enabling MFA with token:', authToken ? 'Token exists' : 'No token found');
      
      if (!authToken) {
        console.error('No token found for enabling MFA');
        setLoading(false);
        return { error: 'No token found' };
      }
      
      const config = {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      };
      
      console.log('Sending MFA enable request with token:', token);
      await axios.post(`${apiUrl}/users/mfa/enable`, { token }, config);
      console.log('MFA successfully enabled');
      
      // Update user data
      console.log('Fetching updated user data');
      const userResponse = await axios.get(`${apiUrl}/users/me`, config);
      setUser(userResponse.data);
      console.log('User data updated with MFA enabled status');
      
      setLoading(false);
      return { success: true };
    } catch (err) {
      console.error('MFA enable error:', err.response?.data?.error || err.message);
      setError(err.response?.data?.error || 'Failed to enable MFA');
      setLoading(false);
      
      return { error: err.response?.data?.error || 'Failed to enable MFA' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        error,
        login,
        register,
        logout,
        verifyMfa,
        setupMfa,
        enableMfa
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;