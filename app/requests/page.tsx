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
import { PriorityBadge, StatusWithDotBadge } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PagerControls, PaginationSummary } from '@/components/ui/pagination-patterns';
import { PageHeader } from '@/components/ui/page-patterns';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { getCaseInitials } from '@/lib/case-directory';
import { cx } from '@/lib/cx';
import {
  filterRequestsByTab,
  getCurrentUserRequestKey,
  getIncomingPendingCount,
  type RequestTab,
} from '@/lib/request-dashboard';
import styles from './style.module.css';

function Requests() {
  const { requests, approveRequest, declineRequest, userProfile, selectCase } = useApp();
  const { push: navigate } = useRouter();
  const { t } = useLocale();
  const [activeTab, setActiveTab] = useState<RequestTab>('incoming');
  const currentUserId = getCurrentUserRequestKey(userProfile);
  const filteredRequests = filterRequestsByTab(requests, activeTab, currentUserId);
  const pendingCount = getIncomingPendingCount(requests, currentUserId);

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate('/patient-detail');
  };

  return (
    <Layout>
      <div className={styles['requests-page-wrapper']}>
        <PageHeader
          title={t('requests.title')}
          subtitle={t('requests.subtitle')}
          wrapperClassName={styles['page-header']}
        />

        <div className={styles['requests-card']}>
          <div className={styles['card-tabs']}>
            <button
              className={cx(styles, 'tab-btn', activeTab === 'incoming' && 'active')}
              onClick={() => setActiveTab('incoming')}
            >
              <Inbox size={18} />
              {t('requests.incoming')}
              {pendingCount > 0 && <span className={styles['count-badge']}>{pendingCount}</span>}
            </button>
            <button
              className={cx(styles, 'tab-btn', activeTab === 'sent' && 'active')}
              onClick={() => setActiveTab('sent')}
            >
              <Send size={18} />
              {t('requests.sent')}
            </button>
          </div>

          <div className={styles['table-container']}>
            <table className={styles['requests-table']}>
              <thead>
                <tr>
                  <th>{t('archiveCases.caseId')}</th>
                  <th>{t('archiveCases.patientName')}</th>
                  <th>{activeTab === 'incoming' ? t('requests.sourceHospital') : t('requests.targetHospital')}</th>
                  <th>{t('requests.priority')}</th>
                  <th>{t('requests.status')}</th>
                  <th className={styles['text-right']}>{t('requests.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id} className={styles['row-clickable']}>
                    <td data-label={t('archiveCases.caseId')}><span className={styles['case-id-badge']}>#{req.id}</span></td>
                    <td data-label={t('archiveCases.patientName')}>
                      <CasePatientCell
                        wrapperClassName={styles['patient-cell']}
                        leading={<div className={styles['initials-avatar']}>{getCaseInitials(req.patientName)}</div>}
                        title={req.patientName}
                        titleClassName={styles['patient-name']}
                        onOpen={() => openCaseDetail(req.id)}
                      />
                    </td>
                    <td data-label={activeTab === 'incoming' ? t('requests.sourceHospital') : t('requests.targetHospital')}>
                      <ClickableCaseText onOpen={() => openCaseDetail(req.id)}>
                        {req.hospital}
                      </ClickableCaseText>
                    </td>
                    <td data-label={t('requests.priority')}>
                      <PriorityBadge
                        value={req.priority}
                        baseClassName={styles['priority-badge']}
                        variantClassName={styles[req.priority.toLowerCase()]}
                      />
                    </td>
                    <td data-label={t('requests.status')}>
                      <StatusWithDotBadge
                        value={req.status}
                        wrapperClassName={styles['status-cell']}
                        dotBaseClassName={styles['status-dot']}
                        dotVariantClassName={styles[req.status.toLowerCase()]}
                        textBaseClassName={styles['status-text']}
                        textVariantClassName={styles[req.status.toLowerCase()]}
                      />
                    </td>
                    <td className={styles['text-right']} data-label="Actions">
                      {req.status === 'Pending' ? (
                        <div className={styles['action-btns']}>
                          <button
                            className={styles['decline-btn']}
                            onClick={() => declineRequest(req.id)}
                          >
                            {t('common.decline')}
                          </button>
                          <button
                            className={styles['approve-btn']}
                            onClick={() => approveRequest(req.id)}
                          >
                            {t('common.approve')}
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
                      {t('requests.noRequests').replace('{tab}', activeTab)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationSummary
            wrapperClassName={styles['pagination-footer']}
            textClassName={styles['results-count']}
            controls={(
              <PagerControls
                wrapperClassName={styles['pagination-controls']}
                navButtonClassName={styles['page-nav-btn']}
                activePageClassName={cx(styles, 'page-num', 'active')}
                prevIcon={<ChevronLeft size={16} />}
                nextIcon={<ChevronRight size={16} />}
              />
            )}
          >
            {t('requests.showing')} {filteredRequests.length} of {filteredRequests.length} {activeTab} requests
          </PaginationSummary>
        </div>

        <div className={styles['stats-grid']}>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{t('requests.totalMonthlyTransfers')}</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>248</span>
              <span className={cx(styles, 'trend', 'positive')}>
                <TrendingUp size={14} /> 12%
              </span>
            </div>
          </div>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{t('requests.avgApprovalTime')}</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>42m</span>
              <span className={cx(styles, 'trend', 'negative')}>
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
