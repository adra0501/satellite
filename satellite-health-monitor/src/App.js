// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import SatelliteHealthDashboard from './components/SatelliteHealthDashboard';
import Login from './components/authentication/Login';
import Register from './components/authentication/Register';
import MfaSetup from './components/authentication/MfaSetup';
import PrivateRoute from './components/routing/PrivateRoute';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mfa-setup" element={<MfaSetup />} /> {/* MFA setup now directly accessible */}
          
          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<SatelliteHealthDashboard />} />
          </Route>
          
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;