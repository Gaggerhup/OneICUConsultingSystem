import type { Case } from '@/context/AppContext';

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
    hospitalFilter: string;
    allHospitalsLabel: string;
    viewFilter: ActiveCaseViewFilter;
    userHospital: string | null | undefined;
    searchQuery: string;
  },
) {
  const {
    urgencyFilter,
    hospitalFilter,
    allHospitalsLabel,
    viewFilter,
    userHospital,
    searchQuery,
  } = options;

  return cases.filter((caseItem) => {
    if (urgencyFilter && caseItem.priority !== urgencyFilter) return false;
    if (hospitalFilter !== allHospitalsLabel && caseItem.hospital !== hospitalFilter) return false;

    if (viewFilter === 'Internal' && caseItem.hospital !== userHospital) return false;
    if (viewFilter === 'External' && caseItem.hospital === userHospital) return false;

    return matchesCaseSearch(caseItem, searchQuery);
  });
}

export function filterArchiveCases(
  cases: Case[],
  options: {
    searchQuery: string;
    hospitalFilter: string;
    allHospitalsLabel: string;
    outcomeFilter: string;
    allOutcomesLabel: string;
    dateRange: ArchiveDateRange;
    currentTime: number;
  },
) {
  const {
    searchQuery,
    hospitalFilter,
    allHospitalsLabel,
    outcomeFilter,
    allOutcomesLabel,
    dateRange,
    currentTime,
  } = options;

  return cases.filter((caseItem) => {
    const matchesSearch = matchesCaseSearch(caseItem, searchQuery);
    const matchesHospital = hospitalFilter === allHospitalsLabel || caseItem.hospital === hospitalFilter;
    const matchesOutcome = outcomeFilter === allOutcomesLabel || caseItem.status === outcomeFilter;

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
    .map((name) => name[0])
    .join('');
}
