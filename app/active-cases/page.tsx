'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  AlertCircle,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import styles from './style.module.css';

const URGENCY_LEVELS = [
  { id: 'all', label: 'All Urgency', value: null },
  { id: 'IMMEDIATE', label: 'Immediate Life-threatening', colorClass: 'color-immediate' },
  { id: 'EMERGENCY', label: 'Emergency', colorClass: 'color-emergency' },
  { id: 'URGENT', label: 'Urgency', colorClass: 'color-urgent' },
  { id: 'SEMI-URGENT', label: 'Semi-urgency', colorClass: 'color-semi-urgent' },
  { id: 'NON-URGENT', label: 'Non-urgency', colorClass: 'color-non-urgent' },
];

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

function ActiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { activeCases, selectCase, userProfile } = useApp();
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [hospitalFilter, setHospitalFilter] = useState<string>('All Hospitals');
  const [viewFilter, setViewFilter] = useState<'All' | 'Internal' | 'External'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);

  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (urgencyRef.current && !urgencyRef.current.contains(event.target as Node)) setIsUrgencyOpen(false);
      if (hospitalRef.current && !hospitalRef.current.contains(event.target as Node)) setIsHospitalOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRowClick = (id: string) => {
    selectCase(id);
    navigate('/patient-detail');
  };

  const handlePatientClick = (id: string) => {
    selectCase(id);
    navigate('/patient-detail');
  };

  const filteredCases = useMemo(() => {
    return activeCases.filter((c) => {
      if (urgencyFilter && c.priority !== urgencyFilter) return false;
      if (hospitalFilter !== 'All Hospitals' && c.hospital !== hospitalFilter) return false;

      if (viewFilter === 'Internal') {
        if (c.hospital !== userProfile.hospital) return false;
      } else if (viewFilter === 'External') {
        if (c.hospital === userProfile.hospital) return false;
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.patientName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.hospital.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activeCases, urgencyFilter, hospitalFilter, viewFilter, searchQuery, userProfile.hospital]);

  return (
    <Layout>
      <div className={styles['active-cases-wrapper']}>
        <div className={styles['page-header']}>
          <div className={styles['header-left']}>
            <h1>Active Cases</h1>
            <p className={styles['page-subtitle']}>Monitor and manage high-priority interhospital consultations.</p>
          </div>
          <div className={styles['search-bar-wrap']}>
            <Search size={18} className={styles['search-icon']} />
            <input
              type="text"
              placeholder="Search by ID or Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className={styles['controls-bar']}>
          <div className={styles['filters-left']}>
            <span className={styles['filter-label']}>QUICK FILTERS:</span>

            <div className={styles['dropdown-wrap']} ref={urgencyRef}>
              <button
                className={cx('filter-dropdown-btn', urgencyFilter && 'active')}
                onClick={() => setIsUrgencyOpen(!isUrgencyOpen)}
              >
                <AlertCircle size={16} className={!urgencyFilter ? styles['text-purple'] : undefined} />
                {urgencyFilter ? URGENCY_LEVELS.find((u) => u.id === urgencyFilter)?.label : 'Urgency'}
                <ChevronDown size={14} className={isUrgencyOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isUrgencyOpen && (
                <div className={styles['custom-dropdown-menu']}>
                  {URGENCY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      className={cx('dropdown-item', urgencyFilter === level.id && 'active')}
                      onClick={() => {
                        setUrgencyFilter(level.id === 'all' ? null : level.id);
                        setIsUrgencyOpen(false);
                      }}
                    >
                      <div className={styles['item-content']}>
                        {level.colorClass && <span className={cx('color-dot', level.colorClass)}></span>}
                        {level.label}
                      </div>
                      {urgencyFilter === level.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles['dropdown-wrap']} ref={hospitalRef}>
              <button
                className={cx('filter-dropdown-btn', hospitalFilter !== 'All Hospitals' && 'active')}
                onClick={() => setIsHospitalOpen(!isHospitalOpen)}
              >
                <span className={styles['hospital-icon-mini']}>🏥</span>
                {hospitalFilter === 'All Hospitals' ? 'Primary Hospital' : hospitalFilter}
                <ChevronDown size={14} className={isHospitalOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isHospitalOpen && (
                <div className={cx('custom-dropdown-menu', 'wide')}>
                  {HOSPITALS.map((h) => (
                    <button
                      key={h}
                      className={cx('dropdown-item', hospitalFilter === h && 'active')}
                      onClick={() => {
                        setHospitalFilter(h);
                        setIsHospitalOpen(false);
                      }}
                    >
                      {h}
                      {hospitalFilter === h && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles['filter-toggles']}>
            <button
              className={cx('toggle-btn', viewFilter === 'All' && 'active')}
              onClick={() => setViewFilter('All')}
            >
              All Cases
            </button>
            <button
              className={cx('toggle-btn', viewFilter === 'Internal' && 'active')}
              onClick={() => setViewFilter('Internal')}
            >
              Internal
            </button>
            <button
              className={cx('toggle-btn', viewFilter === 'External' && 'active')}
              onClick={() => setViewFilter('External')}
            >
              External
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={styles['data-table']}>
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>PATIENT NAME</th>
                <th>PRIMARY HOSPITAL</th>
                <th>PRIORITY / URGENCY</th>
                <th>LAST ACTIVITY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleRowClick(caseItem.id)}
                  className={cx('table-row-hover', 'row-clickable')}
                >
                  <td className={styles['case-id-cell']}>
                    <span className={styles['id-badge']}>#{caseItem.id}</span>
                  </td>
                  <td>
                    <div className={styles['patient-cell']}>
                      <span
                        className={cx(
                          'patient-avatar',
                          caseItem.priority === 'IMMEDIATE'
                            ? 'bg-red'
                            : caseItem.priority === 'EMERGENCY'
                              ? 'bg-pink'
                              : caseItem.priority === 'URGENT'
                                ? 'bg-yellow'
                                : caseItem.priority === 'SEMI-URGENT'
                                  ? 'bg-green'
                                  : 'bg-gray'
                        )}
                      >
                        {caseItem.patientName.split(' ').map((n) => n[0]).join('')}
                      </span>
                      <span
                        className={cx('font-bold', 'text-dark')}
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientClick(caseItem.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePatientClick(caseItem.id);
                          }
                        }}
                      >
                        {caseItem.patientName}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className={styles['hospital-cell']}>
                      <span
                        role="button"
                        tabIndex={0}
                        style={{ cursor: 'pointer' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePatientClick(caseItem.id);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePatientClick(caseItem.id);
                          }
                        }}
                      >
                        {caseItem.hospital}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={cx('priority-badge-large', caseItem.priority.toLowerCase())}>
                      {URGENCY_LEVELS.find((u) => u.id === caseItem.priority)?.label || caseItem.priority}
                    </span>
                  </td>
                  <td>
                    <div className={cx('activity-cell', 'text-gray')}>
                      <Clock size={14} className={styles['mr-1']} />
                      {caseItem.lastActiveTime || caseItem.date}
                    </div>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button className={styles['more-btn']}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} className={styles['empty-table-cell']}>
                    <div className={styles['empty-state']}>
                      <Filter size={40} strokeWidth={1.5} />
                      <p>No matching active cases found.</p>
                      <button
                        className={styles['reset-filters-btn']}
                        onClick={() => {
                          setUrgencyFilter(null);
                          setHospitalFilter('All Hospitals');
                          setViewFilter('All');
                          setSearchQuery('');
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles['pagination-bar']}>
          <span className={styles['pagination-text']}>Showing <strong>{filteredCases.length}</strong> of <strong>{activeCases.length}</strong> active cases</span>
          <div className={styles['pagination-controls']}>
            <button className={styles['page-nav-btn']}><ChevronLeft size={16} /></button>
            <button className={cx('page-num-btn', 'active')}>1</button>
            <button className={styles['page-nav-btn']}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ActiveCases;
