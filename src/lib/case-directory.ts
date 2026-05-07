import type { Case } from '@/context/AppContext';
import { canAccessAllHospitals, canAccessHospital, normalizeHospitalName } from '@/lib/provider-profile';

export type ActiveCaseViewFilter = 'All' | 'Internal' | 'External';

export type ArchiveDateRange = {
  label: string;
  days: number;
};

const normalizeQuery = (value: string) => value.trim().toLowerCase();

export function matchesCaseSearch(caseItem: Case, searchQuery: string) {
  const query = normalizeQuery(searchQuery);
  if (!query) return true;

  return (
    caseItem.patientName.toLowerCase().includes(query) ||
    caseItem.id.toLowerCase().includes(query) ||
    caseItem.hospital.toLowerCase().includes(query)
  );
}

export function filterActiveCases(
  cases: Case[],
  options: {
    urgencyFilter: string | null;
    hospitalFilter: string | null;
    viewFilter: ActiveCaseViewFilter;
    userHospital: string | null | undefined;
    searchQuery: string;
  },
) {
  const {
    urgencyFilter,
    hospitalFilter,
    viewFilter,
    userHospital,
    searchQuery,
  } = options;
  const normalizedUserHospital = normalizeHospitalName(userHospital);

  return cases.filter((caseItem) => {
    if (!canAccessHospital(normalizedUserHospital, caseItem.hospital)) return false;
    if (urgencyFilter && caseItem.priority !== urgencyFilter) return false;
    if (hospitalFilter && caseItem.hospital !== hospitalFilter) return false;

    if (viewFilter === 'Internal' && caseItem.hospital !== normalizedUserHospital) return false;
    if (viewFilter === 'External' && caseItem.hospital === normalizedUserHospital) return false;

    return matchesCaseSearch(caseItem, searchQuery);
  });
}

export function getVisibleHospitalFilterOptions(
  hospitals: readonly string[],
  userHospital: string | null | undefined,
  allOption: { value: string; label: string },
) {
  if (canAccessAllHospitals(userHospital)) {
    return [
      allOption,
      ...hospitals.map((hospital) => ({ value: hospital, label: hospital })),
    ];
  }

  const normalizedUserHospital = normalizeHospitalName(userHospital);
  return normalizedUserHospital
    ? [{ value: normalizedUserHospital, label: normalizedUserHospital }]
    : [];
}

export function filterArchiveCases(
  cases: Case[],
  options: {
    searchQuery: string;
    hospitalFilter: string | null;
    userHospital: string | null | undefined;
    outcomeFilter: string | null;
    dateRange: ArchiveDateRange;
    currentTime: number;
  },
) {
  const {
    searchQuery,
    hospitalFilter,
    userHospital,
    outcomeFilter,
    dateRange,
    currentTime,
  } = options;

  return cases.filter((caseItem) => {
    if (!canAccessHospital(userHospital, caseItem.hospital)) return false;
    const matchesSearch = matchesCaseSearch(caseItem, searchQuery);
    const matchesHospital = hospitalFilter === null || caseItem.hospital === hospitalFilter;
    const matchesOutcome = outcomeFilter === null || caseItem.status === outcomeFilter;

    let matchesDate = true;
    if (dateRange.days !== Infinity && caseItem.closedTimestamp) {
      const closedTime = typeof caseItem.closedTimestamp === 'number'
        ? caseItem.closedTimestamp
        : new Date(caseItem.closedTimestamp).getTime();
      const diffDays = (currentTime - closedTime) / (1000 * 60 * 60 * 24);
      matchesDate = diffDays <= dateRange.days;
    }

    return matchesSearch && matchesHospital && matchesOutcome && matchesDate;
  });
}

export function getCaseInitials(patientName: string) {
  return patientName
    .split(' ')
    .filter(Boolean)
    .map((name) => name.match(/^[\p{L}\p{N}]/u)?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}
