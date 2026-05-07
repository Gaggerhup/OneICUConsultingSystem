'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Activity, AlertCircle, Building2, Check, CheckCircle2, ChevronDown, Clock3, Database, Filter, Power, Search, ShieldCheck, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { PriorityBadge } from '@/components/ui/case-badges';
import { ClickableCaseText } from '@/components/ui/case-patterns';
import { PageHeader, TableEmptyState } from '@/components/ui/page-patterns';
import { activateMonitoredPatientConsultRequest, listMonitoredCases } from '@/actions/case-monitor';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { cx } from '@/lib/cx';
import { getCaseInitials, getVisibleHospitalFilterOptions, matchesCaseSearch } from '@/lib/case-directory';
import { NETWORK_HOSPITALS } from '@/constants/hospitals';
import styles from './style.module.css';

type MonitorCase = Awaited<ReturnType<typeof listMonitoredCases>>[number];
type MonitorTab = 'all' | 'unregistered' | 'registered' | 'active';

const ALL_URGENCIES = '__all_urgencies__';
const ALL_HOSPITALS = '__all_hospitals__';

const tabConfig: { id: MonitorTab; labelKey: string }[] = [
  { id: 'all', labelKey: 'caseMonitor.all' },
  { id: 'unregistered', labelKey: 'caseMonitor.unregistered' },
  { id: 'registered', labelKey: 'caseMonitor.registered' },
  { id: 'active', labelKey: 'caseMonitor.consultCase' },
];

const urgencyConfig = [
  { value: ALL_URGENCIES, labelKey: 'caseMonitor.allUrgencyLevels' },
  { value: 'IMMEDIATE', labelKey: 'activeCases.immediateLifeThreatening' },
  { value: 'EMERGENCY', labelKey: 'activeCases.emergency' },
  { value: 'URGENT', labelKey: 'activeCases.urgent' },
  { value: 'SEMI-URGENT', labelKey: 'activeCases.semiUrgent' },
  { value: 'NON-URGENT', labelKey: 'activeCases.nonUrgent' },
];

const dashboardUrgencies = urgencyConfig.filter((item) => item.value !== ALL_URGENCIES);

function statusLabel(status: string, t: (key: string) => string) {
  if (status === 'Unregistered') return t('caseMonitor.unregistered');
  if (status === 'Inactive') return t('caseMonitor.inactive');
  if (status === 'Pending') return t('caseMonitor.pending');
  if (status === 'Active') return t('caseMonitor.active');
  if (status === 'Critical') return 'Critical';
  if (status === 'Approved') return 'Approved';
  if (status === 'Declined') return 'Declined';
  if (status === 'Cancelled') return 'Cancelled';
  if (status === 'Archived') return 'Archived';
  if (status === 'Discharge') return 'Discharge';
  if (status === 'Referred') return 'Referred';
  if (status === 'Dead') return 'Dead';
  if (status === 'Step Down') return 'Step Down';
  return status;
}

function getStatusClass(status: string) {
  if (status === 'Unregistered') return 'unregistered';
  if (status === 'Inactive') return 'inactive';
  if (status === 'Pending') return 'pending';
  if (status === 'Active') return 'active-consult';
  if (status === 'Critical') return 'critical';
  if (status === 'Approved') return 'approved';
  if (status === 'Declined') return 'declined';
  if (status === 'Cancelled') return 'cancelled';
  if (status === 'Discharge') return 'discharge';
  if (status === 'Referred') return 'referred';
  if (status === 'Dead') return 'dead';
  if (status === 'Step Down') return 'step-down';
  return 'closed';
}

function isPendingConsultRequest(status: string) {
  return status === 'Pending';
}

function canActivateConsultRequest(status: string) {
  return !['Pending', 'Active', 'Approved', 'Critical'].includes(status);
}

