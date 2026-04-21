'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Settings, Check, Activity, User, FileText, X,
  Archive, Layout, BellRing, Compass
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import './style.css';

// Static navigation pages searchable by the global search
const NAV_PAGES = [
  { id: 'p1', label: 'Dashboard',             description: 'Overview of all cases and stats',    path: '/dashboard',              icon: 'layout' },
  { id: 'p2', label: 'Active Cases',           description: 'Manage ongoing patient cases',        path: '/active-cases',           icon: 'activity' },
  { id: 'p3', label: 'Pending Requests',       description: 'Review and approve new requests',    path: '/requests',              icon: 'file' },
  { id: 'p4', label: 'Archived Cases',         description: 'Browse closed and archived cases',   path: '/archive-cases',         icon: 'archive' },
  { id: 'p5', label: 'Specialist Directory',   description: 'Find and contact specialists',        path: '/specialist',            icon: 'user' },
  { id: 'p6', label: 'New Consultation',       description: 'Submit a new consultation request',  path: '/new-request',           icon: 'file' },
  { id: 'p7', label: 'Settings – Profile',     description: 'Manage your profile and account',    path: '/settings',              icon: 'settings' },
  { id: 'p8', label: 'Settings – Security',    description: 'Manage security and active sessions',path: '/settings',              icon: 'settings' },
  { id: 'p9', label: 'Settings – Notifications',description: 'Configure alert preferences',       path: '/settings',              icon: 'settings' },
];

