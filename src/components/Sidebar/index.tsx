import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ClipboardList, 
  MessageSquare, 
  Users, 
  Archive, 
  LogOut,
  Settings as SettingsIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import './style.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { requests, userProfile } = useApp();

  // @ts-ignore
  const tg = window.Telegram?.WebApp;
  const currentUserId = tg?.initDataUnsafe?.user ? `user_${tg.initDataUnsafe.user.id}` : 'guest_user';
  
  const pendingCount = requests.filter(r => r.senderId !== currentUserId && r.status === 'Pending').length;

  // Determine active path - parent pages highlighted for child routes
  const isActive = (path: string) => {
    if (path === '/active-cases') {
      return location.pathname === '/active-cases' || location.pathname === '/patient-detail' || location.pathname === '/message-specialist';
    }
    return location.pathname === path;
  };

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/dashboard', badge: 0 },
    { icon: <ClipboardList size={20} />, label: 'Active Cases', path: '/active-cases', badge: 0 },
    { icon: <MessageSquare size={20} />, label: 'Requests', path: '/requests', badge: pendingCount },
    { icon: <Users size={20} />, label: 'Specialist', path: '/specialist', badge: 0 },
    { icon: <Archive size={20} />, label: 'Archive Cases', path: '/archive-cases', badge: 0 },
    { icon: <SettingsIcon size={20} />, label: 'Settings', path: '/settings', badge: 0 },
  ];

  const handleLogout = () => {
    // Clear session and redirect to login
    localStorage.removeItem('provider_session');
    navigate('/login');
  };
  const userInitials = `${userProfile.firstName.charAt(0)}${userProfile.lastName.charAt(0)}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-header" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="9" y="4" width="6" height="16" rx="2" fill="currentColor" fillOpacity="0.9"/>
            <rect x="4" y="9" width="16" height="6" rx="2" fill="currentColor" fillOpacity="0.9"/>
            <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        <div className="sidebar-brand">
          <span className="brand-title">Phitsanulok</span>
          <span className="brand-subtitle">Med Consultation</span>
        </div>
      </div>


      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button 
            key={item.path}
            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge > 0 && (
              <span className="nav-badge">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-action-area">
        <button className="new-request-btn" onClick={() => navigate('/new-request')}>
          <div className="btn-icon">+</div>
          <span>New Request</span>
        </button>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar-wrap">
            <div className="user-avatar">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Avatar" className="sidebar-avatar-img" />
              ) : userInitials}
            </div>
          </div>
          <div className="user-info">
            <span className="user-name">{userProfile.title} {userProfile.lastName}</span>
            <span className="user-role">{userProfile.specialty}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
