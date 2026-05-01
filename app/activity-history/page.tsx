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
import { useLocale } from '@/context/LocaleContext';
import type { ActivityLogItem } from '@/context/AppContext';
import styles from './style.module.css';
import {
  ActivityHistoryHeader,
  ActivityTimeline,
} from './activity-history-sections';

const RANGE_OPTIONS = [
  { id: '1d', label: '1D' },
  { id: '3d', label: '3D' },
  { id: '7d', label: '7D' },
  { id: '14d', label: '14D' },
  { id: '1m', label: '1M' },
  { id: '3m', label: '3M' },
  { id: 'all', label: 'All' },
];

const RANGE_IDS = RANGE_OPTIONS.map((range) => range.id);

const ActivityHistory: React.FC = () => {
  const router = useRouter();
  const navigate = router.push;
  const { activities } = useApp();
  const { t } = useLocale();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState('3d');
  const [currentTime] = React.useState(() => Date.now());
  const getDateLimit = (range: string) => {
    const now = currentTime;
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

  return (
    <Layout>
      <div className={styles['activity-history-container']}>
        <ActivityHistoryHeader
          filteredCount={filteredActivities.length}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          rangeIds={RANGE_IDS}
          rangeOptions={RANGE_OPTIONS}
          onBack={() => navigate('/dashboard')}
          t={t}
        />

        <ActivityTimeline
          filteredActivities={filteredActivities}
          searchTerm={searchTerm}
          clearSearch={() => setSearchTerm('')}
          dateRange={dateRange}
          showAllTime={() => setDateRange('all')}
          getIcon={getIcon}
          t={t}
        />
      </div>
    </Layout>
  );
};

export default ActivityHistory;