function CaseMonitor() {
  const { push: navigate } = useRouter();
  const { t } = useLocale();
  const { fetchData, selectCase, showToast, userProfile } = useApp();
  const [cases, setCases] = useState<MonitorCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<MonitorTab>('all');
  const [urgencyFilter, setUrgencyFilter] = useState(ALL_URGENCIES);
  const [hospitalFilter, setHospitalFilter] = useState(ALL_HOSPITALS);
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [workingPatientId, setWorkingPatientId] = useState<string | null>(null);
  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const nextCases = await listMonitoredCases(userProfile.hospital);
      setCases(nextCases);
    } catch (error) {
      console.error('[CaseMonitor] Unable to load monitored cases:', error);
      showToast(t('caseMonitor.loadFailed'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, t, userProfile.hospital]);

  useEffect(() => {
    void loadCases();
  }, [loadCases]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (urgencyRef.current && !urgencyRef.current.contains(event.target as Node)) setIsUrgencyOpen(false);
      if (hospitalRef.current && !hospitalRef.current.contains(event.target as Node)) setIsHospitalOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const snapshot = useMemo(() => {
    const unregistered = cases.filter((item) => !item.registered).length;
    const registered = cases.filter((item) => item.registered).length;
    const active = cases.filter((item) => item.activeConsult).length;

    return {
      total: cases.length,
      unregistered,
      registered,
      active,
    };
  }, [cases]);

  const hospitalOptions = useMemo(() => {
    const values = new Set<string>();
    NETWORK_HOSPITALS.forEach((hospital) => values.add(hospital));
    cases.forEach((caseItem) => {
      const hospital = String(caseItem.hospital || '').trim();
      if (hospital && hospital !== 'ไม่ระบุหน่วยบริการ') values.add(hospital);
    });

    return getVisibleHospitalFilterOptions(
      Array.from(values).sort((a, b) => a.localeCompare(b, 'th')),
      userProfile.hospital,
      { value: ALL_HOSPITALS, label: t('caseMonitor.allHospitals') },
    );
  }, [cases, t, userProfile.hospital]);

  useEffect(() => {
    if (!hospitalOptions.some((option) => option.value === hospitalFilter)) {
      setHospitalFilter(hospitalOptions[0]?.value || ALL_HOSPITALS);
    }
  }, [hospitalFilter, hospitalOptions]);

  const hasActiveFilters = urgencyFilter !== ALL_URGENCIES || hospitalFilter !== ALL_HOSPITALS;
  const selectedUrgency = urgencyConfig.find((option) => option.value === urgencyFilter);
  const selectedHospital = hospitalOptions.find((option) => option.value === hospitalFilter);

  const urgencyCards = useMemo(() => dashboardUrgencies.map((urgency) => ({
    ...urgency,
    count: cases.filter((caseItem) => caseItem.priority === urgency.value).length,
  })), [cases]);

  const hospitalCards = useMemo(() => hospitalOptions
    .filter((option) => option.value !== ALL_HOSPITALS)
    .map((option) => ({
      ...option,
      count: cases.filter((caseItem) => caseItem.hospital === option.value).length,
    }))
    .filter((option) => option.count > 0)
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'th')), [cases, hospitalOptions]);
  const maxHospitalCount = Math.max(1, ...hospitalCards.map((hospital) => hospital.count));
  const maxUrgencyCount = Math.max(1, ...urgencyCards.map((urgency) => urgency.count));

  const filteredCases = useMemo(() => cases.filter((caseItem) => {
    if (activeTab === 'unregistered' && caseItem.registered) return false;
    if (activeTab === 'registered' && !caseItem.registered) return false;
    if (activeTab === 'active' && !caseItem.activeConsult) return false;
    if (urgencyFilter !== ALL_URGENCIES && caseItem.priority !== urgencyFilter) return false;
    if (hospitalFilter !== ALL_HOSPITALS && caseItem.hospital !== hospitalFilter) return false;

    return (
      matchesCaseSearch({
        id: caseItem.caseId || caseItem.patientId,
        patientName: caseItem.patientName,
        hospital: caseItem.hospital,
        status: 'Active',
        priority: caseItem.priority as any,
      }, searchQuery)
      || String(caseItem.hn || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
      || String(caseItem.cid || '').toLowerCase().includes(searchQuery.trim().toLowerCase())
    );
  }), [activeTab, cases, hospitalFilter, searchQuery, urgencyFilter]);

  const openCase = async (caseId: string) => {
    await fetchData();
    selectCase(caseId);
    navigate(`/patient-detail?caseId=${encodeURIComponent(caseId)}`);
  };

  const handleActivateConsult = async (caseItem: MonitorCase) => {
    setWorkingPatientId(caseItem.patientId);
    try {
      const currentUserId = userProfile.id || userProfile.email || 'guest_user';
      const result = await activateMonitoredPatientConsultRequest(caseItem.patientId, userProfile.hospital, currentUserId);
      await loadCases();
      await fetchData();
      const isPendingRequest = result.status === 'Pending';
      showToast(
        !isPendingRequest
          ? t('caseMonitor.alreadyConsultCase', { name: caseItem.patientName })
          : result.created
          ? t('caseMonitor.sentToRequests', { name: caseItem.patientName })
          : t('caseMonitor.alreadyInRequests', { name: caseItem.patientName }),
        isPendingRequest ? 'success' : 'info',
      );
      selectCase(result.caseId);
      navigate(isPendingRequest ? '/requests' : '/active-cases');
    } catch (error) {
      console.error('[CaseMonitor] Unable to activate consult request:', error);
      showToast(t('caseMonitor.activateFailed'), 'error');
    } finally {
      setWorkingPatientId(null);
    }
  };

  return (
    <Layout>
      <div className={styles['monitor-wrapper']}>
        <PageHeader
          title={t('caseMonitor.title')}
          subtitle={t('caseMonitor.subtitle')}
          wrapperClassName={styles['page-header']}
          titleClassName={styles['page-title']}
          subtitleClassName={styles['page-subtitle']}
          rightContent={(
            <div className={styles['search-wrap']}>
              <Search size={18} className={styles['search-icon']} />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder={t('caseMonitor.searchPlaceholder')}
              />
            </div>
          )}
        />

        <div className={styles['metric-grid']}>
          <div className={styles['metric-card']}>
            <Database size={18} />
            <span>{t('caseMonitor.totalDbCases')}</span>
            <strong>{snapshot.total}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Clock3 size={18} />
            <span>{t('caseMonitor.unregistered')}</span>
            <strong>{snapshot.unregistered}</strong>
          </div>
          <div className={styles['metric-card']}>
            <ShieldCheck size={18} />
            <span>{t('caseMonitor.registered')}</span>
            <strong>{snapshot.registered}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Activity size={18} />
            <span>{t('caseMonitor.consultCase')}</span>
            <strong>{snapshot.active}</strong>
          </div>
        </div>

        <div className={styles['monitor-dashboard-grid']}>
          <section className={styles['monitor-panel']}>
            <div className={styles['panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('caseMonitor.caseMonitor').toUpperCase()}</span>
                <h2>{t('caseMonitor.casesByHospital')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <Building2 size={16} />
                {hospitalCards.reduce((sum, hospital) => sum + hospital.count, 0)}
              </div>
            </div>
            <div className={styles['hospital-card-grid']}>
              {hospitalCards.map((hospital) => (
                <button
                  key={hospital.value}
                  type="button"
                  className={cx(styles, 'hospital-monitor-card', hospitalFilter === hospital.value && 'selected')}
                  onClick={() => setHospitalFilter((current) => current === hospital.value ? ALL_HOSPITALS : hospital.value)}
                >
                  <span className={styles['monitor-card-label']}>{hospital.label}</span>
                  <strong className={styles['monitor-card-count']}>{hospital.count}</strong>
                  <div className={styles['monitor-meter']}>
                    <span style={{ width: `${Math.max(8, (hospital.count / maxHospitalCount) * 100)}%` }}></span>
                  </div>
                </button>
              ))}
              {hospitalCards.length === 0 ? (
                <div className={styles['panel-empty']}>{t('caseMonitor.noHospitalData')}</div>
              ) : null}
            </div>
          </section>

          <section className={styles['monitor-panel']}>
            <div className={styles['panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('caseMonitor.urgency').toUpperCase()}</span>
                <h2>{t('caseMonitor.casesByUrgency')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <AlertCircle size={16} />
                {urgencyCards.reduce((sum, urgency) => sum + urgency.count, 0)}
              </div>
            </div>
            <div className={styles['urgency-card-grid']}>
              {urgencyCards.map((urgency) => (
                <button
                  key={urgency.value}
                  type="button"
                  className={cx(styles, 'urgency-monitor-card', urgency.value.toLowerCase(), urgencyFilter === urgency.value && 'selected')}
                  onClick={() => setUrgencyFilter((current) => current === urgency.value ? ALL_URGENCIES : urgency.value)}
                >
                  <span className={cx(styles, 'color-dot', urgency.value.toLowerCase())}></span>
                  <span className={styles['urgency-card-label']}>
                    {t(urgency.labelKey)}
                  </span>
                  <strong className={styles['monitor-card-count']}>{urgency.count}</strong>
                  <div className={styles['monitor-meter']}>
                    <span style={{ width: `${Math.max(8, (urgency.count / maxUrgencyCount) * 100)}%` }}></span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className={styles['toolbar']}>
          <div className={styles['tab-list']}>
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                className={cx(styles, 'tab-btn', activeTab === tab.id && 'active')}
                onClick={() => setActiveTab(tab.id)}
              >
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
          <div className={styles['filter-actions']}>
            <span className={styles['filter-label']}>{t('caseMonitor.quickFilters')}</span>
            <div className={styles['dropdown-wrap']} ref={urgencyRef}>
              <button
                type="button"
                className={cx(styles, 'filter-dropdown-btn', urgencyFilter !== ALL_URGENCIES && 'active')}
                onClick={() => setIsUrgencyOpen((current) => !current)}
                aria-expanded={isUrgencyOpen}
              >
                <AlertCircle size={16} className={urgencyFilter === ALL_URGENCIES ? styles['text-teal'] : undefined} />
                <span className={styles['filter-dropdown-label']}>
                  {selectedUrgency ? t(selectedUrgency.labelKey) : t('caseMonitor.urgency')}
                </span>
                <ChevronDown size={14} className={isUrgencyOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isUrgencyOpen ? (
                <div className={styles['custom-dropdown-menu']}>
                  {urgencyConfig.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cx(styles, 'dropdown-item', urgencyFilter === option.value && 'active')}
                      onClick={() => {
                        setUrgencyFilter(option.value);
                        setIsUrgencyOpen(false);
                      }}
                    >
                      <div className={styles['item-content']}>
                        {option.value !== ALL_URGENCIES ? <span className={cx(styles, 'color-dot', option.value.toLowerCase())}></span> : null}
                        {t(option.labelKey)}
                      </div>
                      {urgencyFilter === option.value ? <Check size={14} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className={styles['dropdown-wrap']} ref={hospitalRef}>
              <button
                type="button"
                className={cx(styles, 'filter-dropdown-btn', hospitalFilter !== ALL_HOSPITALS && 'active')}
                onClick={() => setIsHospitalOpen((current) => !current)}
                aria-expanded={isHospitalOpen}
              >
                <Building2 size={16} />
                <span className={styles['filter-dropdown-label']}>
                  {selectedHospital?.label || t('activeCases.primaryHospitalLabel')}
                </span>
                <ChevronDown size={14} className={isHospitalOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isHospitalOpen ? (
                <div className={cx(styles, 'custom-dropdown-menu', 'wide')}>
                  {hospitalOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cx(styles, 'dropdown-item', hospitalFilter === option.value && 'active')}
                      onClick={() => {
                        setHospitalFilter(option.value);
                        setIsHospitalOpen(false);
                      }}
                    >
                      {option.label}
                      {hospitalFilter === option.value ? <Check size={14} /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {hasActiveFilters ? (
              <button
                type="button"
                className={styles['clear-filter-btn']}
                onClick={() => {
                  setUrgencyFilter(ALL_URGENCIES);
                  setHospitalFilter(ALL_HOSPITALS);
                }}
              >
                <X size={15} />
                {t('caseMonitor.clear')}
              </button>
            ) : null}
            <button className={styles['refresh-btn']} onClick={() => void loadCases()} disabled={loading}>
              {loading ? t('common.loading') : t('caseMonitor.refresh')}
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={styles['monitor-table']}>
            <thead>
              <tr>
                <th>{t('caseMonitor.patient')}</th>
                <th>{t('caseMonitor.hnCid')}</th>
                <th>{t('caseMonitor.facility')}</th>
                <th>{t('caseMonitor.status')}</th>
                <th>{t('caseMonitor.priority')}</th>
                <th>{t('caseMonitor.lastUpdate')}</th>
                <th className={styles['text-right']}>{t('caseMonitor.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr key={`${caseItem.patientId}-${caseItem.caseId || 'patient'}`}>
                  <td data-label={t('caseMonitor.patient')}>
                    <div className={styles['patient-cell']}>
                      <span className={styles['patient-avatar']}>{getCaseInitials(caseItem.patientName) || 'PT'}</span>
                      <div>
                        {caseItem.caseId ? (
                          <ClickableCaseText
                            className={styles['patient-name']}
                            onOpen={() => void openCase(caseItem.caseId as string)}
                          >
                            {caseItem.patientName}
                          </ClickableCaseText>
                        ) : (
                          <span className={styles['patient-name']}>{caseItem.patientName}</span>
                        )}
                        <div className={styles['patient-meta']}>
                          {[
                            caseItem.age ? `${caseItem.age}y` : null,
                            caseItem.gender,
                            caseItem.bloodType ? `${t('caseMonitor.blood')} ${caseItem.bloodType}` : null,
                          ].filter(Boolean).join(' • ') || t('caseMonitor.noDemographics')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td data-label={t('caseMonitor.hnCid')}>
                    <div className={styles['id-stack']}>
                      <strong>{caseItem.hn || '-'}</strong>
                      <span>{caseItem.cid || '-'}</span>
                    </div>
                  </td>
                  <td data-label={t('caseMonitor.facility')}>
                    {caseItem.caseId ? (
                      <ClickableCaseText onOpen={() => void openCase(caseItem.caseId as string)}>
                        {caseItem.hospital}
                      </ClickableCaseText>
                    ) : (
                      <span className={styles['facility-text']}>{caseItem.hospital}</span>
                    )}
                  </td>
                  <td data-label={t('caseMonitor.status')}>
                    <span className={cx(styles, 'status-pill', getStatusClass(caseItem.status))}>
                      {statusLabel(caseItem.status, t)}
                    </span>
                  </td>
                  <td data-label={t('caseMonitor.priority')}>
                    <PriorityBadge
                      value={caseItem.priority}
                      baseClassName={styles['priority-badge']}
                      variantClassName={styles[caseItem.priority.toLowerCase()] || styles['non-urgent']}
                    />
                  </td>
                  <td data-label={t('caseMonitor.lastUpdate')}>
                    <div className={styles['last-update']}>
                      <span>{caseItem.lastAction || t('caseMonitor.awaitingRegistration')}</span>
                      <small>{caseItem.lastActiveTime || '-'}</small>
                    </div>
                  </td>
                  <td className={styles['text-right']} data-label={t('caseMonitor.action')}>
                    {caseItem.caseId ? (
                      <div className={styles['row-action-group']}>
                        <button className={styles['open-btn']} onClick={() => void openCase(caseItem.caseId as string)}>
                          <CheckCircle2 size={15} />
                          {t('caseMonitor.caseDetail')}
                        </button>
                        {caseItem.activeConsult ? (
                          <button
                            className={styles['pending-btn']}
                            disabled
                            title={t('caseMonitor.alreadyInCaseConsultTitle')}
                          >
                            <CheckCircle2 size={15} />
                            {t('caseMonitor.inCaseConsult')}
                          </button>
                        ) : isPendingConsultRequest(caseItem.status) ? (
                          <button
                            className={styles['pending-btn']}
                            disabled
                            title={t('caseMonitor.requestPendingTitle')}
                          >
                            <Clock3 size={15} />
                            {t('caseMonitor.requestPending')}
                          </button>
                        ) : canActivateConsultRequest(caseItem.status) ? (
                          <button
                            className={styles['activate-btn']}
                            onClick={() => void handleActivateConsult(caseItem)}
                            disabled={workingPatientId === caseItem.patientId}
                          >
                            <Power size={15} />
                            {workingPatientId === caseItem.patientId ? t('caseMonitor.requesting') : t('caseMonitor.activateConsultRequest')}
                          </button>
                        ) : (
                          <button
                            className={styles['pending-btn']}
                            disabled
                            title={statusLabel(caseItem.status, t)}
                          >
                            <Clock3 size={15} />
                            {statusLabel(caseItem.status, t)}
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        className={styles['activate-btn']}
                        onClick={() => void handleActivateConsult(caseItem)}
                        disabled={workingPatientId === caseItem.patientId}
                      >
                        <Power size={15} />
                        {workingPatientId === caseItem.patientId ? t('caseMonitor.requesting') : t('caseMonitor.activateConsultRequest')}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {!loading && filteredCases.length === 0 && (
                <TableEmptyState
                  colSpan={7}
                  cellClassName={styles['empty-table-cell']}
                  contentClassName={styles['empty-state']}
                  icon={<Filter size={40} strokeWidth={1.5} />}
                  message={t('caseMonitor.noMatchingCases')}
                />
              )}
              {loading && (
                <tr>
                  <td colSpan={7} className={styles['loading-cell']}>
                    {t('caseMonitor.loadingDatabaseCases')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className={styles['footer-note']}>
          {t('caseMonitor.footerSummary', { shown: filteredCases.length, total: cases.length })}
        </div>
      </div>
    </Layout>
  );
}

export default CaseMonitor;
