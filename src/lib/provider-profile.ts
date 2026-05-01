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

const hasIdentityLikeKeys = (record: Record<string, unknown>) =>
  Object.keys(record).some((key) =>
    key.startsWith('first') ||
    key.startsWith('last') ||
    key.includes('license') ||
    key.includes('title') ||
    key.includes('name'),
  );

const unwrapProviderProfile = (profile: ProviderRawProfile): Record<string, any> | null => {
  if (!profile || typeof profile !== 'object') return null;

  if (Array.isArray(profile)) {
    for (const item of profile) {
      const unwrapped = unwrapProviderProfile(item);
      if (unwrapped && hasIdentityLikeKeys(unwrapped)) {
        return unwrapped;
      }
    }
    for (const item of profile) {
      const unwrapped = unwrapProviderProfile(item);
      if (unwrapped) return unwrapped;
    }
    return null;
  }

  const current = profile as Record<string, any>;

  const nestedCandidates = [
    current.profile,
    current.data,
    current.user,
    current.result,
    current.response,
  ];

  for (const candidate of nestedCandidates) {
    if (!candidate || typeof candidate !== 'object') continue;

    if (Array.isArray(candidate)) {
      for (const item of candidate) {
        if (!item || typeof item !== 'object') continue;
        const unwrapped = unwrapProviderProfile(item);
        if (unwrapped && hasIdentityLikeKeys(unwrapped)) {
          return unwrapped;
        }
      }
      for (const item of candidate) {
        if (!item || typeof item !== 'object') continue;
        const unwrapped = unwrapProviderProfile(item);
        if (unwrapped) return unwrapped;
      }
      continue;
    }

    const candidateRecord = candidate as Record<string, any>;
    const nestedProfile =
      candidateRecord.profile ||
      candidateRecord.data ||
      candidateRecord.user ||
      candidateRecord.result ||
      candidateRecord.response;

    if (
      nestedProfile &&
      typeof nestedProfile === 'object' &&
      !Array.isArray(nestedProfile)
    ) {
      return unwrapProviderProfile(nestedProfile);
    }

    if (hasIdentityLikeKeys(candidateRecord)) {
      return candidateRecord;
    }
  }

  return current;
};

const firstString = (...values: Array<unknown>) => {
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const trimmed = value.trim();
    if (trimmed) return trimmed;
  }
  return '';
};

const firstDeepString = (
  source: unknown,
  keys: string[],
  seen = new WeakSet<object>(),
): string => {
  if (!source || typeof source !== 'object') return '';
  if (seen.has(source)) return '';
  seen.add(source);

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = firstDeepString(item, keys, seen);
      if (found) return found;
    }
    return '';
  }

  const record = source as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  for (const value of Object.values(record)) {
    if (!value || typeof value !== 'object') continue;
    const found = firstDeepString(value, keys, seen);
    if (found) return found;
  }

  return '';
};

