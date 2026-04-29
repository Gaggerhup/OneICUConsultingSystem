'use client';

import { Activity, Archive, BellRing, Compass, FileText, Layout, Search, Settings, User } from 'lucide-react';
import type { Notification, SpecialistMember } from '@/context/AppContext';

type HeaderSearchPage = {
  id: string;
  label: string;
  description: string;
  path: string;
  icon: string;
};

type SearchCaseLike = {
  id: string;
  patientName: string;
  hospital?: string | null;
  specialty?: string | null;
  priority?: string | null;
  status?: string | null;
  reason?: string | null;
};

type HeaderSearchResults = {
  cases: SearchCaseLike[];
  requests: SearchCaseLike[];
  archives: SearchCaseLike[];
  specialists: SpecialistMember[];
  notifications: Notification[];
  pages: HeaderSearchPage[];
};

type TFunction = (key: string) => string;

function PageIcon({ icon }: { icon: string }) {
  if (icon === 'activity') return <Activity size={16} />;
  if (icon === 'file') return <FileText size={16} />;
  if (icon === 'archive') return <Archive size={16} />;
  if (icon === 'user') return <User size={16} />;
  if (icon === 'settings') return <Settings size={16} />;
  return <Layout size={16} />;
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="search-section">
      <h4>{title}</h4>
      {children}
    </div>
  );
}

export function HeaderNoResults({
  searchQuery,
  t,
}: {
  searchQuery: string;
  t: TFunction;
}) {
  return (
    <div className="no-results">
      <Search size={28} style={{ color: '#cbd5e1', marginBottom: '0.5rem' }} />
      <p>{t('common.noResults')} <strong>&quot;{searchQuery}&quot;</strong></p>
      <p className="no-results-hint">{t('header.searchPlaceholder')}</p>
    </div>
  );
}

export function HeaderSearchDropdown({
  results,
  hasResults,
  searchQuery,
  t,
  go,
  goCase,
}: {
  results: HeaderSearchResults;
  hasResults: boolean;
  searchQuery: string;
  t: TFunction;
  go: (path: string) => void;
  goCase: (id: string) => void;
}) {
  if (!hasResults) {
    return <HeaderNoResults searchQuery={searchQuery} t={t} />;
  }

  return (
    <>
      {results.cases.length > 0 && (
        <SearchSection title={t('header.activeCases')}>
          {results.cases.map((caseItem) => (
            <div key={caseItem.id} className="search-result-item" onClick={() => goCase(caseItem.id)}>
              <div className="result-icon case"><Activity size={16} /></div>
              <div className="result-text">
                <span className="result-title">{caseItem.patientName}</span>
                <span className="result-meta">{caseItem.hospital} · {caseItem.specialty}</span>
              </div>
              <span className={`result-tag ${caseItem.priority?.toLowerCase() === 'immediate' ? 'immediate' : 'active'}`}>{caseItem.priority}</span>
            </div>
          ))}
        </SearchSection>
      )}

      {results.requests.length > 0 && (
        <SearchSection title={t('header.requests')}>
          {results.requests.map((request) => (
            <div key={request.id} className="search-result-item" onClick={() => goCase(request.id)}>
              <div className="result-icon request"><FileText size={16} /></div>
              <div className="result-text">
                <span className="result-title">{request.patientName}</span>
                <span className="result-meta">{request.hospital} · {request.reason}</span>
              </div>
              <span className="result-tag pending">{request.status}</span>
            </div>
          ))}
        </SearchSection>
      )}

      {results.archives.length > 0 && (
        <SearchSection title={t('header.archivedCases')}>
          {results.archives.map((archive) => (
            <div key={archive.id} className="search-result-item" onClick={() => goCase(archive.id)}>
              <div className="result-icon archive"><Archive size={16} /></div>
              <div className="result-text">
                <span className="result-title">{archive.patientName}</span>
                <span className="result-meta">{archive.hospital} · {archive.specialty}</span>
              </div>
              <span className="result-tag archived">Archived</span>
            </div>
          ))}
        </SearchSection>
      )}

      {results.specialists.length > 0 && (
        <SearchSection title={t('header.specialists')}>
          {results.specialists.map((specialist) => (
            <div key={specialist.id} className="search-result-item" onClick={() => go('/specialist')}>
              <div className="result-icon specialist"><User size={16} /></div>
              <div className="result-text">
                <span className="result-title">{specialist.title} {specialist.firstName} {specialist.lastName}</span>
                <span className="result-meta">{specialist.specialty} · {specialist.hospital}</span>
              </div>
              <span className={`result-tag specialist-status ${specialist.isAcceptingCases ? 'available' : 'busy'}`}>
                {specialist.isAcceptingCases ? t('header.available') : t('header.unavailable')}
              </span>
            </div>
          ))}
        </SearchSection>
      )}

      {results.notifications.length > 0 && (
        <SearchSection title={t('header.notifications')}>
          {results.notifications.map((notification) => (
            <div key={notification.id} className="search-result-item" onClick={() => go('/dashboard')}>
              <div className="result-icon notif"><BellRing size={16} /></div>
              <div className="result-text">
                <span className="result-title">{notification.title}</span>
                <span className="result-meta">{notification.message}</span>
              </div>
              <span className="result-tag notif-tag">{notification.time}</span>
            </div>
          ))}
        </SearchSection>
      )}

      {results.pages.length > 0 && (
        <SearchSection title={t('header.pages')}>
          {results.pages.map((page) => (
            <div key={page.id} className="search-result-item" onClick={() => go(page.path)}>
              <div className="result-icon page"><PageIcon icon={page.icon} /></div>
              <div className="result-text">
                <span className="result-title">{page.label}</span>
                <span className="result-meta">{page.description}</span>
              </div>
              <span className="result-tag page-tag"><Compass size={11} /> {t('header.go')}</span>
            </div>
          ))}
        </SearchSection>
      )}
    </>
  );
}
