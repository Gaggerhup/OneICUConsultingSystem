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
import { useApp } from '@/context/AppContext';
import styles from './style.module.css';

function Dashboard() {
  const router = useRouter();
  const navigate = router.push;
  const { activeCases, requests, specialists, activities, refreshActivities, selectCase } = useApp();
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

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
    navigate('/patient-detail');
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const onlineSpecialists = specialists.filter(s => s.status === 'online' && s.isAcceptingCases).length;
  const totalOnline = onlineSpecialists;

  return (
    <Layout>
      <div className={styles['dashboard-content-wrapper']}>
        <div className={styles['dashboard-header']}>
          <h1 className={styles['page-title']}>Dashboard Overview</h1>
          <p className={styles['page-subtitle']}>Welcome back. Here is what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className={cx('stats-grid', 'fade-in-float', 'delay-short')}>
          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>ACTIVE CONSULTATION CASES</span>
              <div className={cx('stat-icon', 'blue')}>
                <Activity size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {activeCases.length.toString().padStart(2, '0')} <span className={cx('stat-trend', 'positive')}>LIVE</span>
              </div>
              <div className={styles['stat-desc']}>Currently being reviewed</div>
            </div>
          </div>

          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>PENDING REQUESTS</span>
              <div className={cx('stat-icon', 'yellow')}>
                <History size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {pendingRequestsCount.toString().padStart(2, '0')} <span className={cx('stat-trend', 'negative')}>-5%</span>
              </div>
              <div className={styles['stat-desc']}>Requires immediate attention</div>
            </div>
          </div>

          <div className={styles['stat-card']}>
            <div className={styles['stat-card-header']}>
              <span className={styles['stat-title']}>AVAILABLE SPECIALISTS</span>
              <div className={cx('stat-icon', 'green')}>
                <UserCheck size={18} />
              </div>
            </div>
            <div className={styles['stat-body']}>
              <div className={styles['stat-value']}>
                {totalOnline.toString().padStart(2, '0')} <span className={cx('stat-trend', 'positive')}>LIVE</span>
              </div>
              <div className={styles['stat-desc']}>{onlineSpecialists} specialists accepting cases now</div>
            </div>
          </div>

        </div>

        {/* Main Grid Content */}
        <div className={cx('content-grid', 'fade-in-float', 'delay-medium')}>
          {/* Active Consultations Table */}
          <div className={cx('card', 'consultations-card')}>
            <div className={styles['card-header']}>
              <h2 className={styles['card-title']}>Active Consultations</h2>
              <button className={styles['view-all-btn']} onClick={() => navigate('/active-cases')}>View All</button>
            </div>
            <div className={styles['table-responsive']}>
              <table className={styles['data-table']}>
                <thead>
                  <tr>
                    <th>PATIENT NAME</th>
                    <th>PRIMARY HOSPITAL</th>
                    <th>PRIORITY</th>
                    <th>LAST ACTIVITY</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCases.slice(0, 5).map((caseItem) => (
                    <tr key={caseItem.id} className={styles['row-clickable']} onClick={() => { selectCase(caseItem.id); navigate('/patient-detail'); }}>
                      <td>
                        <div
                          className={styles['patient-name']}
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseDetail(caseItem.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              openCaseDetail(caseItem.id);
                            }
                          }}
                        >
                          {caseItem.patientName}
                        </div>
                        <div className={styles['patient-meta']}>ID: {caseItem.id}</div>
                      </td>
                      <td>
                        <span
                          role="button"
                          tabIndex={0}
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openCaseDetail(caseItem.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              e.stopPropagation();
                              openCaseDetail(caseItem.id);
                            }
                          }}
                        >
                          {caseItem.hospital}
                        </span>
                      </td>
                      <td>
                        <span className={cx('priority-badge', caseItem.priority.toLowerCase())}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td>
                        <div className={styles['last-action-cell']}>
                          <span className={styles['action-text']}>{caseItem.lastAction || 'Wait for review'}</span>
                          <span className={styles['action-time']}>{caseItem.lastActiveTime || 'Just now'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeCases.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles['empty-table-cell']}>
                        <div className={styles['empty-state-content']}>
                          <History size={48} strokeWidth={1} color="rgba(67, 24, 255, 0.2)" />
                          <p>No active consultations found.</p>
                          <span className={styles['empty-desc']}>New requests will appear here once approved.</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed and Status */}
          <div className={styles['right-panel']}>
            <div className={cx('card', 'activity-card')}>
              <div className={styles['card-header']}>
                <h2 className={styles['card-title']}>Activity Feed</h2>
                <div className={styles['menu-container']}>
                  <button className={styles['icon-btn']} onClick={() => setShowActivityMenu(!showActivityMenu)}>
                    <MoreVertical size={20} />
                  </button>
                  {showActivityMenu && (
                    <div className={styles['dropdown-menu']}>
                      <button 
                        className={cx('menu-item', isRefreshing && 'spinning')}
                        onClick={handleRefreshFeed}
                        disabled={isRefreshing}
                      >
                        <RefreshCcw size={14} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className={styles['activity-list']}>
                {activities.slice(0, 2).map((item) => (
                  <div key={item.id} className={styles['activity-item']}>
                    <div className={cx('activity-icon', item.icon === 'alert' ? 'bg-red-light' : 'bg-blue-light')}>
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
              <button className={styles['view-full-history']} onClick={() => navigate('/activity-history')}>View Full History</button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
