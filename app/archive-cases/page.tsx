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
import { useApp } from '@/context/AppContext';
import styles from './style.module.css';

const HOSPITALS = [
  'All Hospitals',
  'โรงพยาบาลพุทธชินราช พิษณุโลก',
  'โรงพยาบาลวังทอง',
  'โรงพยาบาลวัดโบสถ์',
  'โรงพยาบาลพรหมพิราม',
  'โรงพยาบาลบางระกำ',
  'โรงพยาบาลบางกระทุ่ม',
  'โรงพยาบาลเนินมะปราง',
  'โรงพยาบาลสมเด็จพระยุพราชนครไทย',
  'โรงพยาบาลชาติตระการ'
];

const DATE_RANGES = [
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
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All Hospitals');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [dateRange, setDateRange] = useState(DATE_RANGES[2]);

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate('/patient-detail');
  };

  const filteredCases = useMemo(() => {
    return archiveCases.filter((c) => {
      const matchesSearch = searchQuery === '' ||
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesHospital = hospitalFilter === 'All Hospitals' || c.hospital === hospitalFilter;
      const matchesOutcome = outcomeFilter === 'All Outcomes' || c.status === outcomeFilter;

      let matchesDate = true;
      if (dateRange.days !== Infinity && c.closedTimestamp) {
        const diffDays = (Date.now() - c.closedTimestamp) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= dateRange.days;
      }

      return matchesSearch && matchesHospital && matchesOutcome && matchesDate;
    });
  }, [archiveCases, searchQuery, hospitalFilter, outcomeFilter, dateRange]);

  return (
    <Layout>
      <div className={styles['archive-page-wrapper']}>
        <div className={styles['page-header-split']}>
          <div>
            <h1>Archive Cases</h1>
            <p className={styles['page-subtitle']}>Review and manage historical interhospital consultation records.</p>
          </div>
          <div className={styles['search-bar-wrap-archive']}>
            <Search size={18} className={styles['search-icon']} />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles['advanced-filters-box']}>
          <div className={styles['filter-row']}>
            <span className={styles['filter-label']}><Filter size={14}/> FILTERS</span>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
                {HOSPITALS.map((h) => <option key={h}>{h}</option>)}
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                {OUTCOMES.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={`${styles['filter-select-wrapper']} ${styles['date-select']}`}>
              <Calendar size={14} className={cx('mr-2', 'text-gray')} />
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
                setHospitalFilter('All Hospitals');
                setOutcomeFilter('All Outcomes');
                setDateRange(DATE_RANGES[0]);
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={`${styles['data-table']} ${styles['archive-table']}`}>
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>PATIENT NAME</th>
                <th>HOSPITAL</th>
                <th>CLOSE DATE</th>
                <th>STATUS / OUTCOME</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={cx('case-id', 'text-gray', 'font-medium')}>#{c.id}</td>
                  <td>
                    <div className={styles['patient-stack']}>
                      <span
                        className={cx('font-bold', 'text-dark')}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openCaseDetail(c.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            openCaseDetail(c.id);
                          }
                        }}
                      >
                        {c.patientName}
                      </span>
                      <span className={styles['demographics-sub']}>{c.age}{c.gender?.charAt(0)} • {c.priority}</span>
                    </div>
                  </td>
                  <td className={styles['text-gray']}>
                    <span
                      role="button"
                      tabIndex={0}
                      style={{ cursor: 'pointer' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openCaseDetail(c.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          e.stopPropagation();
                          openCaseDetail(c.id);
                        }
                      }}
                    >
                      {c.hospital}
                    </span>
                  </td>
                  <td className={styles['text-gray']}>{c.closeDate || c.date}</td>
                  <td>
                    <span className={`${styles['status-pill']} ${styles[`status-${c.status.toLowerCase()}`]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles['archive-actions']}>
                      <button className={styles['action-link-btn']} title="View Record">
                        <Download size={16} />
                      </button>
                      <button className={styles['reactivate-btn']} onClick={() => reactivateCase(c.id)} title="Reactivate Case">
                        <RefreshCcw size={16} /> Reactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles['empty-cell']}>
                    <div className={styles['empty-state']}>
                      <Filter size={40} strokeWidth={1.5} />
                      <p>No archived records found matching those filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles['pagination-bar']}>
          <span className={styles['pagination-text']}>Showing <strong>{filteredCases.length}</strong> of <strong>{archiveCases.length}</strong> records</span>
        </div>
      </div>
    </Layout>
  );
}

export default ArchiveCases;
