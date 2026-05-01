'use client';
import { useState } from 'react';
import { 
  MoreVertical,
  Activity,
  History,
  AlertCircle,
  ClipboardList,
  UserCheck,
  RefreshCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { PriorityBadge } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PageHeader, TableEmptyState } from '@/components/ui/page-patterns';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { cx } from '@/lib/cx';
import { getDashboardSnapshot } from '@/lib/request-dashboard';
import styles from './style.module.css';

function Dashboard() {
  const { push: navigate } = useRouter();
  const { t } = useLocale();
  const { activeCases, requests, specialists, activities, refreshActivities, selectCase, userProfile } = useApp();
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    // Simulate a network delay
    setTimeout(() => {
      refreshActivities();
      setIsRefreshing(false);
      setShowActivityMenu(false);
    }, 800);
  };

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate(`/patient-detail?caseId=${encodeURIComponent(caseId)}`);
  };

  const dashboardSnapshot = getDashboardSnapshot({
    activeCases,
    requests,
    specialists,
    activities,
    userProfile,
  });

  return (
    <Layout>
      <div className={styles['dashboard-content-wrapper']}>
        <PageHeader
          title={t('dashboard.title')}
          subtitle={t('dashboard.subtitle')}
          wrapperClassName={styles['dashboard-header']}
          titleClassName={styles['page-title']}
          subtitleClassName={styles['page-subtitle']}
        />

        {/* Stats Cards */}
        <div className={cx(styles, 'stats-grid', 'fade-in-float', 'delay-short')}>
          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>{t('dashboard.activeConsultationCases')}</span>
              <div className={cx(styles, 'stat-icon', 'blue')}>
                <Activity size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {dashboardSnapshot.activeCaseCount.toString().padStart(2, '0')} <span className={cx(styles, 'stat-trend', 'positive')}>LIVE</span>
              </div>
              <div className={styles['stat-desc']}>{t('dashboard.currentlyBeingReviewed')}</div>
            </div>
          </div>

          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>{t('dashboard.pendingRequests')}</span>
              <div className={cx(styles, 'stat-icon', 'yellow')}>
                <History size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {dashboardSnapshot.pendingRequestsCount.toString().padStart(2, '0')} <span className={cx(styles, 'stat-trend', 'negative')}>-5%</span>
              </div>
              <div className={styles['stat-desc']}>{t('dashboard.requiresImmediateAttention')}</div>
            </div>
          </div>

          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>{t('dashboard.availableSpecialists')}</span>
              <div className={cx(styles, 'stat-icon', 'green')}>
                <UserCheck size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {dashboardSnapshot.onlineSpecialistsCount.toString().padStart(2, '0')} <span className={cx(styles, 'stat-trend', 'positive')}>LIVE</span>
              </div>
              <div className={styles['stat-desc']}>{dashboardSnapshot.onlineSpecialistsCount} {t('dashboard.specialistsAcceptingCasesNow')}</div>
            </div>
          </div>

        </div>

        {/* Main Grid Content */}
        <div className={cx(styles, 'content-grid', 'fade-in-float', 'delay-medium')}>
          {/* Active Consultations Table */}
          <div className={cx(styles, 'card', 'consultations-card')}>
              <div className={styles['card-header']}>
              <h2 className={styles['card-title']}>{t('dashboard.activeConsultations')}</h2>
              <button className={styles['view-all-btn']} onClick={() => navigate('/active-cases')}>{t('common.viewAll')}</button>
            </div>
            <div className={styles['table-responsive']}>
              <table className={styles['data-table']}>
                <thead>
                  <tr>
                    <th>{t('dashboard.patientName')}</th>
                    <th>{t('dashboard.primaryHospital')}</th>
                    <th>{t('dashboard.priority')}</th>
                    <th>{t('dashboard.lastActivity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardSnapshot.recentActiveCases.map((caseItem) => (
                    <tr key={caseItem.id} className={styles['row-clickable']} onClick={() => openCaseDetail(caseItem.id)}>
                      <td data-label={t('dashboard.patientName')}>
                        <CasePatientCell
                          title={caseItem.patientName}
                          titleClassName={styles['patient-name']}
                          meta={`ID: ${caseItem.id}`}
                          metaClassName={styles['patient-meta']}
                          onOpen={() => openCaseDetail(caseItem.id)}
                          titleWrapper="div"
                        />
                      </td>
                      <td data-label={t('dashboard.primaryHospital')}>
                        <ClickableCaseText onOpen={() => openCaseDetail(caseItem.id)}>
                          {caseItem.hospital}
                        </ClickableCaseText>
                      </td>
                      <td data-label={t('dashboard.priority')}>
                        <PriorityBadge
                          value={caseItem.priority}
                          baseClassName={styles['priority-badge']}
                          variantClassName={styles[caseItem.priority.toLowerCase()]}
                        />
                      </td>
                      <td data-label={t('dashboard.lastActivity')}>
                        <div className={styles['last-action-cell']}>
                          <span className={styles['action-text']}>{caseItem.lastAction || t('dashboard.waitForReview')}</span>
                          <span className={styles['action-time']}>{caseItem.lastActiveTime || t('dashboard.justNow')}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                {dashboardSnapshot.activeCaseCount === 0 && (
                  <TableEmptyState
                    colSpan={4}
                    cellClassName={styles['empty-table-cell']}
                    contentClassName={styles['empty-state-content']}
                    icon={<History size={48} strokeWidth={1} color="rgba(67, 24, 255, 0.2)" />}
                    message={t('dashboard.activeConsultationsEmpty')}
                    description={t('dashboard.newRequestsAppear')}
                    descriptionClassName={styles['empty-desc']}
                  />
                )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed and Status */}
          <div className={styles['right-panel']}>
            <div className={cx(styles, 'card', 'activity-card')}>
              <div className={styles['card-header']}>
                <h2 className={styles['card-title']}>{t('dashboard.activityFeed')}</h2>
                <div className={styles['menu-container']}>
                  <button className={styles['icon-btn']} onClick={() => setShowActivityMenu(!showActivityMenu)}>
                    <MoreVertical size={20} />
                  </button>
                  {showActivityMenu && (
                    <div className={styles['dropdown-menu']}>
                      <button 
                        className={cx(styles, 'menu-item', isRefreshing && 'spinning')}
                        onClick={handleRefreshFeed}
                        disabled={isRefreshing}
                      >
                        <RefreshCcw size={14} />
                        {isRefreshing ? t('dashboard.refreshing') : t('dashboard.refreshFeed')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles['activity-list']}>
                {dashboardSnapshot.recentActivities.map((item) => (
                  <div key={item.id} className={styles['activity-item']}>
                    <div className={cx(styles, 'activity-icon', item.icon === 'alert' ? 'bg-red-light' : 'bg-blue-light')}>
                      {item.icon === 'alert' ? <AlertCircle size={16} /> : <ClipboardList size={16} />}
                    </div>
                    <div className={styles['activity-content']}>
                      <div className={styles['activity-title']}>{item.title}</div>
                      <div className={styles['activity-desc']}>{item.desc}</div>
                      <div className={styles['activity-time']}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles['view-full-history']} onClick={() => navigate('/activity-history')}>{t('dashboard.viewFullHistory')}</button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
