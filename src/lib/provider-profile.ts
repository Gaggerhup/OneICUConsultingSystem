export type ProviderRawProfile = Record<string, any> | null | undefined;

export type ProviderIdentity = {
  title: 'Dr.' | 'RN';
  firstName: string;
  lastName: string;
  specialty: string;
  hospital: string;
  email: string;
  phoneNumber: string;
  avatarUrl: null;
  license: string;
  isAcceptingCases: boolean;
  isAcceptingNotifications: boolean;
  telegramChatId: string | null;
  notifPrefs: {
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    weeklyReport: boolean;
    systemAlert: boolean;
  };
};

export const DEFAULT_PROVIDER_NOTIF_PREFS: ProviderIdentity['notifPrefs'] = {
  newRequest: true,
  requestApproved: true,
  newMessage: true,
  caseUpdate: true,
  weeklyReport: true,
  systemAlert: true,
};

export const normalizeHospitalName = (value: string | null | undefined) => {
  switch ((value || '').trim()) {
    case 'Phitsanulok General Hospital':
    case 'Pitsanulok Hospital':
      return 'โรงพยาบาลพุทธชินราช พิษณุโลก';
    case 'Mueang Phitsanulok Hospital':
      return 'โรงพยาบาลเมืองพิษณุโลก';
    case 'Bang Krathum Hospital':
      return 'โรงพยาบาลบางกระทุ่ม';
    case 'Phrom Phiram Hospital':
      return 'โรงพยาบาลพรหมพิราม';
    case 'Wang Thong Hospital':
      return 'โรงพยาบาลวังทอง';
    default:
      return value || '';
  }
};

export const getProviderTitle = (profile: ProviderRawProfile) => {
  if (!profile) return 'Dr.' as const;

  const titleSource = [
    profile.special_title_en,
    profile.special_title_th,
    profile.title_en,
    profile.title_th,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const titleCandidates = [
    profile.organization?.[0]?.position,
    profile.organization?.[0]?.position_name,
    profile.position,
    profile.position_name,
    profile.role,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const nurseDetected =
    /(^|\b)(rn|registered nurse|nurse)(\b|$)/i.test(titleSource) ||
    titleCandidates.includes('nurse') ||
    titleCandidates.includes('พยาบาล');

  const doctorDetected =
    /(^|\b)(dr\.?|doctor|physician)(\b|$)/i.test(titleSource) ||
    titleCandidates.includes('doctor') ||
    titleCandidates.includes('physician') ||
    titleCandidates.includes('แพทย์');

  if (nurseDetected) return 'RN' as const;
  if (doctorDetected) return 'Dr.' as const;
  return (titleSource || 'Dr.') as 'Dr.' | 'RN';
};

export const mapProviderIdentity = (profile: ProviderRawProfile): ProviderIdentity | null => {
  if (!profile) return null;

  const firstOrg = profile.organization?.[0];
  const title = getProviderTitle(profile);
  const firstName = profile.firstname_th || profile.firstname_en || '';
  const lastName = profile.lastname_th || profile.lastname_en || '';
  const license = firstOrg?.license_id || profile.license_id || profile.license || '';
  const specialty = profile.specialty || (title === 'RN' ? 'Registered Nurse' : '');
  const hospital = normalizeHospitalName(firstOrg?.hname_th || firstOrg?.hname_eng || profile.hospital || '');
  const email = profile.email || '';

  return {
    title,
    firstName,
    lastName,
    specialty,
    hospital,
    email,
    phoneNumber: '+66',
    avatarUrl: null,
    license,
    isAcceptingCases: true,
    isAcceptingNotifications: true,
    telegramChatId: null,
    notifPrefs: DEFAULT_PROVIDER_NOTIF_PREFS,
  };
};

export const mergeLockedProviderIdentity = <T extends Record<string, any>>(
  profile: T,
  rawProfile: ProviderRawProfile,
) => {
  const identity = mapProviderIdentity(rawProfile);
  if (!identity) return profile;

  return {
    ...profile,
    title: identity.title,
    firstName: identity.firstName,
    lastName: identity.lastName,
    license: identity.license,
  };
};
