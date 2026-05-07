'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  CornerDownRight,
  Filter,
  Check,
  Building2,
  Activity,
  ShieldCheck,
  Database,
  X,
  XCircle
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
import { filterActiveCases, getCaseInitials, getVisibleHospitalFilterOptions, type ActiveCaseViewFilter } from '@/lib/case-directory';
import { canAccessHospital, normalizeHospitalName } from '@/lib/provider-profile';
import styles from './style.module.css';

const ALL_HOSPITALS = '__all_hospitals__';
type CloseOutcome = 'Discharge' | 'Referred' | 'Dead' | 'Step Down';

function ActiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { activeCases, closeCase, selectCase, userProfile } = useApp();
  const { t, language } = useLocale();
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [hospitalFilter, setHospitalFilter] = useState<string>(ALL_HOSPITALS);
  const [viewFilter, setViewFilter] = useState<ActiveCaseViewFilter>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);
  const [closingCaseId, setClosingCaseId] = useState<string | null>(null);
  const [closeOutcome, setCloseOutcome] = useState<CloseOutcome>('Discharge');

  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);

  const URGENCY_LEVELS = useMemo(() => [
    { id: 'all', label: t('activeCases.allCases'), value: null },
    { id: 'IMMEDIATE', label: t('activeCases.immediateLifeThreatening'), colorClass: 'color-immediate' },
    { id: 'EMERGENCY', label: t('activeCases.emergency'), colorClass: 'color-emergency' },
    { id: 'URGENT', label: t('activeCases.urgent'), colorClass: 'color-urgent' },
    { id: 'SEMI-URGENT', label: t('activeCases.semiUrgent'), colorClass: 'color-semi-urgent' },
    { id: 'NON-URGENT', label: t('activeCases.nonUrgent'), colorClass: 'color-non-urgent' },
  ], [t]);
  const normalizedUserHospital = useMemo(() => normalizeHospitalName(userProfile.hospital), [userProfile.hospital]);
  const hospitalOptions = useMemo(() => getVisibleHospitalFilterOptions(
    NETWORK_HOSPITALS,
    userProfile.hospital,
    { value: ALL_HOSPITALS, label: t('common.allHospitals') },
  ), [t, userProfile.hospital]);

  useEffect(() => {
    if (hospitalFilter === ALL_HOSPITALS) return;
    if (!hospitalOptions.some((option) => option.value === hospitalFilter)) {
      setHospitalFilter(hospitalOptions[0]?.value || ALL_HOSPITALS);
    }
  }, [hospitalFilter, hospitalOptions]);

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

  const openCloseCaseModal = (id: string) => {
    setClosingCaseId(id);
    setCloseOutcome('Discharge');
  };

  const handleConfirmCloseCase = async () => {
    if (!closingCaseId) return;
    await closeCase(closingCaseId, closeOutcome);
    setClosingCaseId(null);
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

  const visibleCases = useMemo(
    () => activeCases.filter((caseItem) => canAccessHospital(userProfile.hospital, caseItem.hospital)),
    [activeCases, userProfile.hospital],
  );

  const hospitalDashboardCases = useMemo(() => {
    return filterActiveCases(activeCases, {
      urgencyFilter,
      hospitalFilter: null,
      viewFilter,
      userHospital: userProfile.hospital,
      searchQuery,
    });
  }, [activeCases, urgencyFilter, viewFilter, searchQuery, userProfile.hospital]);

  const urgencyDashboardCases = useMemo(() => {
    return filterActiveCases(activeCases, {
      urgencyFilter: null,
      hospitalFilter: hospitalFilter === ALL_HOSPITALS ? null : hospitalFilter,
      viewFilter,
      userHospital: userProfile.hospital,
      searchQuery,
    });
  }, [activeCases, hospitalFilter, viewFilter, searchQuery, userProfile.hospital]);

  const hospitalCaseSummary = useMemo(() => {
    const counts = new Map<string, number>();

    hospitalDashboardCases.forEach((caseItem) => {
      counts.set(caseItem.hospital, (counts.get(caseItem.hospital) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([hospital, count]) => ({ hospital, count }))
      .sort((a, b) => b.count - a.count || a.hospital.localeCompare(b.hospital, language === 'th' ? 'th' : 'en'));
  }, [hospitalDashboardCases, language]);

  const urgencyCaseSummary = useMemo(() => {
    const urgencyLevels = URGENCY_LEVELS.filter((level) => level.id !== 'all');

    return urgencyLevels.map((level) => ({
      ...level,
      count: urgencyDashboardCases.filter((caseItem) => caseItem.priority === level.id).length,
    }));
  }, [URGENCY_LEVELS, urgencyDashboardCases]);

  const maxHospitalCases = Math.max(1, ...hospitalCaseSummary.map((item) => item.count));
  const maxUrgencyCases = Math.max(1, ...urgencyCaseSummary.map((item) => item.count));
  const internalCaseCount = visibleCases.filter((caseItem) => normalizeHospitalName(caseItem.hospital) === normalizedUserHospital).length;
  const externalCaseCount = visibleCases.length - internalCaseCount;

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

        <div className={styles['metric-grid']}>
          <div className={styles['metric-card']}>
            <Database size={20} />
            <span>{t('activeCases.allCases')}</span>
            <strong>{visibleCases.length}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Filter size={20} />
            <span>{language === 'th' ? 'หลังกรอง' : 'Filtered'}</span>
            <strong>{filteredCases.length}</strong>
          </div>
          <div className={styles['metric-card']}>
            <ShieldCheck size={20} />
            <span>{t('activeCases.internal')}</span>
            <strong>{internalCaseCount}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Activity size={20} />
            <span>{t('activeCases.external')}</span>
            <strong>{externalCaseCount}</strong>
          </div>
        </div>

        <section className={styles['monitor-dashboard']} aria-label={t('activeCases.monitorDashboard')}>
          <div className={styles['dashboard-panel']}>
            <div className={styles['dashboard-panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('activeCases.monitorDashboard')}</span>
                <h2>{t('activeCases.casesByHospital')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <Building2 size={18} />
                <strong>{hospitalDashboardCases.length}</strong>
              </div>
            </div>
            <div className={styles['hospital-monitor-grid']}>
              {hospitalCaseSummary.length > 0 ? hospitalCaseSummary.map((item) => (
                <button
                  type="button"
                  key={item.hospital}
                  className={cx(styles, 'hospital-monitor-card', hospitalFilter === item.hospital && 'selected')}
                  onClick={() => setHospitalFilter((current) => current === item.hospital ? ALL_HOSPITALS : item.hospital)}
                >
                  <span className={styles['monitor-card-label']}>{item.hospital}</span>
                  <span className={styles['monitor-card-count']}>{item.count}</span>
                  <span className={styles['monitor-meter']} aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (item.count / maxHospitalCases) * 100)}%` }} />
                  </span>
                </button>
              )) : (
                <div className={styles['monitor-empty']}>{t('activeCases.noHospitalCases')}</div>
              )}
            </div>
          </div>

          <div className={styles['dashboard-panel']}>
            <div className={styles['dashboard-panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('activeCases.urgency')}</span>
                <h2>{t('activeCases.casesByUrgency')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <Activity size={18} />
                <strong>{urgencyDashboardCases.length}</strong>
              </div>
            </div>
            <div className={styles['urgency-monitor-grid']}>
              {urgencyCaseSummary.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={cx(styles, 'urgency-monitor-card', item.colorClass, urgencyFilter === item.id && 'selected')}
                  onClick={() => setUrgencyFilter((current) => current === item.id ? null : item.id)}
                >
                  <span className={cx(styles, 'color-dot', item.colorClass)} />
                  <span className={styles['monitor-card-label']}>{item.label}</span>
                  <span className={styles['monitor-card-count']}>{item.count}</span>
                  <span className={styles['monitor-meter']} aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (item.count / maxUrgencyCases) * 100)}%` }} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

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
                    <button
                      type="button"
                      className={styles['close-case-btn']}
                      onClick={() => openCloseCaseModal(caseItem.id)}
                    >
                      <XCircle size={16} />
                      Close Case
                    </button>
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
          controls={filteredCases.length > 0 ? (
            <PagerControls
              wrapperClassName={styles['pagination-controls']}
              navButtonClassName={styles['page-nav-btn']}
              activePageClassName={cx(styles, 'page-num-btn', 'active')}
              prevIcon={<ChevronLeft size={16} />}
              nextIcon={<ChevronRight size={16} />}
            />
          ) : null}
        >
          {t('activeCases.showing')} <strong>{filteredCases.length}</strong> {t('common.of')} <strong>{activeCases.length}</strong> {t('activeCases.activeCasesLabel')}
        </PaginationSummary>

        {closingCaseId ? (
          <div className={styles['close-overlay']} onClick={() => setClosingCaseId(null)}>
            <div className={styles['close-modal']} onClick={(event) => event.stopPropagation()}>
              <div className={styles['close-modal-hd']}>
                <CheckCircle size={22} color="#10b981" />
                <h2>{t('patientDetail.closeConsultationCase')}</h2>
                <button type="button" onClick={() => setClosingCaseId(null)}><X size={18} /></button>
              </div>
              <p className={styles['close-modal-sub']}>{t('patientDetail.closeCaseHint')}</p>
              <div className={styles['outcome-grid']}>
                {(['Discharge', 'Step Down', 'Referred', 'Dead'] as const).map((outcome) => {
                  const icons: Record<CloseOutcome, React.ReactNode> = {
                    Discharge: <CheckCircle size={18} />,
                    'Step Down': <CornerDownRight size={18} />,
                    Referred: <CornerDownRight size={18} />,
                    Dead: <X size={18} />,
                  };
                  const colors: Record<CloseOutcome, string> = {
                    Discharge: '#10b981',
                    'Step Down': '#f59e0b',
                    Referred: '#3b82f6',
                    Dead: '#64748b',
                  };

                  return (
                    <button
                      key={outcome}
                      type="button"
                      className={cx(styles, 'outcome-btn', closeOutcome === outcome && 'active')}
                      style={closeOutcome === outcome ? { borderColor: colors[outcome], background: `${colors[outcome]}10`, color: colors[outcome] } : undefined}
                      onClick={() => setCloseOutcome(outcome)}
                    >
                      <span className={styles['outcome-icon']} style={{ color: colors[outcome] }}>{icons[outcome]}</span>
                      {outcome}
                    </button>
                  );
                })}
              </div>
              <div className={styles['close-modal-ft']}>
                <button type="button" className={styles['close-cancel-btn']} onClick={() => setClosingCaseId(null)}>
                  {t('patientDetail.cancelLabel')}
                </button>
                <button type="button" className={styles['close-confirm-btn']} onClick={() => void handleConfirmCloseCase()}>
                  {t('patientDetail.confirmAndClose')}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export default ActiveCases;