const splitFullName = (value: string) => {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (!normalized) return { firstName: '', lastName: '' };

  const parts = normalized.split(' ');
  if (parts.length === 1) {
    return { firstName: normalized, lastName: '' };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
};

export const getProviderTitle = (profile: ProviderRawProfile) => {
  const current = unwrapProviderProfile(profile);
  if (!current) return 'Dr.' as const;

  const titleSource = [
    current.special_title_en,
    current.special_title_th,
    current.special_title_name_en,
    current.special_title_name_th,
    current.title_en,
    current.title_th,
    current.title_eng,
    current.title_name_en,
    current.title_name_th,
    current.prefix,
    current.prefix_en,
    current.prefix_th,
    current.prefix_name,
    current.title,
    current.title_name,
  ]
    .filter(Boolean)
    .join(' ')
    .trim();

  const titleCandidates = [
    current.organization?.[0]?.position,
    current.organization?.[0]?.position_name,
    current.position,
    current.position_name,
    current.role,
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
    titleCandidates.includes('แพทย์') ||
    titleCandidates.includes('นพ') ||
    titleCandidates.includes('พ.ญ');

  if (nurseDetected) return 'RN' as const;
  if (doctorDetected) return 'Dr.' as const;
  return (titleSource || 'Dr.') as 'Dr.' | 'RN';
};

export const mapProviderIdentity = (profile: ProviderRawProfile): ProviderIdentity | null => {
  const current = unwrapProviderProfile(profile);
  if (!current) return null;

  const firstOrg = Array.isArray(current.organization) ? current.organization[0] : current.organization;
  const title = getProviderTitle(current);
  const fullName = firstString(
    current.full_name,
    current.fullname,
    current.display_name,
    current.name_th,
    current.name_en,
    current.name_eng,
    current.name,
    current.fullName,
    current.displayName,
    firstDeepString(current, [
      'full_name',
      'fullname',
      'display_name',
      'name_th',
      'name_en',
      'name_eng',
      'name',
      'fullName',
      'displayName',
    ]),
  );
  const splitName = splitFullName(fullName);
  const firstName = firstString(
    current.firstname_th,
    current.first_name_th,
    current.first_name,
    current.firstName,
    current.given_name_th,
    current.given_name,
    current.firstname_en,
    current.first_name_en,
    current.givenName,
    firstDeepString(current, [
      'firstname_th',
      'first_name_th',
      'first_name',
      'firstName',
      'given_name_th',
      'given_name',
      'firstname_en',
      'first_name_en',
      'givenName',
    ]),
    splitName.firstName,
  );
  const lastName = firstString(
    current.lastname_th,
    current.last_name_th,
    current.last_name,
    current.lastName,
    current.surname_th,
    current.surname,
    current.lastname_en,
    current.last_name_en,
    current.family_name,
    current.familyName,
    firstDeepString(current, [
      'lastname_th',
      'last_name_th',
      'last_name',
      'lastName',
      'surname_th',
      'surname',
      'lastname_en',
      'last_name_en',
      'family_name',
      'familyName',
    ]),
    splitName.lastName,
  );
  const license = firstString(
    firstOrg?.license_id,
    firstOrg?.license_no,
    firstOrg?.license_number,
    firstOrg?.registration_no,
    firstOrg?.registration_number,
    firstOrg?.doctor_license_no,
    current.license_id,
    current.license_no,
    current.license_number,
    current.registration_no,
    current.registration_number,
    current.doctor_license_no,
    current.medical_license_no,
    current.license,
    current.reg_no,
    current.reg_number,
    current.licenseNo,
    current.licenseNumber,
    current.registrationNo,
    firstDeepString(current, [
      'license_id',
      'license_no',
      'license_number',
      'registration_no',
      'registration_number',
      'doctor_license_no',
      'medical_license_no',
      'license',
      'reg_no',
      'reg_number',
      'licenseNo',
      'licenseNumber',
      'registrationNo',
    ]),
  );
  const specialty = firstString(
    firstOrg?.expertise,
    current.specialty,
    current.specialty_name,
    current.specialtyName,
    current.field,
    current.position,
    current.position_name,
    title === 'RN' ? 'Registered Nurse' : '',
  );
  const hospital = normalizeHospitalName(
    firstString(
      firstOrg?.hname_th,
      firstOrg?.hname_eng,
      firstOrg?.hospital_name,
      firstOrg?.hospital_name_th,
      firstOrg?.hospital_name_en,
      current.hospital,
      current.hospital_name,
      current.hospital_name_th,
      current.hospital_name_en,
      current.organization_name,
    ),
  );
  const email = firstString(current.email, current.email_address, current.mail);

  if (!firstName && !lastName && !license) {
    return null;
  }

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
    firstName: identity.firstName || profile.firstName,
    lastName: identity.lastName || profile.lastName,
    license: identity.license || profile.license,
  };
};
