import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useApp } from '../../context/AppContext';
import { authService } from '../../services/auth';
import { useRouter } from 'next/navigation';
import './style.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toast } = useApp();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  // Set isMounted to true on the first client-side render
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Client-side Robust Route Protection Guard
  React.useEffect(() => {
    if (!isMounted) return;

    const session = authService.getSession();
    if (!session) {
      // If no session found in localStorage, redirect to login
      router.push('/login');
    } else {
      setIsLoaded(true);
    }
  }, [isMounted, router]);

  // Server-side and initial client-side render (matching SSR)
  if (!isMounted || !isLoaded) {
    return (
      <div className="layout-loading-screen">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="layout-container fade-in">
      <Sidebar />
      <div className="layout-main">
        <Header />
        <main className="layout-content">
          {children}
        </main>
      </div>

      {/* Global Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default Layout;
