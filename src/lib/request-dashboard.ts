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
