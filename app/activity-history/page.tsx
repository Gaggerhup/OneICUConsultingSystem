'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  ClipboardList,
  Settings,
  RefreshCcw,
  Search,
  Calendar,
  XCircle,
  Filter,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import type { ActivityLogItem } from '@/context/AppContext';
import styles from './style.module.css';

const ActivityHistory: React.FC = () => {
  const router = useRouter();
  const navigate = router.push;
  const { activities } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState('3d');
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const getDateLimit = (range: string) => {
    const now = Date.now();
    switch (range) {
      case '1d': return now - 24 * 60 * 60 * 1000;
      case '3d': return now - 3 * 24 * 60 * 60 * 1000;
      case '7d': return now - 7 * 24 * 60 * 60 * 1000;
      case '14d': return now - 14 * 24 * 60 * 60 * 1000;
      case '1m': return now - 30 * 24 * 60 * 60 * 1000;
      case '3m': return now - 90 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  const filteredActivities = activities.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      activity.title.toLowerCase().includes(searchLower) ||
      activity.desc.toLowerCase().includes(searchLower) ||
      (activity.details && activity.details.toLowerCase().includes(searchLower));

    const dateLimit = getDateLimit(dateRange);
    const matchesDate = dateRange === 'all' || activity.timestamp >= dateLimit;

    return matchesSearch && matchesDate;
  });

  const getIcon = (type: ActivityLogItem['icon']) => {
    switch (type) {
      case 'alert': return <AlertCircle size={20} className={styles['text-red']} />;
      case 'note': return <ClipboardList size={20} className={styles['text-blue']} />;
      case 'system': return <Settings size={20} className={styles['text-gray']} />;
      case 'update': return <RefreshCcw size={20} className={styles['text-green']} />;
      default: return <RefreshCcw size={20} />;
    }
  };

  const rangeIds = ['1d', '3d', '7d', '14d', '1m', '3m', 'all'];

  return (
    <Layout>
      <div className={styles['activity-history-container']}>
        <header className={cx('page-header', 'premium')}>
          <div className={styles['header-top']}>
            <div className={styles['header-left']}>
              <button className={styles['back-btn']} onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
              </button>
              <div className={styles['title-area']}>
                <div className={styles['title-with-icon']}>
                  <Activity size={22} className={styles['title-icon']} />
                  <h1 className={styles['page-title']}>Full Activity History</h1>
                </div>
                <p className={styles['page-subtitle']}>Detailed clinical activity and system logs</p>
              </div>
            </div>
            <div className={styles['header-stats']}>
              <div className={styles['stat-pill']}>
                <span className={styles['stat-value']}>{filteredActivities.length}</span>
                <span className={styles['stat-label']}>Activities Found</span>
              </div>
            </div>
          </div>

          <div className={styles['header-bottom']}>
            <div className={styles['filter-section']}>
              <div className={styles['filter-label-group']}>
                <Filter size={14} />
                <span>Time Range:</span>
              </div>
              <div className={styles['segmented-control']}>
                {[
                  { id: '1d', label: '1D' },
                  { id: '3d', label: '3D' },
                  { id: '7d', label: '7D' },
                  { id: '14d', label: '14D' },
                  { id: '1m', label: '1M' },
                  { id: '3m', label: '3M' },
                  { id: 'all', label: 'All' }
                ].map((range) => (
                  <button
                    key={range.id}
                    className={cx('segment-btn', dateRange === range.id && 'active')}
                    onClick={() => setDateRange(range.id)}
                  >
                    {range.label}
                  </button>
                ))}
                <div
                  className={styles['segment-active-bg']}
                  style={{
                    left: `calc(${(rangeIds.indexOf(dateRange) * 100) / 7}% + 2px)`,
                    width: 'calc(100% / 7 - 4px)'
                  }}
                ></div>
              </div>
            </div>

            <div className={styles['search-section']}>
              <div className={styles['premium-search']}>
                <Search size={16} className={styles['search-icon']} />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className={styles['clear-search-btn']} onClick={() => setSearchTerm('')}>
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className={styles['activity-board']}>
          <div className={styles['activity-timeline']}>
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div key={activity.id} className={cx('history-item-wrapper', 'fade-in-up')} style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className={styles['timeline-connector']}>
                    <div className={styles['timeline-dot']}></div>
                    {index !== filteredActivities.length - 1 && <div className={styles['timeline-line']}></div>}
                  </div>
                  <div className={styles['history-card']}>
                    <div className={styles['history-card-header']}>
                      <div className={styles['activity-type-icon']}>
                        {getIcon(activity.icon)}
                      </div>
                      <div className={styles['activity-main-info']}>
                        <h3 className={styles['activity-title']}>{activity.title}</h3>
                        <span className={styles['activity-timestamp']}>
                          <Calendar size={12} />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <div className={styles['history-card-body']}>
                      <p className={styles['activity-summary']}>{activity.desc}</p>
                      {activity.details && (
                        <div className={styles['activity-details-box']}>
                          <h4 className={styles['details-label']}>Details</h4>
                          <p className={styles['details-text']}>{activity.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles['no-activities-found']}>
                <Search size={48} />
                <h3>No activities found</h3>
                <p>Try adjusting your search terms or date range to find what you're looking for.</p>
                <div className={styles['no-results-actions']}>
                  {searchTerm && <button className={styles['reset-search-btn']} onClick={() => setSearchTerm('')}>Clear search</button>}
                  {dateRange !== 'all' && <button className={cx('reset-search-btn', 'secondary')} onClick={() => setDateRange('all')}>Show all time</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityHistory;
