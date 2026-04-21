'use client';
import { useState } from 'react';
import {
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Inbox,
  Send
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import styles from './style.module.css';

function Requests() {
  const { requests, approveRequest, declineRequest, userProfile, selectCase } = useApp();
  const router = useRouter();
  const navigate = router.push;
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');
  const currentUserId = userProfile.id || userProfile.email || 'guest_user';
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const filteredRequests = requests.filter((r) => {
    if (activeTab === 'sent') {
      return r.senderId === currentUserId;
    }
    return r.senderId !== currentUserId;
  });

  const pendingCount = requests.filter((r) => r.senderId !== currentUserId && r.status === 'Pending').length;

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate('/patient-detail');
  };

  return (
    <Layout>
      <div className={styles['requests-page-wrapper']}>
        <div className={styles['page-header']}>
          <h1>Requests</h1>
          <p>Manage and track inter-hospital patient transfers</p>
        </div>

        <div className={styles['requests-card']}>
          <div className={styles['card-tabs']}>
            <button
              className={cx('tab-btn', activeTab === 'incoming' && 'active')}
              onClick={() => setActiveTab('incoming')}
            >
              <Inbox size={18} />
              Incoming Requests
              {pendingCount > 0 && <span className={styles['count-badge']}>{pendingCount}</span>}
            </button>
            <button
              className={cx('tab-btn', activeTab === 'sent' && 'active')}
              onClick={() => setActiveTab('sent')}
            >
              <Send size={18} />
              Sent Requests
            </button>
          </div>

          <div className={styles['table-container']}>
            <table className={styles['requests-table']}>
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>PATIENT NAME</th>
                  <th>{activeTab === 'incoming' ? 'SOURCE HOSPITAL' : 'TARGET HOSPITAL'}</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th className={styles['text-right']}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className={styles['row-clickable']}>
                    <td><span className={styles['case-id-badge']}>#{req.id}</span></td>
                    <td>
                      <div className={styles['patient-cell']}>
                        <div className={styles['initials-avatar']}>
                          {req.patientName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <span
                          className={styles['patient-name']}
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseDetail(req.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              openCaseDetail(req.id);
                            }
                          }}
                        >
                          {req.patientName}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCaseDetail(req.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            openCaseDetail(req.id);
                          }
                        }}
                      >
                        {req.hospital}
                      </span>
                    </td>
                    <td>
                      <span className={cx('priority-badge', req.priority.toLowerCase())}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <div className={styles['status-cell']}>
                        <span className={cx('status-dot', req.status.toLowerCase())}></span>
                        <span className={cx('status-text', req.status.toLowerCase())}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className={styles['text-right']}>
                      {req.status === 'Pending' ? (
                        <div className={styles['action-btns']}>
                          <button
                            className={styles['decline-btn']}
                            onClick={() => declineRequest(req.id)}
                          >
                            Decline
                          </button>
                          <button
                            className={styles['approve-btn']}
                            onClick={() => approveRequest(req.id)}
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <button className={styles['more-btn']}>
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles['empty-cell']}>
                      No {activeTab} requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={styles['pagination-footer']}>
            <span className={styles['results-count']}>Showing {filteredRequests.length} of {filteredRequests.length} {activeTab} requests</span>
            <div className={styles['pagination-controls']}>
              <button className={styles['page-nav-btn']}><ChevronLeft size={16} /></button>
              <button className={cx('page-num', 'active')}>1</button>
              <button className={styles['page-nav-btn']}><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className={styles['stats-grid']}>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>TOTAL MONTHLY TRANSFERS</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>248</span>
              <span className={cx('trend', 'positive')}>
                <TrendingUp size={14} /> 12%
              </span>
            </div>
          </div>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>AVG. APPROVAL TIME</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>42m</span>
              <span className={cx('trend', 'negative')}>
                <TrendingDown size={14} /> 8m
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Requests;
