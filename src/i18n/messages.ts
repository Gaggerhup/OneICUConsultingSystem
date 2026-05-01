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
    waitForReview: string;
    justNow: string;
    viewFullHistory: string;
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
    immediateLifeThreatening: string;
    emergency: string;
    urgent: string;
    semiUrgent: string;
    nonUrgent: string;
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
    downloadRecord: string;
    downloadTxt: string;
    downloadPdf: string;
    downloadTxtStarted: string;
    downloadPdfStarted: string;
    downloadFailed: string;
    reactivate: string;
    noResults: string;
    showing: string;
    records: string;
    allTime: string;
    last7Days: string;
    last30Days: string;
    last90Days: string;
    last12Months: string;
    discharge: string;
    referred: string;
    dead: string;
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
    lookupHint: string;
    patientAutofillHint: string;
    patientManualEntryHint: string;
    reviewHighlightedFields: string;
    hospitalNumber: string;
    admissionNumber: string;
    patientFullName: string;
    age: string;
    gender: string;
    selectGender: string;
    male: string;
    female: string;
    other: string;
    bloodType: string;
    phoneLabel: string;
    dob: string;
    district: string;
    province: string;
    conditions: string;
    allergies: string;
    currentSymptomsLabel: string;
    currentSymptomsPlaceholder: string;
    initialDiagnosis: string;
    clinicalNotes: string;
    clinicalNotesPlaceholder: string;
    selectHospital: string;
    uploadZoneTitle: string;
    uploadZoneHint: string;
    submitting: string;
    saving: string;
    lookupFailed: string;
    immediate: string;
    lifeThreatening: string;
    highRisk: string;
    serious: string;
    stable: string;
    routine: string;
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
    titleLabel: string;
    firstNameLabel: string;
    lastNameLabel: string;
    license: string;
    specialty: string;
    specialtyPlaceholder: string;
    specialtyHint: string;
    lockedFromProvider: string;
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
    checkingSession: string;
    lastUsedUnavailable: string;
    todayAt: string;
    connected: string;
    notConnected: string;
    providerIdOauth: string;
    activeSessions: string;
    activeSessionsHint: string;
    noProviderSession: string;
    openExternalBrowser: string;
    openExternalBrowserHint: string;
    deactivateAccountHint: string;
    accountDeactivated: string;
    connectedLastUsed: string;
    telegramPersonalChat: string;
    telegramChatId: string;
    telegramChatIdHint: string;
    notificationNewRequest: string;
    notificationNewRequestHint: string;
    notificationStatusChange: string;
    notificationStatusChangeHint: string;
    notificationNewMessage: string;
    notificationNewMessageHint: string;
    notificationCaseUpdate: string;
    notificationCaseUpdateHint: string;
    thisDevice: string;
    otherDevice: string;
    onDevice: string;
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
    backLabel: string;
    requestsPage: string;
    archiveCasesPage: string;
    activeCasesPage: string;
    pendingRequest: string;
    declinedStatus: string;
    closedStatus: string;
    clinicalWorkspace: string;
    clinicalWorkspaceHint: string;
    filesLabel: string;
    notesLabel: string;
    labsLabel: string;
    aiSummaryCase: string;
    patientCaseSummary: string;
    generatedFromCurrentPage: string;
    closeAiSummary: string;
    copied: string;
    copySummary: string;
    attach: string;
    image: string;
    onlineCount: string;
    typeMessage: string;
    editorAdd: string;
    editorEdit: string;
    closeEditor: string;
    fixHighlightedFields: string;
    cancelLabel: string;
    saveLabel: string;
    savingLabel: string;
    noteLabel: string;
    fileName: string;
    category: string;
    description: string;
    patientNameRequired: string;
    hnRequired: string;
    ageRangeError: string;
    dobInvalid: string;
    bpFormat: string;
    gcsRequired: string;
    recordedTimeRequired: string;
    hrRange: string;
    tempRange: string;
    rrRange: string;
    spo2Range: string;
    labNameRequired: string;
    resultRequired: string;
    statusRequired: string;
    medicationNameRequired: string;
    doseRequired: string;
    frequencyRequired: string;
    routeRequired: string;
    noteEmpty: string;
    addOrderRequired: string;
    fileNameRequired: string;
    categoryRequired: string;
    previewFallback: string;
    closePreview: string;
    dicomStudy: string;
    dicomPreviewHint: string;
    csvDataFile: string;
    csvPreviewHint: string;
    noPreviewAvailable: string;
    noPreviewHint: string;
    downloadLabel: string;
    closeLabel: string;
    interactiveVitalTrend: string;
    trendOverlayHint: string;
    selectedCards: string;
    seriesShown: string;
    lastUpdate: string;
    normalized: string;
    multiAxis: string;
    normalizedHint: string;
    multiAxisHint: string;
    closeTrendChart: string;
    closeTooltip: string;
    selectVitalHint: string;
    noTrendData: string;
    bloodPressure: string;
    target60to100: string;
    target90to120: string;
    target60to80: string;
    target365to375: string;
    target12to20: string;
    target95to100: string;
    target13to15: string;
    low: string;
    high: string;
    withinTarget: string;
    closeConsultationCase: string;
    closeCaseHint: string;
    confirmAndClose: string;
    patientDetailUpdated: string;
    saveFailed: string;
    deleteVitalConfirm: string;
    deleteLabConfirm: string;
    deleteMedicationConfirm: string;
    deleteNoteConfirm: string;
    deleteOrderConfirm: string;
    deleteFileConfirm: string;
    deleteItemConfirm: string;
    vitalDeleted: string;
    labDeleted: string;
    medicationDeleted: string;
    noteDeleted: string;
    orderDeleted: string;
    fileDeleted: string;
    itemDeleted: string;
    deleteVitalFailed: string;
    deleteLabFailed: string;
    deleteMedicationFailed: string;
    deleteNoteFailed: string;
    deleteOrderFailed: string;
    deleteFileFailed: string;
    deleteFailed: string;
    caseClosed: string;
    approvedCase: string;
    declinedCase: string;
    noCaseSelectedTitle: string;
    noCaseSelectedHint: string;
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
    yearsOld: string;
    defaultReason: string;
    defaultPatientName: string;
    female: string;
    male: string;
    reviewing: string;
    replied: string;
    invited: string;
    lead: string;
    consultant: string;
    preExistingConditionsValue: string;
    allergiesValue: string;
    suspectedDiagnosis: string;
    testLabel: string;
    resultLabel: string;
    refLabel: string;
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
    phitsanulok: string;
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
      waitForReview: 'Wait for review',
      justNow: 'Just now',
      viewFullHistory: 'View Full History',
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
      immediateLifeThreatening: 'Immediate Life-threatening',
      emergency: 'Emergency',
      urgent: 'Urgent',
      semiUrgent: 'Semi-urgent',
      nonUrgent: 'Non-urgent',
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
      downloadRecord: 'Download Record',
      downloadTxt: 'Download .txt',
      downloadPdf: 'Download PDF',
      downloadTxtStarted: 'TXT archive record downloaded',
      downloadPdfStarted: 'PDF archive record downloaded',
      downloadFailed: 'Unable to download archive record',
      reactivate: 'Reactivate',
      noResults: 'No archive cases found.',
      showing: 'Showing',
      records: 'records',
      allTime: 'All Time',
      last7Days: 'Last 7 Days',
      last30Days: 'Last 30 Days',
      last90Days: 'Last 90 Days',
      last12Months: 'Last 12 Months',
      discharge: 'Discharge',
      referred: 'Referred',
      dead: 'Dead',
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
      lookupHint: 'The system checks the real database first and then falls back to examples such as {examples}',
      patientAutofillHint: 'Patient data was auto-filled from the database. Please verify it before submitting.',
      patientManualEntryHint: 'CID: {cid} — Please fill in the patient details manually.',
      reviewHighlightedFields: 'Please review the highlighted fields before submitting.',
      hospitalNumber: 'Hospital Number (HN)',
      admissionNumber: 'Admission Number (AN)',
      patientFullName: 'Patient Full Name',
      age: 'Age',
      gender: 'Gender',
      selectGender: 'Select Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      bloodType: 'Blood Type',
      phoneLabel: 'Phone',
      dob: 'DOB',
      district: 'District',
      province: 'Province',
      conditions: 'Conditions',
      allergies: 'Allergies',
      currentSymptomsLabel: 'Current Symptoms',
      currentSymptomsPlaceholder: 'Current symptoms and brief illness history...',
      initialDiagnosis: 'Initial Diagnosis',
      clinicalNotes: 'Clinical Notes',
      clinicalNotesPlaceholder: 'Additional clinical notes...',
      selectHospital: 'Select Hospital',
      uploadZoneTitle: 'Click or drag files here',
      uploadZoneHint: 'Supports Imaging (DICOM), PDF, and medical reports (max 50MB)',
      submitting: 'Submitting...',
      saving: 'Saving...',
      lookupFailed: 'Unable to look up patient data right now',
      immediate: '1. Immediate',
      lifeThreatening: 'Life-threatening',
      highRisk: 'High risk',
      serious: 'Serious',
      stable: 'Stable',
      routine: 'Routine',
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
      checkingSession: 'Checking session...',
      lastUsedUnavailable: 'Last used time unavailable',
      todayAt: 'today at {time}',
      connected: 'Connected',
      notConnected: 'Not connected',
      providerIdOauth: 'Provider ID (OAuth)',
      activeSessions: 'Active sessions',
      activeSessionsHint: 'Manage and sign out other active devices.',
      noProviderSession: 'No Provider ID session was found in this browser.',
      openExternalBrowser: 'Open in external browser',
      openExternalBrowserHint: 'Open Antigravity in Chrome or Safari for a normal web experience and sign in again.',
      deactivateAccountHint: 'Temporarily disable your account and reactivate it later.',
      accountDeactivated: 'Account deactivated successfully',
      connectedLastUsed: 'Connected - last used {time}',
      telegramPersonalChat: 'Telegram (Personal Chat)',
      telegramChatId: 'Telegram Chat ID',
      telegramChatIdHint: 'To receive notifications in your personal Telegram account, start a chat with our bot (@OneICUTestBot or the designated bot) and type /start. It will reply with your Chat ID. Enter it here.',
      notificationNewRequest: 'New consultation request',
      notificationNewRequestHint: 'Notify when a new consultation request is submitted.',
      notificationStatusChange: 'Request status changed',
      notificationStatusChangeHint: 'When your request is approved or declined.',
      notificationNewMessage: 'New message from specialist',
      notificationNewMessageHint: 'Chat messages and case comments.',
      notificationCaseUpdate: 'Case activity updates',
      notificationCaseUpdateHint: 'Vitals, lab, and case note updates.',
      thisDevice: 'This device',
      otherDevice: 'Other device',
      onDevice: 'on',
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
      backLabel: 'Back',
      requestsPage: 'Requests',
      archiveCasesPage: 'Archive Cases',
      activeCasesPage: 'Active Cases',
      pendingRequest: 'Pending Request',
      declinedStatus: 'Declined',
      closedStatus: 'Closed ({outcome})',
      clinicalWorkspace: 'Clinical Workspace',
      clinicalWorkspaceHint: 'Structured patient context, investigations, treatment, and consult timeline in one view.',
      filesLabel: 'Files',
      notesLabel: 'Notes',
      labsLabel: 'Labs',
      aiSummaryCase: 'AI Summary Case',
      patientCaseSummary: '{name} case summary',
      generatedFromCurrentPage: 'Generated {time} from patient detail data currently loaded on this page.',
      closeAiSummary: 'Close AI summary',
      copied: 'Copied',
      copySummary: 'Copy summary',
      attach: 'Attach',
      image: 'Image',
      onlineCount: '{count} Online',
      typeMessage: 'Type a message...',
      editorAdd: 'Add',
      editorEdit: 'Edit',
      closeEditor: 'Close editor',
      fixHighlightedFields: 'Please fix the highlighted fields before saving.',
      cancelLabel: 'Cancel',
      saveLabel: 'Save',
      savingLabel: 'Saving...',
      noteLabel: 'Note',
      fileName: 'File Name',
      category: 'Category',
      description: 'Description',
      patientNameRequired: 'Patient name is required',
      hnRequired: 'HN is required',
      ageRangeError: 'Age must be between 0 and 130',
      dobInvalid: 'DOB is invalid',
      bpFormat: 'Use format 120/80',
      gcsRequired: 'GCS is required',
      recordedTimeRequired: 'Recorded time is required',
      hrRange: 'HR must be between 1 and 300',
      tempRange: 'Temp must be between 25 and 45',
      rrRange: 'RR must be between 1 and 80',
      spo2Range: 'SpO2 must be between 0 and 100',
      labNameRequired: 'Lab name is required',
      resultRequired: 'Result is required',
      statusRequired: 'Status is required',
      medicationNameRequired: 'Medication name is required',
      doseRequired: 'Dose is required',
      frequencyRequired: 'Frequency is required',
      routeRequired: 'Route is required',
      noteEmpty: 'Note cannot be empty',
      addOrderRequired: 'Add one-day or continuation order',
      fileNameRequired: 'File name is required',
      categoryRequired: 'Category is required',
      previewFallback: 'File preview',
      closePreview: 'Close preview',
      dicomStudy: 'DICOM study',
      dicomPreviewHint: 'Open this file in a DICOM viewer to inspect the scan.',
      csvDataFile: 'CSV data file',
      csvPreviewHint: 'Download to inspect the dataset in a spreadsheet.',
      noPreviewAvailable: 'No preview available',
      noPreviewHint: 'This file does not have a browsable URL.',
      downloadLabel: 'Download',
      closeLabel: 'Close',
      interactiveVitalTrend: 'Interactive Vital Trend',
      trendOverlayHint: 'One graph can show multiple selected cards together. Click cards or toggles below to add or remove series.',
      selectedCards: 'Selected cards',
      seriesShown: 'Series shown',
      lastUpdate: 'Last update',
      normalized: 'Normalized',
      multiAxis: 'Multi-axis',
      normalizedHint: 'Normalized overlays all selected vitals on one relative 0-100% scale so you can compare movement and shape.',
      multiAxisHint: 'Multi-axis stacks each series in its own lane so every metric keeps its own reading range within the same timeline.',
      closeTrendChart: 'Close trend chart',
      closeTooltip: 'Close tooltip',
      selectVitalHint: 'Select at least one vital card to display the graph.',
      noTrendData: 'No trend data available.',
      bloodPressure: 'Blood Pressure',
      target60to100: 'Target 60-100 bpm',
      target90to120: 'Target 90-120 mmHg',
      target60to80: 'Target 60-80 mmHg',
      target365to375: 'Target 36.5-37.5°C',
      target12to20: 'Target 12-20 /min',
      target95to100: 'Target 95-100%',
      target13to15: 'Target 13-15',
      low: 'Low',
      high: 'High',
      withinTarget: 'Within target',
      closeConsultationCase: 'Close Consultation Case',
      closeCaseHint: 'Select an outcome to finalize this case. This action cannot be undone.',
      confirmAndClose: 'Confirm & Close',
      patientDetailUpdated: 'Patient detail updated',
      saveFailed: 'Save failed',
      deleteVitalConfirm: 'Delete this vital record?',
      deleteLabConfirm: 'Delete this lab result?',
      deleteMedicationConfirm: 'Delete this medication entry?',
      deleteNoteConfirm: 'Delete this consult note?',
      deleteOrderConfirm: 'Delete this order summary?',
      deleteFileConfirm: 'Delete this file? The uploaded file will also be removed.',
      deleteItemConfirm: 'Delete this item?',
      vitalDeleted: 'Vital deleted',
      labDeleted: 'Lab result deleted',
      medicationDeleted: 'Medication deleted',
      noteDeleted: 'Consult note deleted',
      orderDeleted: 'Order summary deleted',
      fileDeleted: 'File deleted',
      itemDeleted: 'Item deleted',
      deleteVitalFailed: 'Failed to delete vital',
      deleteLabFailed: 'Failed to delete lab result',
      deleteMedicationFailed: 'Failed to delete medication',
      deleteNoteFailed: 'Failed to delete consult note',
      deleteOrderFailed: 'Failed to delete order summary',
      deleteFileFailed: 'Failed to delete file',
      deleteFailed: 'Delete failed',
      caseClosed: 'Case closed - {outcome}',
      approvedCase: 'Approved {name}',
      declinedCase: 'Declined {name}',
      noCaseSelectedTitle: 'No case selected',
      noCaseSelectedHint: 'Open a case from Active Cases or Requests so the patient workspace can load the right clinical context.',
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
      yearsOld: 'years old',
      defaultReason: 'Persistent sharp abdominal pain (lower right quadrant), low-grade fever (100.4°F), nausea for 24 hours.',
      defaultPatientName: 'Sarah Jenkins',
      female: 'Female',
      male: 'Male',
      reviewing: 'Reviewing',
      replied: 'Replied',
      invited: 'Invited',
      lead: 'Lead',
      consultant: 'Consultant',
      preExistingConditionsValue: 'Type 2 Diabetes, Mild Hypertension',
      allergiesValue: 'Penicillin, Latex',
      suspectedDiagnosis: 'Acute Appendicitis (Suspected)',
      testLabel: 'Test',
      resultLabel: 'Result',
      refLabel: 'Ref',
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
      phitsanulok: 'Phitsanulok',
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
      waitForReview: 'รอการทบทวน',
      justNow: 'เมื่อสักครู่',
      viewFullHistory: 'ดูประวัติทั้งหมด',
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
      immediateLifeThreatening: 'อันตรายถึงชีวิตทันที',
      emergency: 'ฉุกเฉิน',
      urgent: 'เร่งด่วน',
      semiUrgent: 'กึ่งเร่งด่วน',
      nonUrgent: 'ไม่เร่งด่วน',
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
      downloadRecord: 'ดาวน์โหลดบันทึก',
      downloadTxt: 'ดาวน์โหลด .txt',
      downloadPdf: 'ดาวน์โหลด PDF',
      downloadTxtStarted: 'ดาวน์โหลดบันทึก .txt แล้ว',
      downloadPdfStarted: 'ดาวน์โหลดบันทึก PDF แล้ว',
      downloadFailed: 'ไม่สามารถดาวน์โหลดบันทึกเคสได้',
      reactivate: 'เปิดใช้งานอีกครั้ง',
      noResults: 'ไม่พบเคสในคลัง',
      showing: 'แสดง',
      records: 'รายการ',
      allTime: 'ทุกช่วงเวลา',
      last7Days: '7 วันที่ผ่านมา',
      last30Days: '30 วันที่ผ่านมา',
      last90Days: '90 วันที่ผ่านมา',
      last12Months: '12 เดือนที่ผ่านมา',
      discharge: 'จำหน่าย',
      referred: 'ส่งต่อ',
      dead: 'เสียชีวิต',
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
      lookupHint: 'ระบบจะค้นจากฐานข้อมูลจริงก่อน และ fallback เป็นตัวอย่างทดสอบเช่น {examples}',
      patientAutofillHint: 'ข้อมูลผู้ป่วยถูกเติมอัตโนมัติจากฐานข้อมูล กรุณาตรวจสอบความถูกต้องก่อนส่งคำขอ',
      patientManualEntryHint: 'CID: {cid} — กรุณากรอกข้อมูลผู้ป่วยด้วยตนเอง',
      reviewHighlightedFields: 'กรุณาตรวจสอบข้อมูลที่ไฮไลต์ก่อนส่งคำขอ',
      hospitalNumber: 'เลข HN',
      admissionNumber: 'เลข AN',
      patientFullName: 'ชื่อ-นามสกุล ผู้ป่วย',
      age: 'อายุ',
      gender: 'เพศ',
      selectGender: 'เลือกเพศ',
      male: 'ชาย',
      female: 'หญิง',
      other: 'อื่น ๆ',
      bloodType: 'กรุ๊ปเลือด',
      phoneLabel: 'โทรศัพท์',
      dob: 'วันเกิด',
      district: 'อำเภอ',
      province: 'จังหวัด',
      conditions: 'โรคประจำตัว',
      allergies: 'ประวัติแพ้',
      currentSymptomsLabel: 'อาการปัจจุบัน',
      currentSymptomsPlaceholder: 'รายละเอียดอาการปัจจุบันและประวัติการเจ็บป่วยเบื้องต้น...',
      initialDiagnosis: 'วินิจฉัยเบื้องต้น',
      clinicalNotes: 'บันทึกทางคลินิก',
      clinicalNotesPlaceholder: 'บันทึกทางคลินิกเพิ่มเติม...',
      selectHospital: 'เลือกโรงพยาบาล',
      uploadZoneTitle: 'คลิกหรือลากไฟล์มาวางที่นี่',
      uploadZoneHint: 'รองรับไฟล์ Imaging (DICOM), PDF และรายงานทางการแพทย์ (สูงสุด 50MB)',
      submitting: 'กำลังส่ง...',
      saving: 'กำลังบันทึก...',
      lookupFailed: 'ไม่สามารถค้นหาข้อมูลผู้ป่วยได้ในขณะนี้',
      immediate: '1. อันตรายถึงชีวิตทันที',
      lifeThreatening: 'อันตรายถึงชีวิต',
      highRisk: 'ความเสี่ยงสูง',
      serious: 'รุนแรง',
      stable: 'คงที่',
      routine: 'ตามปกติ',
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
      checkingSession: 'กำลังตรวจสอบเซสชัน...',
      lastUsedUnavailable: 'เวลาล่าสุดไม่พร้อมใช้งาน',
      todayAt: 'วันนี้ เวลา {time} น.',
      connected: 'เชื่อมต่อแล้ว',
      notConnected: 'ไม่ได้เชื่อมต่อ',
      providerIdOauth: 'Provider ID (OAuth)',
      activeSessions: 'เซสชันที่ใช้งานอยู่',
      activeSessionsHint: 'จัดการและออกจากระบบของอุปกรณ์อื่นที่ยังใช้งานอยู่',
      noProviderSession: 'ไม่พบเซสชัน Provider ID ในเบราว์เซอร์นี้',
      openExternalBrowser: 'เปิดในเบราว์เซอร์ภายนอก',
      openExternalBrowserHint: 'เปิด Antigravity ใน Chrome หรือ Safari เพื่อใช้งานแบบเว็บปกติ และต้องเข้าสู่ระบบใหม่',
      deactivateAccountHint: 'ปิดการใช้งานบัญชีชั่วคราว และเปิดใช้งานอีกครั้งได้ภายหลัง',
      accountDeactivated: 'ปิดใช้งานบัญชีเรียบร้อยแล้ว',
      connectedLastUsed: 'เชื่อมต่อแล้ว - ใช้ล่าสุด {time}',
      telegramPersonalChat: 'Telegram (แชตส่วนตัว)',
      telegramChatId: 'Telegram Chat ID',
      telegramChatIdHint: 'หากต้องการรับการแจ้งเตือนใน Telegram ส่วนตัว ให้เริ่มแชตกับบอตของเรา (@OneICUTestBot หรือบอตที่กำหนด) แล้วพิมพ์ /start ระบบจะตอบกลับ Chat ID ของคุณ จากนั้นให้นำมากรอกที่นี่',
      notificationNewRequest: 'มีคำขอปรึกษาใหม่',
      notificationNewRequestHint: 'แจ้งเมื่อมีการส่งคำขอปรึกษาใหม่',
      notificationStatusChange: 'สถานะคำขอเปลี่ยน',
      notificationStatusChangeHint: 'เมื่อคำขอของคุณได้รับการอนุมัติหรือปฏิเสธ',
      notificationNewMessage: 'มีข้อความใหม่จากผู้เชี่ยวชาญ',
      notificationNewMessageHint: 'ข้อความแชตและความคิดเห็นในเคส',
      notificationCaseUpdate: 'อัปเดตกิจกรรมของเคส',
      notificationCaseUpdateHint: 'อัปเดตสัญญาณชีพ แล็บ และบันทึกเคส',
      thisDevice: 'อุปกรณ์นี้',
      otherDevice: 'อุปกรณ์อื่น',
      onDevice: 'บน',
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
      backLabel: 'กลับ',
      requestsPage: 'คำขอ',
      archiveCasesPage: 'เคสที่เก็บถาวร',
      activeCasesPage: 'เคสที่กำลังดำเนินการ',
      pendingRequest: 'คำขอรอดำเนินการ',
      declinedStatus: 'ปฏิเสธแล้ว',
      closedStatus: 'ปิดเคส ({outcome})',
      clinicalWorkspace: 'พื้นที่ทำงานทางคลินิก',
      clinicalWorkspaceHint: 'รวมบริบทผู้ป่วย ผลตรวจ การรักษา และลำดับเวลาการปรึกษาไว้ในมุมมองเดียว',
      filesLabel: 'ไฟล์',
      notesLabel: 'โน้ต',
      labsLabel: 'แล็บ',
      aiSummaryCase: 'สรุปเคสด้วย AI',
      patientCaseSummary: 'สรุปเคสของ {name}',
      generatedFromCurrentPage: 'สร้างเมื่อ {time} จากข้อมูลผู้ป่วยที่โหลดอยู่ในหน้านี้',
      closeAiSummary: 'ปิดหน้าสรุป AI',
      copied: 'คัดลอกแล้ว',
      copySummary: 'คัดลอกสรุป',
      attach: 'แนบไฟล์',
      image: 'รูปภาพ',
      onlineCount: 'ออนไลน์ {count} คน',
      typeMessage: 'พิมพ์ข้อความ...',
      editorAdd: 'เพิ่ม',
      editorEdit: 'แก้ไข',
      closeEditor: 'ปิดตัวแก้ไข',
      fixHighlightedFields: 'กรุณาแก้ไขช่องที่ถูกไฮไลต์ก่อนบันทึก',
      cancelLabel: 'ยกเลิก',
      saveLabel: 'บันทึก',
      savingLabel: 'กำลังบันทึก...',
      noteLabel: 'โน้ต',
      fileName: 'ชื่อไฟล์',
      category: 'หมวดหมู่',
      description: 'คำอธิบาย',
      patientNameRequired: 'ต้องระบุชื่อผู้ป่วย',
      hnRequired: 'ต้องระบุ HN',
      ageRangeError: 'อายุต้องอยู่ระหว่าง 0 ถึง 130 ปี',
      dobInvalid: 'วันเกิดไม่ถูกต้อง',
      bpFormat: 'ใช้รูปแบบ 120/80',
      gcsRequired: 'ต้องระบุ GCS',
      recordedTimeRequired: 'ต้องระบุเวลาที่บันทึก',
      hrRange: 'HR ต้องอยู่ระหว่าง 1 ถึง 300',
      tempRange: 'อุณหภูมิต้องอยู่ระหว่าง 25 ถึง 45',
      rrRange: 'RR ต้องอยู่ระหว่าง 1 ถึง 80',
      spo2Range: 'SpO2 ต้องอยู่ระหว่าง 0 ถึง 100',
      labNameRequired: 'ต้องระบุชื่อแล็บ',
      resultRequired: 'ต้องระบุผลตรวจ',
      statusRequired: 'ต้องระบุสถานะ',
      medicationNameRequired: 'ต้องระบุชื่อยา',
      doseRequired: 'ต้องระบุขนาดยา',
      frequencyRequired: 'ต้องระบุความถี่',
      routeRequired: 'ต้องระบุวิธีให้ยา',
      noteEmpty: 'โน้ตต้องไม่ว่าง',
      addOrderRequired: 'กรอกคำสั่งใช้ยา 1 วันหรือคำสั่งต่อเนื่องอย่างน้อยหนึ่งรายการ',
      fileNameRequired: 'ต้องระบุชื่อไฟล์',
      categoryRequired: 'ต้องระบุหมวดหมู่',
      previewFallback: 'ตัวอย่างไฟล์',
      closePreview: 'ปิดตัวอย่างไฟล์',
      dicomStudy: 'ไฟล์ DICOM',
      dicomPreviewHint: 'เปิดไฟล์นี้ด้วยโปรแกรมดู DICOM เพื่อตรวจภาพสแกน',
      csvDataFile: 'ไฟล์ข้อมูล CSV',
      csvPreviewHint: 'ดาวน์โหลดเพื่อตรวจข้อมูลในโปรแกรมสเปรดชีต',
      noPreviewAvailable: 'ไม่มีตัวอย่างให้แสดง',
      noPreviewHint: 'ไฟล์นี้ไม่มี URL สำหรับแสดงผลในเบราว์เซอร์',
      downloadLabel: 'ดาวน์โหลด',
      closeLabel: 'ปิด',
      interactiveVitalTrend: 'กราฟแนวโน้มสัญญาณชีพแบบโต้ตอบ',
      trendOverlayHint: 'กราฟเดียวสามารถแสดงการ์ดที่เลือกหลายใบพร้อมกันได้ คลิกการ์ดหรือปุ่มด้านล่างเพื่อเพิ่มหรือลบ series',
      selectedCards: 'การ์ดที่เลือก',
      seriesShown: 'จำนวนเส้นที่แสดง',
      lastUpdate: 'อัปเดตล่าสุด',
      normalized: 'เทียบสัดส่วน',
      multiAxis: 'หลายแกน',
      normalizedHint: 'โหมดเทียบสัดส่วนจะซ้อนสัญญาณชีพที่เลือกทั้งหมดบนสเกล 0-100% เดียวกัน เพื่อเปรียบเทียบรูปแบบการเปลี่ยนแปลงได้ง่าย',
      multiAxisHint: 'โหมดหลายแกนจะแยกแต่ละตัวชี้วัดไว้ใน lane ของตัวเอง เพื่อคงช่วงค่าจริงของแต่ละตัวชี้วัดบนเส้นเวลาเดียวกัน',
      closeTrendChart: 'ปิดกราฟแนวโน้ม',
      closeTooltip: 'ปิดทูลทิป',
      selectVitalHint: 'เลือกการ์ดสัญญาณชีพอย่างน้อยหนึ่งใบเพื่อแสดงกราฟ',
      noTrendData: 'ไม่มีข้อมูลแนวโน้ม',
      bloodPressure: 'ความดันโลหิต',
      target60to100: 'เป้าหมาย 60-100 bpm',
      target90to120: 'เป้าหมาย 90-120 mmHg',
      target60to80: 'เป้าหมาย 60-80 mmHg',
      target365to375: 'เป้าหมาย 36.5-37.5°C',
      target12to20: 'เป้าหมาย 12-20 ครั้ง/นาที',
      target95to100: 'เป้าหมาย 95-100%',
      target13to15: 'เป้าหมาย 13-15',
      low: 'ต่ำ',
      high: 'สูง',
      withinTarget: 'อยู่ในช่วงเป้าหมาย',
      closeConsultationCase: 'ปิดเคสปรึกษา',
      closeCaseHint: 'เลือกผลลัพธ์เพื่อสรุปปิดเคส การกระทำนี้ไม่สามารถย้อนกลับได้',
      confirmAndClose: 'ยืนยันและปิดเคส',
      patientDetailUpdated: 'อัปเดตรายละเอียดผู้ป่วยแล้ว',
      saveFailed: 'บันทึกไม่สำเร็จ',
      deleteVitalConfirm: 'ลบข้อมูลสัญญาณชีพนี้หรือไม่?',
      deleteLabConfirm: 'ลบผลแล็บนี้หรือไม่?',
      deleteMedicationConfirm: 'ลบรายการยานี้หรือไม่?',
      deleteNoteConfirm: 'ลบโน้ตการปรึกษานี้หรือไม่?',
      deleteOrderConfirm: 'ลบสรุปคำสั่งนี้หรือไม่?',
      deleteFileConfirm: 'ลบไฟล์นี้หรือไม่? ไฟล์ที่อัปโหลดจะถูกลบด้วย',
      deleteItemConfirm: 'ลบรายการนี้หรือไม่?',
      vitalDeleted: 'ลบข้อมูลสัญญาณชีพแล้ว',
      labDeleted: 'ลบผลแล็บแล้ว',
      medicationDeleted: 'ลบรายการยาแล้ว',
      noteDeleted: 'ลบโน้ตการปรึกษาแล้ว',
      orderDeleted: 'ลบสรุปคำสั่งแล้ว',
      fileDeleted: 'ลบไฟล์แล้ว',
      itemDeleted: 'ลบรายการแล้ว',
      deleteVitalFailed: 'ลบข้อมูลสัญญาณชีพไม่สำเร็จ',
      deleteLabFailed: 'ลบผลแล็บไม่สำเร็จ',
      deleteMedicationFailed: 'ลบรายการยาไม่สำเร็จ',
      deleteNoteFailed: 'ลบโน้ตการปรึกษาไม่สำเร็จ',
      deleteOrderFailed: 'ลบสรุปคำสั่งไม่สำเร็จ',
      deleteFileFailed: 'ลบไฟล์ไม่สำเร็จ',
      deleteFailed: 'ลบไม่สำเร็จ',
      caseClosed: 'ปิดเคสแล้ว - {outcome}',
      approvedCase: 'อนุมัติ {name}',
      declinedCase: 'ปฏิเสธ {name}',
      noCaseSelectedTitle: 'ยังไม่ได้เลือกเคส',
      noCaseSelectedHint: 'กรุณาเปิดเคสจากหน้าเคสที่กำลังดำเนินการหรือหน้าคำขอ เพื่อให้พื้นที่ทำงานผู้ป่วยโหลดบริบททางคลินิกที่ถูกต้อง',
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
      yearsOld: 'ปี',
      defaultReason: 'ปวดท้องน้อยด้านขวาอย่างต่อเนื่อง มีไข้ต่ำ 100.4°F และคลื่นไส้มา 24 ชั่วโมง',
      defaultPatientName: 'Sarah Jenkins',
      female: 'หญิง',
      male: 'ชาย',
      reviewing: 'กำลังทบทวน',
      replied: 'ตอบกลับแล้ว',
      invited: 'เชิญแล้ว',
      lead: 'หัวหน้าทีม',
      consultant: 'ที่ปรึกษา',
      preExistingConditionsValue: 'เบาหวานชนิดที่ 2, ความดันโลหิตสูงเล็กน้อย',
      allergiesValue: 'แพ้เพนิซิลลิน, แพ้ลาเท็กซ์',
      suspectedDiagnosis: 'สงสัยไส้ติ่งอักเสบเฉียบพลัน',
      testLabel: 'การตรวจ',
      resultLabel: 'ผล',
      refLabel: 'ค่าอ้างอิง',
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
      phitsanulok: 'พิษณุโลก',
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
