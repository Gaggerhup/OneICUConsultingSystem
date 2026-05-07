import type { ActivityLogItem, Case, SpecialistMember, UserProfile } from '@/context/AppContext';

export type RequestTab = 'incoming' | 'sent';

export function getCurrentUserRequestKey(userProfile: UserProfile) {
  return userProfile.id || userProfile.email || 'guest_user';
}

export function filterRequestsByTab(
  requests: Case[],
  activeTab: RequestTab,
  currentUserId: string,
) {
  return requests.filter((request) => {
    if (activeTab === 'sent') {
      return request.senderId === currentUserId;
    }
    return request.senderId !== currentUserId;
  });
}

export function getIncomingPendingCount(
  requests: Case[],
  currentUserId: string,
) {
  return requests.filter(
    (request) => request.senderId !== currentUserId && request.status === 'Pending',
  ).length;
}

export function getOnlineAvailableSpecialists(specialists: SpecialistMember[]) {
  return specialists.filter(
    (specialist) => specialist.status === 'online' && specialist.isAcceptingCases,
  );
}

const CONSULT_CASE_STATUSES = new Set<Case['status']>([
  'Approved',
  'Active',
  'Critical',
  'Discharge',
  'Referred',
  'Dead',
  'Step Down',
]);

const APPROVAL_ACTIONS = new Set(['approved', 'reactivated']);

function parseDateLike(value?: string | number | Date | null) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const trimmed = value.trim();
  if (!trimmed) return null;

  const hasYear = /\b\d{4}\b/.test(trimmed);
  const hasMonthName = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\b/i.test(trimmed);
  if (hasMonthName && !hasYear) {
    const parsedWithCurrentYear = new Date(`${trimmed}, ${new Date().getFullYear()}`);
    if (!Number.isNaN(parsedWithCurrentYear.getTime())) {
      if (parsedWithCurrentYear.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
        parsedWithCurrentYear.setFullYear(parsedWithCurrentYear.getFullYear() - 1);
      }
      return parsedWithCurrentYear;
    }
  }

  let parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  parsed = new Date(`${trimmed}, ${new Date().getFullYear()}`);
  if (!Number.isNaN(parsed.getTime())) {
    if (parsed.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
      parsed.setFullYear(parsed.getFullYear() - 1);
    }
    return parsed;
  }

  const relativeMatch = trimmed.match(/^(\d+)\s*(min|minute|minutes|m|h|hr|hour|hours|day|days)\s+ago$/i);
  if (relativeMatch) {
    const amount = Number.parseInt(relativeMatch[1], 10);
    const unit = relativeMatch[2].toLowerCase();
    const multiplier = unit.startsWith('m')
      ? 60 * 1000
      : unit.startsWith('h')
        ? 60 * 60 * 1000
        : 24 * 60 * 60 * 1000;
    return new Date(Date.now() - amount * multiplier);
  }

  return null;
}

function getCaseRequestedAt(caseItem: Case) {
  return parseDateLike(caseItem.requestedAt) || parseDateLike(caseItem.date);
}

function getCaseApprovedAt(caseItem: Case) {
  if (caseItem.approvedAt) return parseDateLike(caseItem.approvedAt);
  if (caseItem.lastAction && APPROVAL_ACTIONS.has(caseItem.lastAction.toLowerCase())) {
    return parseDateLike(caseItem.lastActiveTime);
  }
  return null;
}

function getMonthStart(date: Date, monthOffset = 0) {
  return new Date(date.getFullYear(), date.getMonth() + monthOffset, 1);
}

function isInMonth(date: Date | null, monthStart: Date) {
  if (!date) return false;
  const nextMonthStart = getMonthStart(monthStart, 1);
  return date >= monthStart && date < nextMonthStart;
}

function calculateConsultationCount(cases: Case[], monthStart: Date) {
  return cases.filter((caseItem) => (
    CONSULT_CASE_STATUSES.has(caseItem.status) && isInMonth(getCaseRequestedAt(caseItem), monthStart)
  )).length;
}