const Header = () => {
  const router = useRouter();
  const navigate = router.push;
  const [showNotifications, setShowNotifications] = useState(false);
  const {
    notifications,
    markNotificationAsRead,
    clearNotifications,
    activeCases,
    requests,
    archiveCases,
    specialists,
    selectCase
  } = useApp();

  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const q = searchQuery.toLowerCase().trim();

  const LIMIT = 4;

  const results = {
    cases: activeCases.filter(c =>
      c.patientName.toLowerCase().includes(q) ||
      c.hospital?.toLowerCase().includes(q) ||
      c.specialty?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    ).slice(0, LIMIT),

    requests: requests.filter(r =>
      (r.patientName?.toLowerCase() || '').includes(q) ||
      (r.hospital?.toLowerCase() || '').includes(q) ||
      (r.specialty?.toLowerCase() || '').includes(q) ||
      (r.reason?.toLowerCase() || '').includes(q) ||
      (r.id?.toLowerCase() || '').includes(q)
    ).slice(0, LIMIT),

    archives: archiveCases.filter(a =>
      a.patientName.toLowerCase().includes(q) ||
      a.hospital?.toLowerCase().includes(q) ||
      a.specialty?.toLowerCase().includes(q)
    ).slice(0, LIMIT),

    specialists: specialists.filter(s =>
      s.isAcceptingCases && (
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        (s.specialty || '').toLowerCase().includes(q) ||
        (s.hospital || '').toLowerCase().includes(q)
      )
    ).slice(0, LIMIT),

    notifications: notifications.filter(n =>
      n.title.toLowerCase().includes(q) ||
      n.message.toLowerCase().includes(q)
    ).slice(0, LIMIT),

    pages: NAV_PAGES.filter(p =>
      p.label.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    ).slice(0, LIMIT),
  };

  const hasResults =
    results.cases.length > 0 ||
    results.requests.length > 0 ||
    results.archives.length > 0 ||
    results.specialists.length > 0 ||
    results.notifications.length > 0 ||
    results.pages.length > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowResults(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const go = (path: string) => {
    setShowResults(false);
    setSearchQuery('');
    navigate(path);
  };

  const goCase = (id: string) => {
    selectCase(id);
    go('/patient-detail');
  };

  const PageIcon = ({ icon }: { icon: string }) => {
    if (icon === 'activity') return <Activity size={16} />;
    if (icon === 'file') return <FileText size={16} />;
    if (icon === 'archive') return <Archive size={16} />;
    if (icon === 'user') return <User size={16} />;
    if (icon === 'settings') return <Settings size={16} />;
    return <Layout size={16} />;
  };

  return (
    <header className="main-header">
      <div className="search-container" ref={searchRef}>
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search everything – cases, specialists, pages..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        {showResults && q.length > 0 && (
          <div className="search-dropdown">
            {hasResults ? (
              <>
                {results.cases.length > 0 && (
                  <div className="search-section">
                    <h4>Active Cases</h4>
                    {results.cases.map(c => (
                      <div key={c.id} className="search-result-item" onClick={() => goCase(c.id)}>
                        <div className="result-icon case"><Activity size={16} /></div>
                        <div className="result-text">
                          <span className="result-title">{c.patientName}</span>
                          <span className="result-meta">{c.hospital} · {c.specialty}</span>
                        </div>
                        <span className={`result-tag ${c.priority?.toLowerCase() === 'immediate' ? 'immediate' : 'active'}`}>{c.priority}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.requests.length > 0 && (
                  <div className="search-section">
                    <h4>Requests</h4>
                    {results.requests.map(r => (
                      <div key={r.id} className="search-result-item" onClick={() => goCase(r.id)}>
                        <div className="result-icon request"><FileText size={16} /></div>
                        <div className="result-text">
                          <span className="result-title">{r.patientName}</span>
                          <span className="result-meta">{r.hospital} · {r.reason}</span>
                        </div>
                        <span className="result-tag pending">{r.status}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.archives.length > 0 && (
                  <div className="search-section">
                    <h4>Archived Cases</h4>
                    {results.archives.map(a => (
                      <div key={a.id} className="search-result-item" onClick={() => goCase(a.id)}>
                        <div className="result-icon archive"><Archive size={16} /></div>
                        <div className="result-text">
                          <span className="result-title">{a.patientName}</span>
                          <span className="result-meta">{a.hospital} · {a.specialty}</span>
                        </div>
                        <span className="result-tag archived">Archived</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.specialists.length > 0 && (
                  <div className="search-section">
                    <h4>Specialists</h4>
                    {results.specialists.map(s => (
                      <div key={s.id} className="search-result-item" onClick={() => go('/specialist')}>
                        <div className="result-icon specialist"><User size={16} /></div>
                        <div className="result-text">
                          <span className="result-title">{s.title} {s.firstName} {s.lastName}</span>
                          <span className="result-meta">{s.specialty} · {s.hospital}</span>
                        </div>
                        <span className={`result-tag specialist-status ${s.isAcceptingCases ? 'available' : 'busy'}`}>
                          {s.isAcceptingCases ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {results.notifications.length > 0 && (
                  <div className="search-section">
                    <h4>Notifications</h4>
                    {results.notifications.map(n => (
                      <div key={n.id} className="search-result-item" onClick={() => go('/dashboard')}>
                        <div className="result-icon notif"><BellRing size={16} /></div>
                        <div className="result-text">
                          <span className="result-title">{n.title}</span>
                          <span className="result-meta">{n.message}</span>
                        </div>
                        <span className="result-tag notif-tag">{n.time}</span>
                      </div>
                    ))}
                  </div>
                )}

                {results.pages.length > 0 && (
                  <div className="search-section">
                    <h4>Pages</h4>
                    {results.pages.map(p => (
                      <div key={p.id} className="search-result-item" onClick={() => go(p.path)}>
                        <div className="result-icon page"><PageIcon icon={p.icon} /></div>
                        <div className="result-text">
                          <span className="result-title">{p.label}</span>
                          <span className="result-meta">{p.description}</span>
                        </div>
                        <span className="result-tag page-tag"><Compass size={11} /> Go</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-results">
                <Search size={28} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
                <p>No results for <strong>&quot;{searchQuery}&quot;</strong></p>
                <p className="no-results-hint">Try searching by name, specialty, hospital, or page</p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="header-actions">
        <div className="notification-wrapper" ref={notificationRef}>
          <button
            className={`action-btn ${showNotifications ? 'active' : ''}`}
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <button className="clear-all" onClick={clearNotifications}>Clear All</button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="empty-notifications">
                    <p>No new notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
                      <div className="notif-content">
                        <div className="notif-title-row">
                          <span className="notif-title">{n.title}</span>
                          <span className="notif-time">{n.time}</span>
                        </div>
                        <p className="notif-msg">{n.message}</p>
                      </div>
                      {!n.read && (
                        <button
                          className="mark-read-btn"
                          onClick={() => markNotificationAsRead(n.id)}
                          title="Mark as read"
                        >
                          <Check size={14} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          className="action-btn"
          onClick={() => navigate('/settings')}
          title="Settings"
        >
          <Settings size={20} />
        </button>

        <div className="header-info">
          <span className="version-label">v1.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
