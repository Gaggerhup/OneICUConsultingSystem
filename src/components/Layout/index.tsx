import React from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useApp } from '../../context/AppContext';
import './style.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { toast } = useApp();

  return (
    <div className="layout-container">
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
