'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Search, Bell, Settings, X
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useApp } from '../../context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { HeaderNotificationsDropdown } from './header-notifications';
import { HeaderSearchDropdown } from './header-search';
import './style.css';

const Header = () => {
  const router = useRouter();
  const navigate = router.push;
  const { t } = useLocale();
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
  const navPages = [
    { id: 'p1', label: t('nav.dashboard'), description: t('dashboard.title'), path: '/dashboard', icon: 'layout' },
    { id: 'p2', label: t('nav.activeCases'), description: t('activeCases.subtitle'), path: '/active-cases', icon: 'activity' },
    { id: 'p3', label: t('nav.requests'), description: t('requests.subtitle'), path: '/requests', icon: 'file' },
    { id: 'p4', label: t('nav.archivedCases'), description: t('archiveCases.subtitle'), path: '/archive-cases', icon: 'archive' },
    { id: 'p5', label: t('nav.specialists'), description: t('specialist.subtitle'), path: '/specialist', icon: 'user' },
    { id: 'p6', label: t('nav.newRequest'), description: t('newRequest.subtitle'), path: '/new-request', icon: 'file' },
    { id: 'p7', label: `${t('nav.settings')} - ${t('settings.profileTab')}`, description: t('settings.profileTitle'), path: '/settings', icon: 'settings' },
    { id: 'p8', label: `${t('nav.settings')} - ${t('settings.securityTab')}`, description: t('settings.securityTitle'), path: '/settings', icon: 'settings' },
    { id: 'p9', label: `${t('nav.settings')} - ${t('settings.notificationsTab')}`, description: t('settings.notificationsTitle'), path: '/settings', icon: 'settings' },
  ];

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

    pages: navPages.filter(p =>
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

  return (
    <header className="main-header">
      <div className="search-container" ref={searchRef}>
        <div className="search-input-wrap">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
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
            <HeaderSearchDropdown
              results={results}
              hasResults={hasResults}
              searchQuery={searchQuery}
              t={t}
              go={go}
              goCase={goCase}
            />
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
            <HeaderNotificationsDropdown
              notifications={notifications}
              markNotificationAsRead={markNotificationAsRead}
              clearNotifications={clearNotifications}
              t={t}
            />
          )}
        </div>

        <button
          className="action-btn"
          onClick={() => navigate('/settings')}
          title={t('common.settings')}
        >
          <Settings size={20} />
        </button>
        <LanguageSwitcher />

        <div className="header-info">
          <span className="version-label">v1.0</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
