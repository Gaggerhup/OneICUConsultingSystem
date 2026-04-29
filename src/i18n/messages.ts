export type Language = 'th' | 'en';

type MessageTree = {
  common: {
    appName: string;
    medConsultation: string;
    thai: string;
    english: string;
    searchEverything: string;
    searchLogs: string;
    searchByIdOrName: string;
    allHospitals: string;
    allSpecialties: string;
    allOutcomes: string;
    allTime: string;
    clearAll: string;
    clearSearch: string;
    cancel: string;
    save: string;
    submit: string;
    approve: string;
    decline: string;
    closeCase: string;
    viewAll: string;
    loading: string;
    back: string;
    dashboard: string;
    activeCases: string;
    requests: string;
    specialists: string;
    archivedCases: string;
    settings: string;
    profile: string;
    notifications: string;
    security: string;
    go: string;
    available: string;
    unavailable: string;
    goToDashboard: string;
    summary: string;
    details: string;
    timeRange: string;
    noResults: string;
    noData: string;
  };
  language: {
    switcherLabel: string;
    current: string;
  };
  login: {
    title: string;
    subtitle: string;
    providerLogin: string;
    footer: string;
  };
  authCallback: {
    authenticating: string;
    exchange: string;
    success: string;
    missingCode: string;
    failed: string;
    authFailedTitle: string;
    returnToLogin: string;
    pleaseWait: string;
    initializing: string;
  };
  nav: {
    dashboard: string;
    activeCases: string;
    requests: string;
    specialists: string;
    archivedCases: string;
    settings: string;
    newRequest: string;
    home: string;
  };
  header: {
    searchPlaceholder: string;
    activeCases: string;
    requests: string;
    archivedCases: string;
    specialists: string;
    notifications: string;
    pages: string;
    available: string;
    unavailable: string;
    go: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    activeConsultationCases: string;
    currentlyBeingReviewed: string;
    pendingRequests: string;
    requiresImmediateAttention: string;
    availableSpecialists: string;
    specialistsAcceptingCasesNow: string;
    activeConsultations: string;
    activeConsultationsEmpty: string;
    newRequestsAppear: string;
    activityFeed: string;
    refreshFeed: string;
    refreshing: string;
    patientName: string;
    primaryHospital: string;
    priority: string;
    lastActivity: string;
  };
  activeCases: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    quickFilters: string;
    allCases: string;
    internal: string;
    external: string;
    caseId: string;
    patientName: string;
    primaryHospital: string;
    priorityUrgency: string;
    lastActivity: string;
    noMatching: string;
    resetAllFilters: string;
    showing: string;
    activeCasesLabel: string;
    urgency: string;
    primaryHospitalLabel: string;
  };
  archiveCases: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    filters: string;
    caseId: string;
    patientName: string;
    hospital: string;
    closeDate: string;
    statusOutcome: string;
    actions: string;
    clearAll: string;
    viewRecord: string;
    reactivate: string;
    noResults: string;
    showing: string;
    records: string;
  };
  requests: {
    title: string;
    subtitle: string;
    incoming: string;
    sent: string;
    sourceHospital: string;
    targetHospital: string;
    priority: string;
    status: string;
    actions: string;
    noRequests: string;
    showing: string;
    totalMonthlyTransfers: string;
    avgApprovalTime: string;
  };
  specialist: {
    title: string;
    subtitle: string;
    searchPlaceholder: string;
  };
  newRequest: {
    title: string;
    subtitle: string;
    restoreDraft: string;
    discard: string;
    restoreDraftQuestion: string;
    stepId: string;
    stepFetch: string;
    stepReview: string;
    stepSubmit: string;
    lookupTitle: string;
    lookupSubtitle: string;
    lookupButton: string;
    cidOrPassport: string;
    loadingTitle: string;
    loadingSubtitle: string;
    patientVerified: string;
    patientNotFound: string;
    changeCid: string;
    patientInformation: string;
    clinicalPresentation: string;
    primaryComplaint: string;
    consultationSpecifics: string;
    sourceHospital: string;
    attachments: string;
    secureSubmission: string;
    submissionSecure: string;
    submitRequest: string;
    saveAsDraft: string;
    cancelRequest: string;
    systemStatus: string;
    encryptionActive: string;
  };
  settings: {
    profileTab: string;
    notificationsTab: string;
    securityTab: string;
    profileTitle: string;
    profilePhoto: string;
    verifiedStaff: string;
    uploadPhoto: string;
    removePhoto: string;
    fullName: string;
    license: string;
    specialty: string;
    hospital: string;
    email: string;
    phone: string;
    summary: string;
    summaryHint: string;
    acceptNewCases: string;
    statusAcceptingCases: string;
    cancel: string;
    saveProfile: string;
    profileUpdated: string;
    notificationsTitle: string;
    notificationsSubtitle: string;
    notificationCases: string;
    securityTitle: string;
    securitySubtitle: string;
    currentSession: string;
    logout: string;
    externalAccess: string;
    openBrowser: string;
    deactivateAccount: string;
    deactivateQuestion: string;
    deactivateDescription: string;
    confirmDeactivate: string;
  };
  requestSubmitted: {
    title: string;
    body: string;
    referenceId: string;
    dashboard: string;
    footer: string;
    loading: string;
  };
  activityHistory: {
    title: string;
    subtitle: string;
    activitiesFound: string;
    timeRange: string;
    details: string;
    noActivities: string;
    noActivitiesSubtitle: string;
    clearSearch: string;
    showAllTime: string;
  };
  patientDetail: {
    backToPrevious: string;
    activeConsultation: string;
    updateDiagnosis: string;
    uploadFiles: string;
    closeCase: string;
    activeCases: string;
    overview: string;
    labs: string;
    medications: string;
    imaging: string;
    currentVitals: string;
    recentLabResults: string;
    clinicalDataPending: string;
    noKnownData: string;
    fromDatabase: string;
    uploadFailed: string;
    uploadedToCaseFile: string;
    consultNotePosted: string;
    failedToPostNote: string;
  };
  consultationStatus: {
    backToPrevious: string;
    sendMessage: string;
    uploadImaging: string;
    updateDiagnosis: string;
    closeCase: string;
    medicalHistory: string;
    preExistingConditions: string;
    allergies: string;
    currentSymptoms: string;
    initialDiagnosis: string;
    consultationTeam: string;
    inviteConsultant: string;
    vitalsLabs: string;
    consultationNotes: string;
    medications: string;
    labs: string;
    imaging: string;
    currentVitals: string;
    recentLabResults: string;
    placeholder: string;
  };
  messageSpecialist: {
    searchPlaceholder: string;
    activeCases: string;
    caseFiles: string;
    viewAllFiles: string;
    online: string;
    startConsultation: string;
    typedPlaceholder: string;
    hipaa: string;
    endToEnd: string;
    viewPatientDetail: string;
  };
};

