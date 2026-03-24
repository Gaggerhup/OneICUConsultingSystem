import './style.css';
import providerIdLogo from '../../assets/provider-id-logo.png';
import { authService } from '../../services/auth';
import { Globe, ChevronRight } from 'lucide-react';

function Login() {
  const handleProviderLogin = () => {
    authService.redirectToLogin();
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo-container">
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="4" width="6" height="16" rx="2" fill="currentColor" fillOpacity="0.9"/>
              <rect x="4" y="9" width="16" height="6" rx="2" fill="currentColor" fillOpacity="0.9"/>
              <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
            </svg>
          </div>
          Phitsanulok Med Consultation
        </div>
      </header>

      <main className="main-content">
        <div className="login-card">
          <div className="card-header-img">
            {/* The background uses a subtle medical-themed stock photo overlay */}
            <img src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&fit=crop" alt="Medical dashboard layout" />
            <div className="card-header-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
          </div>
          <div className="card-body">
            <h1 className="title">Sign In</h1>
            <p className="subtitle">Access your secure healthcare provider portal</p>

            <div className="login-options">
              <button className="provider-id-btn" type="button" onClick={handleProviderLogin}>
                <img src={providerIdLogo} alt="Provider ID" className="provider-logo-img" />
                <span>Sign in with Provider ID</span>
              </button>

              {/* --- Phase 5: External Browser Access (Pre-Login) --- */}
              {(() => {
                // @ts-ignore
                const tg = window.Telegram?.WebApp;
                const isInTelegram = tg && tg.platform !== 'unknown';
                
                if (!isInTelegram) return null;

                return (
                  <button 
                    className="external-browser-btn" 
                    type="button"
                    onClick={() => {
                      tg.openLink(window.location.origin, { try_browser: true });
                    }}
                  >
                    <div className="ext-icon-wrap">
                      <Globe size={18} />
                    </div>
                    <div className="ext-text">
                      <span className="ext-label">Open in External Browser</span>
                      <span className="ext-hint">Chrome, Safari, or Desktop</span>
                    </div>
                    <ChevronRight size={16} className="ext-chevron" />
                  </button>
                );
              })()}
              {/* ---------------------------------------------------- */}
            </div>
          </div>
        </div>
      </main>

      <footer className="page-footer">
        <div>© 2026 Phitsanulok Provincial Public Health Office. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Login;
