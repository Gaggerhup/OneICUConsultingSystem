'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  Building2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Database,
  Filter,
  TrendingUp,
  TrendingDown,
  Inbox,
  Send,
  ShieldCheck,
  X,
  XCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { PriorityBadge, StatusWithDotBadge } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PagerControls, PaginationSummary } from '@/components/ui/pagination-patterns';
import { PageHeader, SearchField } from '@/components/ui/page-patterns';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { getCaseInitials } from '@/lib/case-directory';
import { cx } from '@/lib/cx';
import {
  filterRequestsByTab,
  getCurrentUserRequestKey,
  getIncomingPendingCount,
  getRequestStatsSnapshot,
  type RequestTab,
} from '@/lib/request-dashboard';
import styles from './style.module.css';

const ALL_URGENCIES = '__all_urgencies__';
const ALL_HOSPITALS = '__all_hospitals__';
const ALL_STATUSES = '__all_statuses__';

function Requests() {
  const { requests, activeCases, archiveCases, approveRequest, declineRequest, cancelRequest, userProfile, selectCase } = useApp();
  const { push: navigate } = useRouter();
  const { t, language } = useLocale();
  const [activeTab, setActiveTab] = useState<RequestTab>('incoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState(ALL_URGENCIES);
  const [hospitalFilter, setHospitalFilter] = useState(ALL_HOSPITALS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const currentUserId = getCurrentUserRequestKey(userProfile);
  const tabRequests = useMemo(() => filterRequestsByTab(requests, activeTab, currentUserId), [activeTab, currentUserId, requests]);
  const pendingCount = getIncomingPendingCount(requests, currentUserId);
  const statsSnapshot = getRequestStatsSnapshot({ requests, activeCases, archiveCases });
  const isThai = language === 'th';

  const urgencyConfig = useMemo(() => [
    { value: ALL_URGENCIES, label: isThai ? 'ทุกระดับความเร่งด่วน' : 'All urgency levels' },
    { value: 'IMMEDIATE', label: t('activeCases.immediateLifeThreatening'), colorClass: 'immediate' },
    { value: 'EMERGENCY', label: t('activeCases.emergency'), colorClass: 'emergency' },
    { value: 'URGENT', label: t('activeCases.urgent'), colorClass: 'urgent' },
    { value: 'SEMI-URGENT', label: t('activeCases.semiUrgent'), colorClass: 'semi-urgent' },
    { value: 'NON-URGENT', label: t('activeCases.nonUrgent'), colorClass: 'non-urgent' },
  ], [isThai, t]);
  const statusConfig = useMemo(() => [
    { value: ALL_STATUSES, label: isThai ? 'ทุกสถานะ' : 'All statuses' },
    { value: 'Pending', label: isThai ? 'รอดำเนินการ' : 'Pending' },
    { value: 'Declined', label: isThai ? 'ปฏิเสธแล้ว' : 'Declined' },
  ], [isThai]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (urgencyRef.current && !urgencyRef.current.contains(event.target as Node)) setIsUrgencyOpen(false);
      if (hospitalRef.current && !hospitalRef.current.contains(event.target as Node)) setIsHospitalOpen(false);
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) setIsStatusOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const matchesRequestSearch = (request: typeof requests[number]) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      request.id.toLowerCase().includes(query) ||
      request.patientName.toLowerCase().includes(query) ||
      request.hospital.toLowerCase().includes(query) ||
      String(request.hn || '').toLowerCase().includes(query) ||
      String(request.cid || '').toLowerCase().includes(query)
    );
  };

  const filterRequestSet = (
    source: typeof requests,
    options: { includeUrgency?: boolean; includeHospital?: boolean; includeStatus?: boolean } = {},
  ) => source.filter((request) => {
    if (!matchesRequestSearch(request)) return false;
    if (options.includeUrgency !== false && urgencyFilter !== ALL_URGENCIES && request.priority !== urgencyFilter) return false;
    if (options.includeHospital !== false && hospitalFilter !== ALL_HOSPITALS && request.hospital !== hospitalFilter) return false;
    if (options.includeStatus !== false && statusFilter !== ALL_STATUSES && request.status !== statusFilter) return false;
    return true;
  });

  const filteredRequests = useMemo(
    () => filterRequestSet(tabRequests),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hospitalFilter, searchQuery, statusFilter, tabRequests, urgencyFilter],
  );
  const hospitalDashboardRequests = useMemo(
    () => filterRequestSet(tabRequests, { includeHospital: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchQuery, statusFilter, tabRequests, urgencyFilter],
  );
  const urgencyDashboardRequests = useMemo(
    () => filterRequestSet(tabRequests, { includeUrgency: false }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hospitalFilter, searchQuery, statusFilter, tabRequests],
  );
  const hospitalCards = useMemo(() => {
    const counts = new Map<string, number>();
    hospitalDashboardRequests.forEach((request) => {
      const hospital = request.hospital?.trim() || '—';
      counts.set(hospital, (counts.get(hospital) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([hospital, count]) => ({ value: hospital, label: hospital, count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, isThai ? 'th' : 'en'));
  }, [hospitalDashboardRequests, isThai]);
  const hospitalOptions = useMemo(() => [
    { value: ALL_HOSPITALS, label: isThai ? 'ทุกโรงพยาบาล' : 'All hospitals' },
    ...Array.from(new Set(tabRequests.map((request) => request.hospital?.trim()).filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b, isThai ? 'th' : 'en'))
      .map((hospital) => ({ value: hospital, label: hospital })),
  ], [isThai, tabRequests]);
  const urgencyCards = useMemo(() => urgencyConfig
    .filter((urgency) => urgency.value !== ALL_URGENCIES)
    .map((urgency) => ({
      ...urgency,
      count: urgencyDashboardRequests.filter((request) => request.priority === urgency.value).length,
    })), [urgencyConfig, urgencyDashboardRequests]);
  const selectedUrgency = urgencyConfig.find((urgency) => urgency.value === urgencyFilter);
  const selectedHospital = hospitalOptions.find((hospital) => hospital.value === hospitalFilter);
  const selectedStatus = statusConfig.find((status) => status.value === statusFilter);
  const hasActiveFilters = urgencyFilter !== ALL_URGENCIES || hospitalFilter !== ALL_HOSPITALS || statusFilter !== ALL_STATUSES || Boolean(searchQuery.trim());
  const maxHospitalCount = Math.max(1, ...hospitalCards.map((hospital) => hospital.count));
  const maxUrgencyCount = Math.max(1, ...urgencyCards.map((urgency) => urgency.count));
  const tabPendingCount = tabRequests.filter((request) => request.status === 'Pending').length;
  const tabDeclinedCount = tabRequests.filter((request) => request.status === 'Declined').length;

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate(`/patient-detail?caseId=${encodeURIComponent(caseId)}`);
  };

  const handleCancelRequest = async (caseId: string) => {
    const cancelled = await cancelRequest(caseId);
    if (cancelled) {
      navigate('/case-monitor');
    }
  };

  return (
    <Layout>
      <div className={styles['requests-page-wrapper']}>
        <PageHeader
          title={t('requests.title')}
          subtitle={t('requests.subtitle')}
          wrapperClassName={styles['page-header']}
          rightContent={(
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('requests.searchPlaceholder')}
              wrapperClassName={styles['search-wrap']}
              iconClassName={styles['search-icon']}
            />
          )}
        />

        <div className={styles['metric-grid']}>
          <div className={styles['metric-card']}>
            <Database size={20} />
            <span>{activeTab === 'incoming' ? t('requests.incoming') : t('requests.sent')}</span>
            <strong>{tabRequests.length}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Filter size={20} />
            <span>{t('requests.filtered')}</span>
            <strong>{filteredRequests.length}</strong>
          </div>
          <div className={styles['metric-card']}>
            <ShieldCheck size={20} />
            <span>{t('requests.pending')}</span>
            <strong>{tabPendingCount}</strong>
          </div>
          <div className={styles['metric-card']}>
            <Activity size={20} />
            <span>{t('requests.declined')}</span>
            <strong>{tabDeclinedCount}</strong>
          </div>
        </div>

        <section className={styles['monitor-dashboard']} aria-label={t('requests.dashboardLabel')}>
          <div className={styles['dashboard-panel']}>
            <div className={styles['dashboard-panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('requests.requestsKicker').toUpperCase()}</span>
                <h2>{t('requests.requestsByHospital')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <Building2 size={18} />
                <strong>{hospitalDashboardRequests.length}</strong>
              </div>
            </div>
            <div className={styles['hospital-monitor-grid']}>
              {hospitalCards.length > 0 ? hospitalCards.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={cx(styles, 'hospital-monitor-card', hospitalFilter === item.value && 'selected')}
                  onClick={() => setHospitalFilter((current) => current === item.value ? ALL_HOSPITALS : item.value)}
                >
                  <span className={styles['monitor-card-label']}>{item.label}</span>
                  <span className={styles['monitor-card-count']}>{item.count}</span>
                  <span className={styles['monitor-meter']} aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (item.count / maxHospitalCount) * 100)}%` }} />
                  </span>
                </button>
              )) : (
                <div className={styles['monitor-empty']}>{t('requests.noRequestsForFilters')}</div>
              )}
            </div>
          </div>

          <div className={styles['dashboard-panel']}>
            <div className={styles['dashboard-panel-header']}>
              <div>
                <span className={styles['dashboard-kicker']}>{t('requests.urgencyKicker').toUpperCase()}</span>
                <h2>{t('requests.requestsByUrgency')}</h2>
              </div>
              <div className={styles['dashboard-total']}>
                <AlertCircle size={18} />
                <strong>{urgencyDashboardRequests.length}</strong>
              </div>
            </div>
            <div className={styles['urgency-monitor-grid']}>
              {urgencyCards.map((item) => (
                <button
                  type="button"
                  key={item.value}
                  className={cx(styles, 'urgency-monitor-card', item.colorClass, urgencyFilter === item.value && 'selected')}
                  onClick={() => setUrgencyFilter((current) => current === item.value ? ALL_URGENCIES : item.value)}
                >
                  <span className={cx(styles, 'color-dot', item.colorClass)} />
                  <span className={styles['monitor-card-label']}>{item.label}</span>
                  <span className={styles['monitor-card-count']}>{item.count}</span>
                  <span className={styles['monitor-meter']} aria-hidden="true">
                    <span style={{ width: `${Math.max(8, (item.count / maxUrgencyCount) * 100)}%` }} />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className={styles['controls-bar']}>
          <div className={styles['card-tabs']}>
            <button
              className={cx(styles, 'tab-btn', activeTab === 'incoming' && 'active')}
              onClick={() => setActiveTab('incoming')}
            >
              <Inbox size={18} />
              {t('requests.incoming')}
              {pendingCount > 0 && <span className={styles['count-badge']}>{pendingCount}</span>}
            </button>
            <button
              className={cx(styles, 'tab-btn', activeTab === 'sent' && 'active')}
              onClick={() => setActiveTab('sent')}
            >
              <Send size={18} />
              {t('requests.sent')}
            </button>
          </div>
          <div className={styles['filter-actions']}>
            <span className={styles['filter-label']}>{isThai ? 'ตัวกรองด่วน' : 'Quick Filters'}</span>
            <div className={styles['dropdown-wrap']} ref={urgencyRef}>
              <button
                type="button"
                className={cx(styles, 'filter-dropdown-btn', urgencyFilter !== ALL_URGENCIES && 'active')}
                onClick={() => setIsUrgencyOpen((current) => !current)}
              >
                <AlertCircle size={16} className={urgencyFilter === ALL_URGENCIES ? styles['text-teal'] : undefined} />
                <span className={styles['filter-dropdown-label']}>{selectedUrgency?.label || (isThai ? 'ความเร่งด่วน' : 'Urgency')}</span>
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
                        {option.colorClass ? <span className={cx(styles, 'color-dot', option.colorClass)} /> : null}
                        {option.label}
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
              >
                <Building2 size={16} />
                <span className={styles['filter-dropdown-label']}>{selectedHospital?.label || (isThai ? 'โรงพยาบาล' : 'Hospital')}</span>
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

            <div className={styles['dropdown-wrap']} ref={statusRef}>
              <button
                type="button"
                className={cx(styles, 'filter-dropdown-btn', statusFilter !== ALL_STATUSES && 'active')}
                onClick={() => setIsStatusOpen((current) => !current)}
              >
                <ShieldCheck size={16} />
                <span className={styles['filter-dropdown-label']}>{selectedStatus?.label || (isThai ? 'สถานะ' : 'Status')}</span>
                <ChevronDown size={14} className={isStatusOpen ? styles['rotate-180'] : undefined} />
              </button>
              {isStatusOpen ? (
                <div className={styles['custom-dropdown-menu']}>
                  {statusConfig.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={cx(styles, 'dropdown-item', statusFilter === option.value && 'active')}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setIsStatusOpen(false);
                      }}
                    >
                      {option.label}
                      {statusFilter === option.value ? <Check size={14} /> : null}
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
                  setSearchQuery('');
                  setUrgencyFilter(ALL_URGENCIES);
                  setHospitalFilter(ALL_HOSPITALS);
                  setStatusFilter(ALL_STATUSES);
                }}
              >
                <X size={15} />
                {isThai ? 'ล้างตัวกรอง' : 'Clear'}
              </button>
            ) : null}
          </div>
        </div>

        <div className={styles['requests-card']}>
          <div className={styles['table-container']}>
            <table className={styles['requests-table']}>
              <thead>
                <tr>
                  <th>{t('archiveCases.caseId')}</th>
                  <th>{t('archiveCases.patientName')}</th>
                  <th>{activeTab === 'incoming' ? t('requests.sourceHospital') : t('requests.targetHospital')}</th>
                  <th>{t('requests.priority')}</th>
                  <th>{t('requests.status')}</th>
                  <th className={styles['text-right']}>{t('requests.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => {
                  const hospital = req.hospital?.trim();
                  const hasHospital = Boolean(hospital && hospital !== '—');

                  return (
                    <tr key={req.id} className={styles['row-clickable']}>
                      <td data-label={t('archiveCases.caseId')}><span className={styles['case-id-badge']}>#{req.id}</span></td>
                      <td data-label={t('archiveCases.patientName')}>
                        <CasePatientCell
                          wrapperClassName={styles['patient-cell']}
                          leading={<div className={styles['initials-avatar']}>{getCaseInitials(req.patientName)}</div>}
                          title={req.patientName}
                          titleClassName={styles['patient-name']}
                          onOpen={() => openCaseDetail(req.id)}
                        />
                      </td>
                      <td data-label={activeTab === 'incoming' ? t('requests.sourceHospital') : t('requests.targetHospital')}>
                        {hasHospital ? (
                          <ClickableCaseText onOpen={() => openCaseDetail(req.id)}>
                            {hospital}
                          </ClickableCaseText>
                        ) : (
                          <span className={styles['missing-value']}>—</span>
                        )}
                      </td>
                      <td data-label={t('requests.priority')}>
                        <PriorityBadge
                          value={req.priority}
                          baseClassName={styles['priority-badge']}
                          variantClassName={styles[req.priority.toLowerCase()]}
                        />
                      </td>
                      <td data-label={t('requests.status')}>
                        <StatusWithDotBadge
                          value={req.status}
                          wrapperClassName={styles['status-cell']}
                          dotBaseClassName={styles['status-dot']}
                          dotVariantClassName={styles[req.status.toLowerCase()]}
                          textBaseClassName={styles['status-text']}
                          textVariantClassName={styles[req.status.toLowerCase()]}
                        />
                      </td>
                      <td className={styles['text-right']} data-label={t('requests.actions')}>
                        {activeTab === 'incoming' && req.status === 'Pending' ? (
                          <div className={styles['action-btns']}>
                            <button
                              className={styles['decline-btn']}
                              onClick={() => declineRequest(req.id)}
                            >
                              {t('common.decline')}
                            </button>
                            <button
                              className={styles['approve-btn']}
                              onClick={() => approveRequest(req.id)}
                            >
                              {t('common.approve')}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={styles['cancel-request-btn']}
                            onClick={() => void handleCancelRequest(req.id)}
                          >
                            <XCircle size={16} />
                            {t('newRequest.cancelRequest')}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles['empty-cell']}>
                      {t('requests.noRequests').replace('{tab}', activeTab)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <PaginationSummary
            wrapperClassName={styles['pagination-footer']}
            textClassName={styles['results-count']}
            controls={filteredRequests.length > 0 ? (
              <PagerControls
                wrapperClassName={styles['pagination-controls']}
                navButtonClassName={styles['page-nav-btn']}
                activePageClassName={cx(styles, 'page-num', 'active')}
                prevIcon={<ChevronLeft size={16} />}
                nextIcon={<ChevronRight size={16} />}
              />
            ) : null}
          >
            {t('requests.showing')} {filteredRequests.length} / {filteredRequests.length} {activeTab === 'incoming' ? t('requests.incoming') : t('requests.sent')}
          </PaginationSummary>
        </div>

        <div className={styles['stats-grid']}>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{t('requests.totalMonthlyConsultations')}</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>{statsSnapshot.totalMonthlyConsultations}</span>
              <span className={cx(styles, 'trend', statsSnapshot.monthlyConsultationTrend.tone)}>
                {statsSnapshot.monthlyConsultationTrend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {statsSnapshot.monthlyConsultationTrend.value}
              </span>
            </div>
          </div>
          <div className={styles['stat-card']}>
            <span className={styles['stat-label']}>{t('requests.avgApprovalTime')}</span>
            <div className={styles['stat-value-container']}>
              <span className={styles['stat-value']}>{statsSnapshot.averageApprovalTimeLabel}</span>
              <span className={cx(styles, 'trend', statsSnapshot.averageApprovalTrend.tone)}>
                {statsSnapshot.averageApprovalTrend.direction === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {statsSnapshot.averageApprovalTrend.value}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Requests;