export const messages: Record<Language, MessageTree> = {
  en: {
    common: {
      appName: 'Phitsanulok Med Consultation',
      medConsultation: 'Med Consultation',
      thai: 'Thai',
      english: 'English',
      searchEverything: 'Search everything - cases, specialists, pages...',
      searchLogs: 'Search logs...',
      searchByIdOrName: 'Search by ID or Name...',
      allHospitals: 'All Hospitals',
      allSpecialties: 'All Specialties',
      allOutcomes: 'All Outcomes',
      allTime: 'All Time',
      clearAll: 'Clear All',
      clearSearch: 'Clear search',
      cancel: 'Cancel',
      save: 'Save',
      submit: 'Submit',
      approve: 'Approve',
      decline: 'Decline',
      closeCase: 'Close Case',
      viewAll: 'View All',
      loading: 'Loading...',
      back: 'Back',
      dashboard: 'Dashboard',
      activeCases: 'Active Cases',
      requests: 'Requests',
      specialists: 'Specialists',
      archivedCases: 'Archived Cases',
      settings: 'Settings',
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      go: 'Go',
      available: 'AVAILABLE',
      unavailable: 'UNAVAILABLE',
      goToDashboard: 'Dashboard',
      summary: 'Summary',
      details: 'Details',
      timeRange: 'Time Range:',
      noResults: 'No results found.',
      noData: 'No data available',
    },
    language: {
      switcherLabel: 'Language',
      current: 'EN',
    },
    login: {
      title: 'Login',
      subtitle: 'Access the secure healthcare provider portal',
      providerLogin: 'Sign in with Provider ID',
      footer: '© 2026 Phitsanulok Provincial Public Health Office. All rights reserved.',
    },
    authCallback: {
      authenticating: 'Authenticating...',
      exchange: 'Exchanging token and verifying identity securely...',
      success: 'Success! Redirecting...',
      missingCode: 'Authorization code missing',
      failed: 'Authentication failed. Please try again.',
      authFailedTitle: 'Authentication Failed',
      returnToLogin: 'Return to Login',
      pleaseWait: 'Please wait while we secure your connection',
      initializing: 'Initializing...',
    },
    nav: {
      dashboard: 'Dashboard',
      activeCases: 'Active Cases',
      requests: 'Requests',
      specialists: 'Specialists',
      archivedCases: 'Archive Cases',
      settings: 'Settings',
      newRequest: 'New Request',
      home: 'Home',
    },
    header: {
      searchPlaceholder: 'Search everything - cases, specialists, pages...',
      activeCases: 'Active Cases',
      requests: 'Requests',
      archivedCases: 'Archived Cases',
      specialists: 'Specialists',
      notifications: 'Notifications',
      pages: 'Pages',
      available: 'AVAILABLE',
      unavailable: 'UNAVAILABLE',
      go: 'Go',
    },
    dashboard: {
      title: 'Dashboard Overview',
      subtitle: "Welcome back. Here is what's happening today.",
      activeConsultationCases: 'ACTIVE CONSULTATION CASES',
      currentlyBeingReviewed: 'Currently being reviewed',
      pendingRequests: 'PENDING REQUESTS',
      requiresImmediateAttention: 'Requires immediate attention',
      availableSpecialists: 'AVAILABLE SPECIALISTS',
      specialistsAcceptingCasesNow: 'specialists accepting cases now',
      activeConsultations: 'Active Consultations',
      activeConsultationsEmpty: 'No active consultations found.',
      newRequestsAppear: 'New requests will appear here once approved.',
      activityFeed: 'Activity Feed',
      refreshFeed: 'Refresh Feed',
      refreshing: 'Refreshing...',
      patientName: 'Patient Name',
      primaryHospital: 'Primary Hospital',
      priority: 'Priority',
      lastActivity: 'Last Activity',
    },
    activeCases: {
      title: 'Active Cases',
      subtitle: 'Monitor and manage high-priority interhospital consultations.',
      searchPlaceholder: 'Search by ID or Name...',
      quickFilters: 'Quick Filters:',
      allCases: 'All Cases',
      internal: 'Internal',
      external: 'External',
      caseId: 'Case ID',
      patientName: 'Patient Name',
      primaryHospital: 'Primary Hospital',
      priorityUrgency: 'Priority / Urgency',
      lastActivity: 'Last Activity',
      noMatching: 'No matching active cases found.',
      resetAllFilters: 'Reset All Filters',
      showing: 'Showing',
      activeCasesLabel: 'active cases',
      urgency: 'Urgency',
      primaryHospitalLabel: 'Primary Hospital',
    },
    archiveCases: {
      title: 'Archive Cases',
      subtitle: 'Review and manage historical interhospital consultation records.',
      searchPlaceholder: 'Search by ID or Name...',
      filters: 'Filters',
      caseId: 'Case ID',
      patientName: 'Patient Name',
      hospital: 'Hospital',
      closeDate: 'Close Date',
      statusOutcome: 'Status / Outcome',
      actions: 'Actions',
      clearAll: 'Clear All',
      viewRecord: 'View Record',
      reactivate: 'Reactivate',
      noResults: 'No archive cases found.',
      showing: 'Showing',
      records: 'records',
    },
    requests: {
      title: 'Requests',
      subtitle: 'Manage and track inter-hospital patient transfers',
      incoming: 'Incoming Requests',
      sent: 'Sent Requests',
      sourceHospital: 'Source Hospital',
      targetHospital: 'Target Hospital',
      priority: 'Priority',
      status: 'Status',
      actions: 'Actions',
      noRequests: 'No {tab} requests found.',
      showing: 'Showing',
      totalMonthlyTransfers: 'TOTAL MONTHLY TRANSFERS',
      avgApprovalTime: 'AVG. APPROVAL TIME',
    },
    specialist: {
      title: 'Specialist Directory',
      subtitle: 'Find and consult with interhospital specialists across the network',
      searchPlaceholder: 'Search by name, specialty, or hospital',
    },
    newRequest: {
      title: 'New Consultation Request',
      subtitle: 'Send patient data for real-time consultation with specialist physicians',
      restoreDraft: 'Restore Draft',
      discard: 'Discard',
      restoreDraftQuestion: 'You have a saved draft. Would you like to restore it?',
      stepId: 'Enter ID',
      stepFetch: 'Fetch Data',
      stepReview: 'Review',
      stepSubmit: 'Submit',
      lookupTitle: 'Lookup patient by ID',
      lookupSubtitle: 'Enter a 13-digit national ID or passport number',
      lookupButton: 'Search Patient',
      cidOrPassport: 'CID (1234567890123) or Passport (A12345678)',
      loadingTitle: 'Loading patient data...',
      loadingSubtitle: 'Connecting to the database and checking',
      patientVerified: 'Verified by system',
      patientNotFound: 'No matching patient found',
      changeCid: 'Change ID',
      patientInformation: 'Patient Information',
      clinicalPresentation: 'Clinical Presentation',
      primaryComplaint: 'Primary Complaint & Symptoms',
      consultationSpecifics: 'Consultation Specifics',
      sourceHospital: 'Source Hospital',
      attachments: 'Attachments & Diagnostics',
      secureSubmission: 'Submission Secure',
      submissionSecure: 'Your request is encrypted and routed immediately to the relevant department.',
      submitRequest: 'Submit Request',
      saveAsDraft: 'Save as Draft',
      cancelRequest: 'Cancel Request',
      systemStatus: 'System Status',
      encryptionActive: 'Encryption Active',
    },
    settings: {
      profileTab: 'Profile',
      notificationsTab: 'Notifications',
      securityTab: 'Security',
      profileTitle: 'Medical Staff Profile',
      profilePhoto: 'Profile Photo',
      verifiedStaff: 'Verified medical staff',
      uploadPhoto: 'Upload Photo',
      removePhoto: 'Remove Photo',
      fullName: 'Full Name',
      titleLabel: 'Title',
      firstNameLabel: 'First Name',
      lastNameLabel: 'Last Name',
      license: 'License Number',
      specialty: 'Specialty',
      specialtyPlaceholder: 'Choose or type a specialty',
      specialtyHint: 'You can select from the list or type to search.',
      lockedFromProvider: 'Synced from Provider ID',
      hospital: 'Primary Hospital / Clinic',
      email: 'Email',
      phone: 'Phone Number',
      summary: 'Professional Summary',
      summaryHint: 'Up to 500 characters. This summary appears in the public provider directory.',
      acceptNewCases: 'Accepting new cases',
      statusAcceptingCases: 'New case acceptance status',
      cancel: 'Cancel',
      saveProfile: 'Save Profile',
      profileUpdated: 'Profile updated successfully',
      notificationsTitle: 'Notification Settings',
      notificationsSubtitle: 'Choose when and how you receive case and system alerts.',
      notificationCases: 'Case and request notifications',
      securityTitle: 'Security Settings',
      securitySubtitle: 'Manage account security, identity verification, and access control.',
      currentSession: 'Current session',
      logout: 'Logout',
      externalAccess: 'External Access',
      openBrowser: 'Open browser',
      deactivateAccount: 'Deactivate Account',
      deactivateQuestion: 'Deactivate your account?',
      deactivateDescription: 'This will temporarily disable your account and sign out every device. You can reactivate it later by signing in again.',
      confirmDeactivate: 'Confirm Deactivation',
    },
    requestSubmitted: {
      title: 'Consultation Submitted!',
      body: 'Your consultation request has been submitted successfully. All data is stored and routed under the highest security standards (HIPAA compliant).',
      referenceId: 'Reference ID',
      dashboard: 'Dashboard',
      footer: 'Encrypted Submission • Real-time Routing Active',
      loading: 'Loading...',
    },
    activityHistory: {
      title: 'Full Activity History',
      subtitle: 'Detailed clinical activity and system logs',
      activitiesFound: 'Activities Found',
      timeRange: 'Time Range:',
      details: 'Details',
      noActivities: 'No activities found',
      noActivitiesSubtitle: "Try adjusting your search terms or date range to find what you're looking for.",
      clearSearch: 'Clear search',
      showAllTime: 'Show all time',
    },
    patientDetail: {
      backToPrevious: 'Back',
      activeConsultation: 'Active Consultation',
      updateDiagnosis: 'Update Diagnosis',
      uploadFiles: 'Upload Files',
      closeCase: 'Close Case',
      activeCases: 'Active Cases',
      overview: 'Overview',
      labs: 'Labs',
      medications: 'Medications',
      imaging: 'Imaging',
      currentVitals: 'Current Vitals',
      recentLabResults: 'Recent Lab Results',
      clinicalDataPending: 'Clinical data for {tab} is being compiled...',
      noKnownData: 'No data available',
      fromDatabase: 'Data loaded from the database',
      uploadFailed: 'Upload failed',
      uploadedToCaseFile: 'File uploaded to case files',
      consultNotePosted: 'Consult note posted to database',
      failedToPostNote: 'Failed to post note',
    },
    consultationStatus: {
      backToPrevious: 'Back to Previous',
      sendMessage: 'Send Message',
      uploadImaging: 'Upload Imaging',
      updateDiagnosis: 'Update Diagnosis',
      closeCase: 'Close Case',
      medicalHistory: 'Medical History',
      preExistingConditions: 'Pre-existing Conditions',
      allergies: 'Allergies',
      currentSymptoms: 'Current Symptoms',
      initialDiagnosis: 'Initial Diagnosis',
      consultationTeam: 'Consultation Team',
      inviteConsultant: 'Invite Consultant',
      vitalsLabs: 'Vitals & Labs',
      consultationNotes: 'Consultation Notes',
      medications: 'Medications',
      labs: 'Labs',
      imaging: 'Imaging',
      currentVitals: 'Current Vitals',
      recentLabResults: 'Recent Lab Results',
      placeholder: 'Clinical data for {tab} is being compiled...',
    },
    messageSpecialist: {
      searchPlaceholder: 'Search cases...',
      activeCases: 'Active cases',
      caseFiles: 'Files in this case',
      viewAllFiles: 'View all files',
      online: 'Online',
      startConsultation: 'Started consultation on',
      typedPlaceholder: 'Type a medical note or response...',
      hipaa: 'HIPAA compliant',
      endToEnd: 'End-to-end encrypted',
      viewPatientDetail: 'View patient details',
    },
  },
  th: {
    common: {
      appName: 'ระบบปรึกษาแพทย์พิษณุโลก',
      medConsultation: 'ระบบปรึกษาแพทย์',
      thai: 'ไทย',
      english: 'อังกฤษ',
      searchEverything: 'ค้นหาทั้งหมด - เคส, ผู้เชี่ยวชาญ, หน้าโปรแกรม...',
      searchLogs: 'ค้นหาบันทึก...',
      searchByIdOrName: 'ค้นหาด้วยเลขที่หรือชื่อ...',
      allHospitals: 'โรงพยาบาลทั้งหมด',
      allSpecialties: 'ทุกสาขาเฉพาะทาง',
      allOutcomes: 'ทุกผลลัพธ์',
      allTime: 'ทุกช่วงเวลา',
      clearAll: 'ล้างทั้งหมด',
      clearSearch: 'ล้างการค้นหา',
      cancel: 'ยกเลิก',
      save: 'บันทึก',
      submit: 'ส่ง',
      approve: 'อนุมัติ',
      decline: 'ปฏิเสธ',
      closeCase: 'ปิดเคส',
      viewAll: 'ดูทั้งหมด',
      loading: 'กำลังโหลด...',
      back: 'กลับ',
      dashboard: 'แดชบอร์ด',
      activeCases: 'เคสที่กำลังดำเนินการ',
      requests: 'คำขอ',
      specialists: 'ผู้เชี่ยวชาญ',
      archivedCases: 'เคสที่เก็บถาวร',
      settings: 'การตั้งค่า',
      profile: 'โปรไฟล์',
      notifications: 'การแจ้งเตือน',
      security: 'ความปลอดภัย',
      go: 'ไป',
      available: 'พร้อมใช้งาน',
      unavailable: 'ไม่พร้อมใช้งาน',
      goToDashboard: 'แดชบอร์ด',
      summary: 'สรุป',
      details: 'รายละเอียด',
      timeRange: 'ช่วงเวลา:',
      noResults: 'ไม่พบข้อมูล',
      noData: 'ไม่มีข้อมูล',
    },
    language: {
      switcherLabel: 'ภาษา',
      current: 'TH',
    },
    login: {
      title: 'เข้าสู่ระบบ',
      subtitle: 'เข้าสู่พอร์ทัลผู้ให้บริการด้านสุขภาพที่ปลอดภัย',
      providerLogin: 'เข้าสู่ระบบด้วย Provider ID',
      footer: '© 2026 สำนักงานสาธารณสุขจังหวัดพิษณุโลก สงวนลิขสิทธิ์',
    },
    authCallback: {
      authenticating: 'กำลังตรวจสอบสิทธิ์...',
      exchange: 'กำลังแลกโทเคนและยืนยันตัวตนอย่างปลอดภัย...',
      success: 'สำเร็จ! กำลังเปลี่ยนหน้า...',
      missingCode: 'ไม่พบรหัสยืนยันตัวตน',
      failed: 'ยืนยันตัวตนไม่สำเร็จ กรุณาลองอีกครั้ง',
      authFailedTitle: 'ยืนยันตัวตนไม่สำเร็จ',
      returnToLogin: 'กลับไปหน้าเข้าสู่ระบบ',
      pleaseWait: 'กรุณารอสักครู่ ระบบกำลังรักษาความปลอดภัยการเชื่อมต่อ',
      initializing: 'กำลังเริ่มต้น...',
    },
    nav: {
      dashboard: 'แดชบอร์ด',
      activeCases: 'เคสที่กำลังดำเนินการ',
      requests: 'คำขอ',
      specialists: 'ผู้เชี่ยวชาญ',
      archivedCases: 'เคสที่เก็บถาวร',
      settings: 'การตั้งค่า',
      newRequest: 'สร้างคำขอใหม่',
      home: 'หน้าแรก',
    },
    header: {
      searchPlaceholder: 'ค้นหาทั้งหมด - เคส, ผู้เชี่ยวชาญ, หน้าโปรแกรม...',
      activeCases: 'เคสที่กำลังดำเนินการ',
      requests: 'คำขอ',
      archivedCases: 'เคสที่เก็บถาวร',
      specialists: 'ผู้เชี่ยวชาญ',
      notifications: 'การแจ้งเตือน',
      pages: 'หน้า',
      available: 'พร้อมใช้งาน',
      unavailable: 'ไม่พร้อมใช้งาน',
      go: 'ไป',
    },
    dashboard: {
      title: 'ภาพรวมแดชบอร์ด',
      subtitle: 'ยินดีต้อนรับกลับ นี่คือความเคลื่อนไหวของวันนี้',
      activeConsultationCases: 'เคสปรึกษาที่กำลังดำเนินการ',
      currentlyBeingReviewed: 'กำลังอยู่ระหว่างการทบทวน',
      pendingRequests: 'คำขอรอดำเนินการ',
      requiresImmediateAttention: 'ต้องให้ความสนใจทันที',
      availableSpecialists: 'ผู้เชี่ยวชาญที่พร้อมใช้งาน',
      specialistsAcceptingCasesNow: 'คน กำลังรับเคสอยู่ตอนนี้',
      activeConsultations: 'เคสปรึกษาที่กำลังดำเนินการ',
      activeConsultationsEmpty: 'ไม่พบเคสที่กำลังดำเนินการ',
      newRequestsAppear: 'คำขอใหม่จะปรากฏที่นี่เมื่อได้รับการอนุมัติ',
      activityFeed: 'ฟีดกิจกรรม',
      refreshFeed: 'รีเฟรชฟีด',
      refreshing: 'กำลังรีเฟรช...',
      patientName: 'ชื่อผู้ป่วย',
      primaryHospital: 'โรงพยาบาลหลัก',
      priority: 'ความเร่งด่วน',
      lastActivity: 'กิจกรรมล่าสุด',
    },
    activeCases: {
      title: 'เคสที่กำลังดำเนินการ',
      subtitle: 'ติดตามและจัดการเคสปรึกษาระหว่างโรงพยาบาลที่มีความสำคัญสูง',
      searchPlaceholder: 'ค้นหาด้วย ID หรือชื่อ...',
      quickFilters: 'ตัวกรองด่วน:',
      allCases: 'ทุกเคส',
      internal: 'ภายใน',
      external: 'ภายนอก',
      caseId: 'รหัสเคส',
      patientName: 'ชื่อผู้ป่วย',
      primaryHospital: 'โรงพยาบาลหลัก',
      priorityUrgency: 'ความสำคัญ / ความเร่งด่วน',
      lastActivity: 'กิจกรรมล่าสุด',
      noMatching: 'ไม่พบเคสที่ตรงเงื่อนไข',
      resetAllFilters: 'รีเซ็ตตัวกรองทั้งหมด',
      showing: 'แสดง',
      activeCasesLabel: 'เคสที่กำลังดำเนินการ',
      urgency: 'ความเร่งด่วน',
      primaryHospitalLabel: 'โรงพยาบาลหลัก',
    },
    archiveCases: {
      title: 'เคสที่เก็บถาวร',
      subtitle: 'ตรวจสอบและจัดการบันทึกการปรึกษาย้อนหลังระหว่างโรงพยาบาล',
      searchPlaceholder: 'ค้นหาด้วย ID หรือชื่อ...',
      filters: 'ตัวกรอง',
      caseId: 'รหัสเคส',
      patientName: 'ชื่อผู้ป่วย',
      hospital: 'โรงพยาบาล',
      closeDate: 'วันที่ปิดเคส',
      statusOutcome: 'สถานะ / ผลลัพธ์',
      actions: 'การทำงาน',
      clearAll: 'ล้างทั้งหมด',
      viewRecord: 'ดูบันทึก',
      reactivate: 'เปิดใช้งานอีกครั้ง',
      noResults: 'ไม่พบเคสในคลัง',
      showing: 'แสดง',
      records: 'รายการ',
    },
    requests: {
      title: 'คำขอ',
      subtitle: 'จัดการและติดตามการส่งต่อผู้ป่วยระหว่างโรงพยาบาล',
      incoming: 'คำขอที่เข้ามา',
      sent: 'คำขอที่ส่งแล้ว',
      sourceHospital: 'โรงพยาบาลต้นทาง',
      targetHospital: 'โรงพยาบาลปลายทาง',
      priority: 'ความเร่งด่วน',
      status: 'สถานะ',
      actions: 'การทำงาน',
      noRequests: 'ไม่พบคำขอ {tab}',
      showing: 'แสดง',
      totalMonthlyTransfers: 'การส่งต่อรายเดือนทั้งหมด',
      avgApprovalTime: 'เวลาอนุมัติเฉลี่ย',
    },
    specialist: {
      title: 'ไดเรกทอรีผู้เชี่ยวชาญ',
      subtitle: 'ค้นหาและปรึกษาผู้เชี่ยวชาญระหว่างโรงพยาบาลในเครือข่าย',
      searchPlaceholder: 'ค้นหาด้วยชื่อ สาขา หรือโรงพยาบาล',
    },
    newRequest: {
      title: 'คำขอปรึกษาใหม่',
      subtitle: 'ส่งข้อมูลผู้ป่วยเพื่อรับการปรึกษาจากแพทย์ผู้เชี่ยวชาญแบบเรียลไทม์',
      restoreDraft: 'กู้คืนแบบร่าง',
      discard: 'ละทิ้ง',
      restoreDraftQuestion: 'คุณมีแบบร่างที่บันทึกไว้ ต้องการกู้คืนหรือไม่?',
      stepId: 'กรอก ID',
      stepFetch: 'ดึงข้อมูล',
      stepReview: 'ตรวจสอบ',
      stepSubmit: 'ส่งคำขอ',
      lookupTitle: 'ค้นหาผู้ป่วยจากเลขประจำตัว',
      lookupSubtitle: 'กรอกเลขบัตรประชาชน 13 หลัก หรือหมายเลขพาสปอร์ต',
      lookupButton: 'ค้นหาผู้ป่วย',
      cidOrPassport: 'CID (1234567890123) หรือ Passport (A12345678)',
      loadingTitle: 'กำลังดึงข้อมูลผู้ป่วย...',
      loadingSubtitle: 'กำลังเชื่อมต่อฐานข้อมูลและตรวจสอบ',
      patientVerified: 'ข้อมูลผ่านการตรวจสอบโดยระบบ',
      patientNotFound: 'ไม่พบข้อมูลในฐานข้อมูล',
      changeCid: 'เปลี่ยน ID',
      patientInformation: 'ข้อมูลผู้ป่วย',
      clinicalPresentation: 'อาการและการนำเสนอทางคลินิก',
      primaryComplaint: 'อาการหลักและประวัติอาการ',
      consultationSpecifics: 'รายละเอียดการปรึกษา',
      sourceHospital: 'โรงพยาบาลต้นทาง (ที่ผู้ป่วยอยู่)',
      attachments: 'ไฟล์แนบและการตรวจวินิจฉัย',
      secureSubmission: 'การส่งข้อมูลปลอดภัย',
      submissionSecure: 'คำขอของคุณจะถูกเข้ารหัสและส่งตรงไปยังแผนกที่เกี่ยวข้องทันที',
      submitRequest: 'ส่งคำขอ',
      saveAsDraft: 'บันทึกเป็นแบบร่าง',
      cancelRequest: 'ยกเลิกคำขอ',
      systemStatus: 'สถานะระบบ',
      encryptionActive: 'กำลังเข้ารหัส',
    },
    settings: {
      profileTab: 'โปรไฟล์',
      notificationsTab: 'การแจ้งเตือน',
      securityTab: 'ความปลอดภัย',
      profileTitle: 'โปรไฟล์บุคลากรทางการแพทย์',
      profilePhoto: 'รูปโปรไฟล์',
      verifiedStaff: 'บุคลากรทางการแพทย์ที่ได้รับการยืนยัน',
      uploadPhoto: 'อัปโหลดรูป',
      removePhoto: 'ลบรูป',
      fullName: 'ชื่อ-นามสกุล',
      titleLabel: 'คำนำหน้า',
      firstNameLabel: 'ชื่อ',
      lastNameLabel: 'นามสกุล',
      license: 'เลขใบอนุญาต',
      specialty: 'สาขาเฉพาะทาง',
      specialtyPlaceholder: 'เลือกหรือพิมพ์สาขาเฉพาะทาง',
      specialtyHint: 'สามารถเลือกจากรายการหรือพิมพ์ค้นหาได้',
      lockedFromProvider: 'ซิงก์จาก Provider ID',
      hospital: 'สังกัดโรงพยาบาล/คลินิกหลัก',
      email: 'อีเมล',
      phone: 'เบอร์โทรศัพท์',
      summary: 'สรุปประวัติวิชาชีพ',
      summaryHint: 'ไม่เกิน 500 ตัวอักษร สรุปนี้จะแสดงในไดเรกทอรีผู้ให้บริการสาธารณะ',
      acceptNewCases: 'รับเคสใหม่',
      statusAcceptingCases: 'สถานะการรับเคสใหม่',
      cancel: 'ยกเลิก',
      saveProfile: 'บันทึกโปรไฟล์',
      profileUpdated: 'อัปเดตโปรไฟล์เรียบร้อยแล้ว',
      notificationsTitle: 'การตั้งค่าการแจ้งเตือน',
      notificationsSubtitle: 'กำหนดว่าคุณจะได้รับการแจ้งเตือนเกี่ยวกับเคสและเหตุการณ์ระบบเมื่อใดและอย่างไร',
      notificationCases: 'การแจ้งเตือนเคสและคำขอ',
      securityTitle: 'การตั้งค่าความปลอดภัย',
      securitySubtitle: 'จัดการความปลอดภัยของบัญชี การยืนยันตัวตน และการควบคุมการเข้าถึง',
      currentSession: 'เซสชันปัจจุบัน',
      logout: 'ออกจากระบบ',
      externalAccess: 'การเข้าถึงภายนอก',
      openBrowser: 'เปิดเบราว์เซอร์',
      deactivateAccount: 'ปิดใช้งานบัญชี',
      deactivateQuestion: 'ต้องการปิดใช้งานบัญชีหรือไม่?',
      deactivateDescription: 'การดำเนินการนี้จะปิดใช้งานบัญชีชั่วคราวและออกจากระบบทุกอุปกรณ์ คุณสามารถเปิดใช้งานบัญชีอีกครั้งได้เมื่อเข้าสู่ระบบใหม่',
      confirmDeactivate: 'ยืนยันการปิดใช้งาน',
    },
    requestSubmitted: {
      title: 'ส่งคำขอปรึกษาเรียบร้อยแล้ว!',
      body: 'คำขอรับการปรึกษาของคุณถูกส่งเข้าระบบเรียบร้อยแล้ว โดยข้อมูลทั้งหมดจะถูกจัดเก็บและส่งต่อภายใต้มาตรฐานความปลอดภัยระดับสูงสุด (HIPAA compliant)',
      referenceId: 'รหัสอ้างอิง',
      dashboard: 'แดชบอร์ด',
      footer: 'การส่งข้อมูลแบบเข้ารหัส • เปิดใช้งานการส่งต่อแบบเรียลไทม์',
      loading: 'กำลังโหลด...',
    },
    activityHistory: {
      title: 'ประวัติกิจกรรมทั้งหมด',
      subtitle: 'บันทึกกิจกรรมทางคลินิกและระบบอย่างละเอียด',
      activitiesFound: 'รายการกิจกรรมที่พบ',
      timeRange: 'ช่วงเวลา:',
      details: 'รายละเอียด',
      noActivities: 'ไม่พบกิจกรรม',
      noActivitiesSubtitle: 'ลองปรับคำค้นหาหรือช่วงวันที่เพื่อค้นหาสิ่งที่ต้องการ',
      clearSearch: 'ล้างการค้นหา',
      showAllTime: 'แสดงทั้งหมด',
    },
    patientDetail: {
      backToPrevious: 'ย้อนกลับ',
      activeConsultation: 'เคสกำลังดำเนินการ',
      updateDiagnosis: 'อัปเดตการวินิจฉัย',
      uploadFiles: 'อัปโหลดไฟล์',
      closeCase: 'ปิดเคส',
      activeCases: 'เคสที่กำลังดำเนินการ',
      overview: 'ภาพรวม',
      labs: 'แล็บ',
      medications: 'ยา',
      imaging: 'ภาพถ่าย',
      currentVitals: 'สัญญาณชีพปัจจุบัน',
      recentLabResults: 'ผลแล็บล่าสุด',
      clinicalDataPending: 'กำลังจัดเตรียมข้อมูลทางคลินิกสำหรับ {tab} ...',
      noKnownData: 'ไม่มีข้อมูล',
      fromDatabase: 'ข้อมูลจากฐานข้อมูล',
      uploadFailed: 'อัปโหลดไม่สำเร็จ',
      uploadedToCaseFile: 'อัปโหลดไฟล์เข้าสู่เคสแล้ว',
      consultNotePosted: 'บันทึกการปรึกษาถูกส่งเข้าฐานข้อมูลแล้ว',
      failedToPostNote: 'ไม่สามารถบันทึกโน้ตได้',
    },
    consultationStatus: {
      backToPrevious: 'ย้อนกลับ',
      sendMessage: 'ส่งข้อความ',
      uploadImaging: 'อัปโหลดภาพถ่าย',
      updateDiagnosis: 'อัปเดตการวินิจฉัย',
      closeCase: 'ปิดเคส',
      medicalHistory: 'ประวัติทางการแพทย์',
      preExistingConditions: 'โรคประจำตัว',
      allergies: 'ประวัติแพ้ยา',
      currentSymptoms: 'อาการปัจจุบัน',
      initialDiagnosis: 'วินิจฉัยเบื้องต้น',
      consultationTeam: 'ทีมปรึกษา',
      inviteConsultant: 'เชิญผู้เชี่ยวชาญ',
      vitalsLabs: 'สัญญาณชีพและแล็บ',
      consultationNotes: 'บันทึกการปรึกษา',
      medications: 'ยา',
      labs: 'แล็บ',
      imaging: 'ภาพถ่าย',
      currentVitals: 'สัญญาณชีพปัจจุบัน',
      recentLabResults: 'ผลแล็บล่าสุด',
      placeholder: 'กำลังรวบรวมข้อมูลทางคลินิกสำหรับ {tab} ...',
    },
    messageSpecialist: {
      searchPlaceholder: 'ค้นหาเคส...',
      activeCases: 'เคสที่กำลังดำเนินการ',
      caseFiles: 'ไฟล์ในเคสนี้',
      viewAllFiles: 'ดูไฟล์ทั้งหมด',
      online: 'ออนไลน์',
      startConsultation: 'เริ่มปรึกษาเมื่อ',
      typedPlaceholder: 'พิมพ์ข้อสังเกตทางการแพทย์หรือคำตอบ...',
      hipaa: 'เป็นไปตาม HIPAA',
      endToEnd: 'เข้ารหัสครบวงจร',
      viewPatientDetail: 'ดูรายละเอียดผู้ป่วย',
    },
  },
};

export function createTranslator(language: Language) {
  return function t(path: string, vars?: Record<string, string | number>) {
    const segments = path.split('.');
    let value: any = messages[language];
    for (const segment of segments) value = value?.[segment];
    if (typeof value !== 'string') return path;
    if (!vars) return value;
    return value.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? `{${key}}`));
  };
}
