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
import { PriorityBadge } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PagerControls, PaginationSummary } from '@/components/ui/pagination-patterns';
import { PageHeader, SearchField, TableEmptyState } from '@/components/ui/page-patterns';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { NETWORK_HOSPITALS } from '@/constants/hospitals';
import { cx } from '@/lib/cx';
import { filterActiveCases, getCaseInitials, type ActiveCaseViewFilter } from '@/lib/case-directory';
import styles from './style.module.css';

const ALL_HOSPITALS = '__all_hospitals__';

function ActiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { activeCases, selectCase, userProfile } = useApp();
  const { t, language } = useLocale();
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [hospitalFilter, setHospitalFilter] = useState<string>(ALL_HOSPITALS);
  const [viewFilter, setViewFilter] = useState<ActiveCaseViewFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);

  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);

  const URGENCY_LEVELS = [
    { id: 'all', label: t('activeCases.allCases'), value: null },
    { id: 'IMMEDIATE', label: t('activeCases.immediateLifeThreatening'), colorClass: 'color-immediate' },
    { id: 'EMERGENCY', label: t('activeCases.emergency'), colorClass: 'color-emergency' },
    { id: 'URGENT', label: t('activeCases.urgent'), colorClass: 'color-urgent' },
    { id: 'SEMI-URGENT', label: t('activeCases.semiUrgent'), colorClass: 'color-semi-urgent' },
    { id: 'NON-URGENT', label: t('activeCases.nonUrgent'), colorClass: 'color-non-urgent' },
  ];
  const hospitalOptions = [
    { value: ALL_HOSPITALS, label: t('common.allHospitals') },
    ...NETWORK_HOSPITALS.map((hospital) => ({ value: hospital, label: hospital })),
  ];

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
    navigate(`/patient-detail?caseId=${encodeURIComponent(id)}`);
  };

  const handlePatientClick = (id: string) => {
    selectCase(id);
    navigate(`/patient-detail?caseId=${encodeURIComponent(id)}`);
  };

  const filteredCases = useMemo(() => {
    return filterActiveCases(activeCases, {
      urgencyFilter,
      hospitalFilter: hospitalFilter === ALL_HOSPITALS ? null : hospitalFilter,
      viewFilter,
      userHospital: userProfile.hospital,
      searchQuery,
    });
  }, [activeCases, urgencyFilter, hospitalFilter, viewFilter, searchQuery, userProfile.hospital]);

  return (
    <Layout>
      <div className={styles['active-cases-wrapper']}>
        <PageHeader
          title={t('activeCases.title')}
          subtitle={t('activeCases.subtitle')}
          wrapperClassName={styles['page-header']}
          subtitleClassName={styles['page-subtitle']}
          leftClassName={styles['header-left']}
          rightContent={(
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('activeCases.searchPlaceholder')}
              wrapperClassName={styles['search-bar-wrap']}
              iconClassName={styles['search-icon']}
            />
          )}
        />

        <div className={styles['controls-bar']}>
          <div className={styles['filters-left']}>
            <span className={styles['filter-label']}>{t('activeCases.quickFilters')}</span>

            <div className={styles['dropdown-wrap']} ref={urgencyRef}>
              <button
                className={cx(styles, 'filter-dropdown-btn', urgencyFilter && 'active')}
                onClick={() => setIsUrgencyOpen(!isUrgencyOpen)}
              >
                <AlertCircle size={16} className={!urgencyFilter ? styles['text-purple'] : undefined} />
                <span className={styles['filter-dropdown-label']}>
                  {urgencyFilter ? URGENCY_LEVELS.find((u) => u.id === urgencyFilter)?.label : t('activeCases.urgency')}
                </span>
                <ChevronDown size={14} className={isUrgencyOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isUrgencyOpen && (
                <div className={styles['custom-dropdown-menu']}>
                  {URGENCY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      className={cx(styles, 'dropdown-item', (urgencyFilter === level.id || (!urgencyFilter && level.id === 'all')) && 'active')}
                      onClick={() => {
                        setUrgencyFilter(level.id === 'all' ? null : level.id);
                        setIsUrgencyOpen(false);
                      }}
                    >
                      <div className={styles['item-content']}>
                        {level.colorClass && <span className={cx(styles, 'color-dot', level.colorClass)}></span>}
                        {level.label}
                      </div>
                      {(urgencyFilter === level.id || (!urgencyFilter && level.id === 'all')) && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className={styles['dropdown-wrap']} ref={hospitalRef}>
              <button
                className={cx(styles, 'filter-dropdown-btn', hospitalFilter !== ALL_HOSPITALS && 'active')}
                onClick={() => setIsHospitalOpen(!isHospitalOpen)}
              >
                <span className={styles['hospital-icon-mini']}>🏥</span>
                <span className={styles['filter-dropdown-label']}>
                  {hospitalFilter === ALL_HOSPITALS ? t('activeCases.primaryHospitalLabel') : hospitalFilter}
                </span>
                <ChevronDown size={14} className={isHospitalOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isHospitalOpen && (
                <div className={cx(styles, 'custom-dropdown-menu', 'wide')}>
                  {hospitalOptions.map((option) => (
                    <button
                      key={option.value}
                      className={cx(styles, 'dropdown-item', hospitalFilter === option.value && 'active')}
                      onClick={() => {
                        setHospitalFilter(option.value);
                        setIsHospitalOpen(false);
                      }}
                    >
                      {option.label}
                      {hospitalFilter === option.value && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className={styles['filter-toggles']}>
            <button
              className={cx(styles, 'toggle-btn', viewFilter === 'All' && 'active')}
              onClick={() => setViewFilter('All')}
            >
              {t('activeCases.allCases')}
            </button>
            <button
              className={cx(styles, 'toggle-btn', viewFilter === 'Internal' && 'active')}
              onClick={() => setViewFilter('Internal')}
            >
              {t('activeCases.internal')}
            </button>
            <button
              className={cx(styles, 'toggle-btn', viewFilter === 'External' && 'active')}
              onClick={() => setViewFilter('External')}
            >
              {t('activeCases.external')}
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={styles['data-table']}>
            <thead>
              <tr>
                <th>{t('activeCases.caseId')}</th>
                <th>{t('activeCases.patientName')}</th>
                <th>{t('activeCases.primaryHospital')}</th>
                <th>{t('activeCases.priorityUrgency')}</th>
                <th>{t('activeCases.lastActivity')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr
                  key={caseItem.id}
                  onClick={() => handleRowClick(caseItem.id)}
                  className={cx(styles, 'table-row-hover', 'row-clickable')}
                >
                  <td className={styles['case-id-cell']} data-label={t('activeCases.caseId')}>
                    <span className={styles['id-badge']}>#{caseItem.id}</span>
                  </td>
                  <td data-label={t('activeCases.patientName')}>
                    <CasePatientCell
                      wrapperClassName={styles['patient-cell']}
                      leading={(
                        <span
                          className={cx(styles, 
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
                          {getCaseInitials(caseItem.patientName)}
                        </span>
                      )}
                      title={caseItem.patientName}
                      titleClassName={cx(styles, 'font-bold', 'text-dark')}
                      onOpen={() => handlePatientClick(caseItem.id)}
                    />
                  </td>
                  <td data-label={t('activeCases.primaryHospital')}>
                    <div className={styles['hospital-cell']}>
                      <ClickableCaseText onOpen={() => handlePatientClick(caseItem.id)}>
                        {caseItem.hospital}
                      </ClickableCaseText>
                    </div>
                  </td>
                  <td data-label={t('activeCases.urgency')}>
                    <PriorityBadge
                      value={URGENCY_LEVELS.find((u) => u.id === caseItem.priority)?.label || caseItem.priority}
                      baseClassName={styles['priority-badge-large']}
                      variantClassName={styles[caseItem.priority.toLowerCase()]}
                    />
                  </td>
                  <td data-label={t('activeCases.lastActivity')}>
                    <div className={cx(styles, 'activity-cell', 'text-gray')}>
                      <Clock size={14} className={styles['mr-1']} />
                      {caseItem.lastActiveTime || caseItem.date}
                    </div>
                  </td>
                  <td data-label={t('requests.actions')} onClick={(e) => e.stopPropagation()}>
                    <button className={styles['more-btn']}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  cellClassName={styles['empty-table-cell']}
                  contentClassName={styles['empty-state']}
                  icon={<Filter size={40} strokeWidth={1.5} />}
                  message={t('activeCases.noMatching')}
                  action={(
                    <button
                      className={styles['reset-filters-btn']}
                      onClick={() => {
                        setUrgencyFilter(null);
                        setHospitalFilter(ALL_HOSPITALS);
                        setViewFilter('All');
                        setSearchQuery('');
                      }}
                    >
                      {t('activeCases.resetAllFilters')}
                    </button>
                  )}
                />
              )}
            </tbody>
          </table>
        </div>

        <PaginationSummary
          wrapperClassName={styles['pagination-bar']}
          textClassName={styles['pagination-text']}
          controls={(
            <PagerControls
              wrapperClassName={styles['pagination-controls']}
              navButtonClassName={styles['page-nav-btn']}
              activePageClassName={cx(styles, 'page-num-btn', 'active')}
              prevIcon={<ChevronLeft size={16} />}
              nextIcon={<ChevronRight size={16} />}
            />
          )}
        >
          {t('activeCases.showing')} <strong>{filteredCases.length}</strong> of <strong>{activeCases.length}</strong> {t('activeCases.activeCasesLabel')}
        </PaginationSummary>
      </div>
    </Layout>
  );
}

export default ActiveCases;
