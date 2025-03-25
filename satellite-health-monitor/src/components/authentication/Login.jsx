// src/components/authentication/Login.jsx
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [userId, setUserId] = useState(null);
  const [mfaToken, setMfaToken] = useState('');
  
  const navigate = useNavigate();
  const { login, verifyMfa } = useContext(AuthContext);

  const { username, password } = formData;

  const onChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onMfaChange = e => {
    setMfaToken(e.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting login form for user:', username);
      const result = await login(username, password);
      
      // If MFA is required
      if (result.requiresMfa) {
        console.log('MFA required, showing MFA input');
        setRequiresMfa(true);
        setUserId(result.userId);
        setLoading(false);
        return;
      }

      if (result.error) {
        console.error('Login error:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }

      // Login successful
      console.log('Login successful, redirecting to dashboard');
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('Login exception:', err);
      setError('Login failed. Please try again.');
      setLoading(false);
    }
  };

  const onSubmitMfa = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting MFA verification for user ID:', userId);
      const result = await verifyMfa(userId, mfaToken);
      
      if (result.error) {
        console.error('MFA verification error:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }

      // MFA verification successful
      console.log('MFA verification successful, redirecting to dashboard');
      setLoading(false);
      navigate('/dashboard');
    } catch (err) {
      console.error('MFA verification exception:', err);
      setError('MFA verification failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {requiresMfa ? 'Enter MFA Code' : 'Login to Satellite Health Monitor'}
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {!requiresMfa ? (
          <form onSubmit={onSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={onChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={onChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={onSubmitMfa}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="mfaToken">
                Enter the 6-digit code from your authenticator app
              </label>
              <input
                type="text"
                id="mfaToken"
                name="mfaToken"
                value={mfaToken}
                onChange={onMfaChange}
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="000000"
                maxLength="6"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
        )}
        
        <div className="mt-4 text-center">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;