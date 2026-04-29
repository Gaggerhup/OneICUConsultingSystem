'use client';

import React from 'react';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Filter,
  Search,
  XCircle,
} from 'lucide-react';
import type { ActivityLogItem } from '@/context/AppContext';
import { cx } from '@/lib/cx';
import styles from './style.module.css';

type TFunction = (key: string) => string;

type RangeOption = {
  id: string;
  label: string;
};

export function ActivityHistoryHeader({
  filteredCount,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  rangeIds,
  rangeOptions,
  onBack,
  t,
}: {
  filteredCount: number;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  dateRange: string;
  setDateRange: React.Dispatch<React.SetStateAction<string>>;
  rangeIds: string[];
  rangeOptions: RangeOption[];
  onBack: () => void;
  t: TFunction;
}) {
  return (
    <header className={cx(styles, 'page-header', 'premium')}>
      <div className={styles['header-top']}>
        <div className={styles['header-left']}>
          <button className={styles['back-btn']} onClick={onBack}>
            <ArrowLeft size={18} />
          </button>
          <div className={styles['title-area']}>
            <div className={styles['title-with-icon']}>
              <Activity size={22} className={styles['title-icon']} />
              <h1 className={styles['page-title']}>{t('activityHistory.title')}</h1>
            </div>
            <p className={styles['page-subtitle']}>{t('activityHistory.subtitle')}</p>
          </div>
        </div>
        <div className={styles['header-stats']}>
          <div className={styles['stat-pill']}>
            <span className={styles['stat-value']}>{filteredCount}</span>
            <span className={styles['stat-label']}>{t('activityHistory.activitiesFound')}</span>
          </div>
        </div>
      </div>

      <div className={styles['header-bottom']}>
        <div className={styles['filter-section']}>
          <div className={styles['filter-label-group']}>
            <Filter size={14} />
            <span>{t('activityHistory.timeRange')}</span>
          </div>
          <div className={styles['segmented-control']}>
            {rangeOptions.map((range) => (
              <button
                key={range.id}
                className={cx(styles, 'segment-btn', dateRange === range.id && 'active')}
                onClick={() => setDateRange(range.id)}
              >
                {range.label}
              </button>
            ))}
            <div
              className={styles['segment-active-bg']}
              style={{
                left: `calc(${(rangeIds.indexOf(dateRange) * 100) / rangeIds.length}% + 2px)`,
                width: `calc(100% / ${rangeIds.length} - 4px)`,
              }}
            />
          </div>
        </div>

        <div className={styles['search-section']}>
          <div className={styles['premium-search']}>
            <Search size={16} className={styles['search-icon']} />
            <input
              type="text"
              placeholder={t('common.searchLogs')}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
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
  );
}

export function ActivityTimeline({
  filteredActivities,
  searchTerm,
  clearSearch,
  dateRange,
  showAllTime,
  getIcon,
  t,
}: {
  filteredActivities: ActivityLogItem[];
  searchTerm: string;
  clearSearch: () => void;
  dateRange: string;
  showAllTime: () => void;
  getIcon: (type: ActivityLogItem['icon']) => React.ReactNode;
  t: TFunction;
}) {
  return (
    <div className={styles['activity-board']}>
      <div className={styles['activity-timeline']}>
        {filteredActivities.length > 0 ? (
          filteredActivities.map((activity, index) => (
            <div
              key={activity.id}
              className={cx(styles, 'history-item-wrapper', 'fade-in-up')}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
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
                      <h4 className={styles['details-label']}>{t('activityHistory.details')}</h4>
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
            <h3>{t('activityHistory.noActivities')}</h3>
            <p>{t('activityHistory.noActivitiesSubtitle')}</p>
            <div className={styles['no-results-actions']}>
              {searchTerm && (
                <button className={styles['reset-search-btn']} onClick={clearSearch}>
                  {t('activityHistory.clearSearch')}
                </button>
              )}
              {dateRange !== 'all' && (
                <button className={cx(styles, 'reset-search-btn', 'secondary')} onClick={showAllTime}>
                  {t('activityHistory.showAllTime')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
