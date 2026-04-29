'use client';
import {
  Download,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  RefreshCcw
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { StatusPill } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PaginationSummary } from '@/components/ui/pagination-patterns';
import { PageHeader, SearchField, TableEmptyState } from '@/components/ui/page-patterns';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { NETWORK_HOSPITALS } from '@/constants/hospitals';
import { cx } from '@/lib/cx';
import { filterArchiveCases, type ArchiveDateRange } from '@/lib/case-directory';
import styles from './style.module.css';

const DATE_RANGES: ArchiveDateRange[] = [
  { label: 'All Time', days: Infinity },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 12 Months', days: 365 },
];

const OUTCOMES = ['All Outcomes', 'Discharge', 'Referred', 'Dead'];

function ArchiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { archiveCases, reactivateCase, selectCase } = useApp();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState(t('common.allHospitals'));
  const [outcomeFilter, setOutcomeFilter] = useState(t('common.allOutcomes'));
  const [dateRange, setDateRange] = useState(DATE_RANGES[2]);
  const [currentTime] = useState(() => Date.now());

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate('/patient-detail');
  };

  const filteredCases = useMemo(() => {
    return filterArchiveCases(archiveCases, {
      searchQuery,
      hospitalFilter,
      allHospitalsLabel: t('common.allHospitals'),
      outcomeFilter,
      allOutcomesLabel: t('common.allOutcomes'),
      dateRange,
      currentTime,
    });
  }, [archiveCases, searchQuery, hospitalFilter, outcomeFilter, dateRange, currentTime, t]);

  return (
    <Layout>
      <div className={styles['archive-page-wrapper']}>
        <PageHeader
          title={t('archiveCases.title')}
          subtitle={t('archiveCases.subtitle')}
          wrapperClassName={styles['page-header-split']}
          subtitleClassName={styles['page-subtitle']}
          rightContent={(
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('archiveCases.searchPlaceholder')}
              wrapperClassName={styles['search-bar-wrap-archive']}
              iconClassName={styles['search-icon']}
            />
          )}
        />

        <div className={styles['advanced-filters-box']}>
          <div className={styles['filter-row']}>
            <span className={styles['filter-label']}><Filter size={14}/> {t('archiveCases.filters')}</span>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
                {[t('common.allHospitals'), ...NETWORK_HOSPITALS].map((h) => <option key={h}>{h}</option>)}
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                {[t('common.allOutcomes'), 'Discharge', 'Referred', 'Dead'].map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={`${styles['filter-select-wrapper']} ${styles['date-select']}`}>
              <Calendar size={14} className={cx(styles, 'mr-2', 'text-gray')} />
              <select
                className={`${styles['filter-select']} ${styles['auto-width']}`}
                value={dateRange.label}
                onChange={(e) => {
                  const range = DATE_RANGES.find((r) => r.label === e.target.value);
                  if (range) setDateRange(range);
                }}
              >
                {DATE_RANGES.map((r) => <option key={r.label}>{r.label}</option>)}
              </select>
            </div>

            <button
              className={styles['clear-filters-btn']}
              onClick={() => {
                setSearchQuery('');
                setHospitalFilter(t('common.allHospitals'));
                setOutcomeFilter(t('common.allOutcomes'));
                setDateRange(DATE_RANGES[0]);
              }}
            >
              {t('archiveCases.clearAll')}
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={`${styles['data-table']} ${styles['archive-table']}`}>
            <thead>
              <tr>
                <th>{t('archiveCases.caseId')}</th>
                <th>{t('archiveCases.patientName')}</th>
                <th>{t('archiveCases.hospital')}</th>
                <th>{t('archiveCases.closeDate')}</th>
                <th>{t('archiveCases.statusOutcome')}</th>
                <th>{t('archiveCases.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={cx(styles, 'case-id', 'text-gray', 'font-medium')} data-label={t('archiveCases.caseId')}>#{c.id}</td>
                  <td data-label={t('archiveCases.patientName')}>
                    <CasePatientCell
                      wrapperClassName={styles['patient-stack']}
                      title={c.patientName}
                      titleClassName={cx(styles, 'font-bold', 'text-dark')}
                      meta={`${c.age}${c.gender?.charAt(0)} • ${c.priority}`}
                      metaClassName={styles['demographics-sub']}
                      onOpen={() => openCaseDetail(c.id)}
                    />
                  </td>
                  <td className={styles['text-gray']} data-label={t('archiveCases.hospital')}>
                    <ClickableCaseText onOpen={() => openCaseDetail(c.id)}>
                      {c.hospital}
                    </ClickableCaseText>
                  </td>
                  <td className={styles['text-gray']} data-label={t('archiveCases.closeDate')}>{c.closeDate || c.date}</td>
                  <td data-label={t('archiveCases.statusOutcome')}>
                    <StatusPill
                      value={c.status}
                      className={`${styles['status-pill']} ${styles[`status-${c.status.toLowerCase()}`]}`}
                    />
                  </td>
                  <td data-label="Actions">
                    <div className={styles['archive-actions']}>
                      <button className={styles['action-link-btn']} title={t('archiveCases.viewRecord')}>
                        <Download size={16} />
                      </button>
                      <button className={styles['reactivate-btn']} onClick={() => reactivateCase(c.id)} title={t('archiveCases.reactivate')}>
                        <RefreshCcw size={16} /> {t('archiveCases.reactivate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  cellClassName={styles['empty-cell']}
                  contentClassName={styles['empty-state']}
                  icon={<Filter size={40} strokeWidth={1.5} />}
                  message={t('archiveCases.noResults')}
                />
              )}
            </tbody>
          </table>
        </div>

        <PaginationSummary
          wrapperClassName={styles['pagination-bar']}
          textClassName={styles['pagination-text']}
        >
          {t('archiveCases.showing')} <strong>{filteredCases.length}</strong> of <strong>{archiveCases.length}</strong> {t('archiveCases.records')}
        </PaginationSummary>
      </div>
    </Layout>
  );
}

export default ArchiveCases;
