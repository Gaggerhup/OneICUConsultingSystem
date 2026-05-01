import type { SpecialistMember, UserProfile } from '@/context/AppContext';

export const ALL_SPECIALTIES_VALUE = '__all_specialties__';

type DirectorySpecialist = SpecialistMember | (UserProfile & {
  id: string;
  status: 'online' | 'away' | 'dnd';
});

export function buildDirectorySpecialists(
  specialists: SpecialistMember[],
  userProfile: UserProfile,
) {
  const list: DirectorySpecialist[] = specialists.filter((specialist) => specialist.isAcceptingCases);

  if (userProfile.firstName && userProfile.isAcceptingCases) {
    list.unshift({
      id: 'current-user',
      ...userProfile,
      status: 'online',
    });
  }

  return list;
}

export function getActiveSpecialties(
  specialists: Array<{ isAcceptingCases: boolean; specialty?: string | null }>,
  specialtyOptions: readonly string[],
) {
  const specialtiesWithActiveMembers = new Set<string>();

  specialists.forEach((specialist) => {
    if (specialist.isAcceptingCases && specialist.specialty) {
      specialtiesWithActiveMembers.add(specialist.specialty);
    }
  });

  return specialtyOptions.filter((specialty) => specialtiesWithActiveMembers.has(specialty));
}

export function filterSpecialists<T extends {
  firstName?: string;
  lastName?: string;
  specialty?: string | null;
  hospital?: string | null;
}>(
  specialists: T[],
  searchQuery: string,
  selectedSpecialty: string,
) {
  const normalizedQuery = searchQuery.toLowerCase();

  return specialists.filter((specialist) => {
    const matchesSearch =
      `${specialist.firstName || ''} ${specialist.lastName || ''}`.toLowerCase().includes(normalizedQuery) ||
      (specialist.specialty || '').toLowerCase().includes(normalizedQuery) ||
      (specialist.hospital || '').toLowerCase().includes(normalizedQuery);

    const matchesSpecialty =
      selectedSpecialty === ALL_SPECIALTIES_VALUE || specialist.specialty === selectedSpecialty;

    return matchesSearch && matchesSpecialty;
  }) as T[];
}