function calculateAverageApprovalMinutes(cases: Case[], monthStart: Date) {
  const durations = cases
    .map((caseItem) => {
      const requestedAt = getCaseRequestedAt(caseItem);
      const approvedAt = getCaseApprovedAt(caseItem);
      if (!requestedAt || !approvedAt || !isInMonth(approvedAt, monthStart)) return null;
      const durationMinutes = Math.round((approvedAt.getTime() - requestedAt.getTime()) / 60000);
      return durationMinutes >= 0 ? durationMinutes : null;
    })
    .filter((value): value is number => value !== null);

  if (durations.length === 0) return null;
  return Math.round(durations.reduce((sum, value) => sum + value, 0) / durations.length);
}

function formatAverageApprovalTime(minutes: number | null) {
  if (minutes === null) return 'N/A';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatCountTrend(currentValue: number, previousValue: number) {
  if (previousValue === 0) {
    return {
      value: currentValue === 0 ? '0%' : '+100%',
      direction: currentValue >= previousValue ? 'up' as const : 'down' as const,
      tone: currentValue >= previousValue ? 'positive' as const : 'negative' as const,
    };
  }

  const percentage = Math.round(((currentValue - previousValue) / previousValue) * 100);
  return {
    value: `${percentage > 0 ? '+' : ''}${percentage}%`,
    direction: percentage >= 0 ? 'up' as const : 'down' as const,
    tone: percentage >= 0 ? 'positive' as const : 'negative' as const,
  };
}

function formatApprovalTrend(currentValue: number | null, previousValue: number | null) {
  if (currentValue === null || previousValue === null) {
    return { value: 'N/A', direction: 'down' as const, tone: 'neutral' as const };
  }

  const delta = currentValue - previousValue;
  return {
    value: `${delta > 0 ? '+' : ''}${delta}m`,
    direction: delta <= 0 ? 'down' as const : 'up' as const,
    tone: delta <= 0 ? 'positive' as const : 'negative' as const,
  };
}

export function getRequestStatsSnapshot(args: {
  requests: Case[];
  activeCases: Case[];
  archiveCases: Case[];
  now?: Date;
}) {
  const { requests, activeCases, archiveCases, now = new Date() } = args;
  const allCases = [...requests, ...activeCases, ...archiveCases];
  const currentMonthStart = getMonthStart(now);
  const previousMonthStart = getMonthStart(now, -1);
  const currentMonthlyConsultations = calculateConsultationCount(allCases, currentMonthStart);
  const previousMonthlyConsultations = calculateConsultationCount(allCases, previousMonthStart);
  const currentAverageApprovalMinutes = calculateAverageApprovalMinutes(allCases, currentMonthStart);
  const previousAverageApprovalMinutes = calculateAverageApprovalMinutes(allCases, previousMonthStart);

  return {
    totalMonthlyConsultations: currentMonthlyConsultations,
    monthlyConsultationTrend: formatCountTrend(currentMonthlyConsultations, previousMonthlyConsultations),
    averageApprovalMinutes: currentAverageApprovalMinutes,
    averageApprovalTimeLabel: formatAverageApprovalTime(currentAverageApprovalMinutes),
    averageApprovalTrend: formatApprovalTrend(currentAverageApprovalMinutes, previousAverageApprovalMinutes),
  };
}

export function getDashboardSnapshot(args: {
  activeCases: Case[];
  requests: Case[];
  specialists: SpecialistMember[];
  activities: ActivityLogItem[];
  userProfile?: UserProfile;
}) {
  const { activeCases, requests, specialists, activities, userProfile } = args;
  const onlineSpecialists = getOnlineAvailableSpecialists(specialists);
  const currentUserAvailableCount = userProfile?.isAcceptingCases ? 1 : 0;

  return {
    activeCaseCount: activeCases.length,
    pendingRequestsCount: requests.filter((request) => request.status === 'Pending').length,
    onlineSpecialistsCount: onlineSpecialists.length + currentUserAvailableCount,
    recentActiveCases: activeCases.slice(0, 5),
    recentActivities: activities.slice(0, 2),
  };
}
