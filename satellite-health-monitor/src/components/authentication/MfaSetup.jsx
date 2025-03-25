// src/components/authentication/MfaSetup.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

const MfaSetup = () => {
  const [loading, setLoading] = useState(true);
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  
  const navigate = useNavigate();
  const { setupMfa, enableMfa, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    // Check if user is authenticated
    console.log('MfaSetup component rendered, isAuthenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      navigate('/login');
      return;
    }

    const initMfaSetup = async () => {
      try {
        console.log('Initializing MFA setup...');
        setLoading(true);
        const result = await setupMfa();
        console.log('MFA setup result:', result);
        
        if (result.error) {
          console.error('MFA setup error:', result.error);
          setError(result.error);
        } else {
          console.log('Successfully received MFA setup data');
          setSecret(result.secret);
          setQrCode(result.qrCode);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('MFA setup caught error:', err);
        setError('Failed to set up MFA. Please try again later.');
        setLoading(false);
      }
    };

    initMfaSetup();
  }, [isAuthenticated, navigate, setupMfa]);

  const onChange = e => {
    setToken(e.target.value);
  };

  const onSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('Submitting MFA verification token:', token);
      const result = await enableMfa(token);
      console.log('MFA enable result:', result);
      
      if (result.error) {
        console.error('MFA enable error:', result.error);
        setError(result.error);
        setLoading(false);
      } else {
        console.log('MFA enabled successfully');
        setSuccess(true);
        setStep(3);
        setLoading(false);
        
        // Redirect to dashboard after 3 seconds
        console.log('Will redirect to dashboard in 3 seconds');
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (err) {
      console.error('MFA enable caught error:', err);
      setError('Failed to verify token. Please try again.');
      setLoading(false);
    }
  };

  const skipMfa = () => {
    console.log('User skipped MFA setup, redirecting to dashboard');
    navigate('/dashboard');
  };

  const nextStep = () => {
    console.log('Moving to next MFA setup step');
    setStep(step + 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Set Up Two-Factor Authentication
        </h2>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">
            MFA has been successfully enabled! Redirecting to dashboard...
          </div>
        )}
        
        {loading && step !== 3 ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Setting up MFA...</p>
          </div>
        ) : (
          <>
            {step === 1 && (
              <div>
                <p className="mb-4">
                  Two-factor authentication adds an extra layer of security to your account.
                  It's optional but highly recommended.
                </p>
                <p className="mb-4">
                  Would you like to set up two-factor authentication now?
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={skipMfa}
                    className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    Skip for now
                  </button>
                  <button
                    onClick={nextStep}
                    className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Set up now
                  </button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div>
                <p className="mb-4">
                  Scan this QR code with your authenticator app (like Google Authenticator,
                  Authy, or Microsoft Authenticator).
                </p>
                
                <div className="flex justify-center mb-4">
                  {qrCode && <img src={qrCode} alt="QR Code" className="border p-2" />}
                </div>
                
                <p className="mb-4">
                  Alternatively, you can manually enter this secret key:
                </p>
                
                <div className="bg-gray-100 p-2 rounded mb-4 font-mono text-center break-all">
                  {secret}
                </div>
                
                <form onSubmit={onSubmit}>
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="token">
                      Enter the 6-digit code from your app
                    </label>
                    <input
                      type="text"
                      id="token"
                      name="token"
                      value={token}
                      onChange={onChange}
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
                    {loading ? 'Verifying...' : 'Verify & Enable'}
                  </button>
                </form>
              </div>
            )}
            
            {step === 3 && success && (
              <div className="text-center">
                <svg
                  className="w-16 h-16 text-green-500 mx-auto mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-lg mb-4">
                  Two-factor authentication has been successfully enabled!
                </p>
                <p>Redirecting to dashboard...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MfaSetup;