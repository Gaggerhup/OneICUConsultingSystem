import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/auth';
import { Loader2, AlertCircle } from 'lucide-react';
import './style.css';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState('Authenticating...');

  useEffect(() => {
    const completeAuth = async () => {
      const code = searchParams.get('code');
      
      if (!code) {
        setError('Authorization code missing');
        return;
      }

      try {
        setStatus('Exchanging token...');
        const tokenData = await authService.exchangeCode(code);
        if (tokenData.error) throw new Error(tokenData.error);

        setStatus('Verifying provider identity...');
        const providerData = await authService.getProviderToken(tokenData.data.access_token);
        if (providerData.error) throw new Error(providerData.error);

        setStatus('Fetching profile...');
        const profileData = await authService.getProfile(providerData.data.access_token);
        if (profileData.error) throw new Error(profileData.error);

        authService.saveSession(profileData.data);
        setStatus('Success! Redirecting...');
        
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);

      } catch (err: any) {
        console.error('Auth error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    completeAuth();
  }, [searchParams, navigate]);

  if (error) {
    return (
      <div className="callback-container">
        <div className="error-card">
          <AlertCircle size={48} color="#ef4444" />
          <h1>Authentication Failed</h1>
          <p>{error}</p>
          <button onClick={() => navigate('/login')} className="retry-btn">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="callback-container">
      <div className="loading-card">
        <Loader2 className="spinner" size={48} color="#16a34a" />
        <h1>{status}</h1>
        <p>Please wait while we secure your connection</p>
      </div>
    </div>
  );
}

export default AuthCallback;
