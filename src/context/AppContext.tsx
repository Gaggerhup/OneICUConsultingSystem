import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/auth';

export interface UserProfile {
  title: string;
  firstName: string;
  lastName: string;
  specialty: string;
  hospital: string;
  email: string;
  avatarUrl: string | null;
  phoneNumber: string;
  isAcceptingCases: boolean;
  license?: string;
  notifPrefs: {
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    weeklyReport: boolean;
    systemAlert: boolean;
  };
}

/** Read Provider ID session from localStorage for initial state */
const DEFAULT_PROFILE: UserProfile = {
  title: 'Dr.',
  firstName: '',
  lastName: '',
  specialty: '',
  hospital: '',
  email: '',
  avatarUrl: null,
  phoneNumber: '+66',
  isAcceptingCases: true,
  license: '',
  notifPrefs: {
    newRequest: true,
    requestApproved: true,
    newMessage: true,
    caseUpdate: false,
    weeklyReport: true,
    systemAlert: true,
  },
};

function getInitialProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const profile = authService.getUserProfile();
    return profile ? { ...DEFAULT_PROFILE, ...profile } : DEFAULT_PROFILE;
  } catch (err) {
    console.error('[AppContext] Failed to load initial profile', err);
    return DEFAULT_PROFILE;
  }
}


/**
 * App Context - Centralized State Management
 */

export interface Case {
  id: string;
  patientName: string;
  hospital: string;
  status: 'Pending' | 'Approved' | 'Declined' | 'Active' | 'Critical' | 'Archived';
  priority: 'IMMEDIATE' | 'EMERGENCY' | 'URGENT' | 'SEMI-URGENT' | 'NON-URGENT';
  date: string;
  specialty?: string;
  age?: number;
  gender?: string;
  reason?: string;
  type?: 'incoming' | 'sent';
  lastAction?: string;
  lastActiveTime?: string;
  senderId?: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'request' | 'message' | 'alert';
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface ActivityLogItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  details?: string;
  icon: 'alert' | 'note' | 'system' | 'update';
  timestamp: number;
}


export interface SpecialistMember extends UserProfile {
  id: string;
  status: 'online' | 'away' | 'dnd';
  availability: 'AVAILABLE' | 'IN SURGERY' | 'BUSY';
  role: 'Specialist' | 'Consultant';
  rating: number;
  consultations: number;
  nextAppt: string;
}

interface AppContextType {
  requests: Case[];
  activeCases: Case[];
  archiveCases: Case[];
  notifications: Notification[];
  selectedCase: Case | null;
  toast: Toast | null;
  userProfile: UserProfile;
  specialists: SpecialistMember[];
  activities: ActivityLogItem[];
  approveRequest: (id: string) => void;
  declineRequest: (id: string) => void;
  closeCase: (id: string) => void;
  addRequest: (data: Omit<Case, 'id' | 'status' | 'date'>) => string;
  selectCase: (id: string) => void;
  clearSelectedCase: () => void;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  refreshActivities: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<Case[]>([]);
  const [activeCases, setActiveCases] = useState<Case[]>([]);
  const [archiveCases, setArchiveCases] = useState<Case[]>([]);

  // Fetch cases from shared backend registry
  useEffect(() => {
    const fetchCases = async () => {
      try {
        const res = await fetch('http://localhost:3001/cases');
        const data: Case[] = await res.json();
        
        setRequests(data.filter(c => c.status === 'Pending' || c.status === 'Declined'));
        setActiveCases(data.filter(c => c.status === 'Active' || c.status === 'Critical'));
        setArchiveCases(data.filter(c => c.status === 'Archived'));
        
        // Update next ID based on existing cases
        const maxId = data.reduce((max, c) => Math.max(max, parseInt(c.id) || 0), 107);
        setNextCaseId(maxId + 1);
      } catch (err) {
        console.warn('[Fetch Cases Warning] Backend not running. Falling back to initial state.', err);
      }
    };
    fetchCases();
  }, []);

  const [nextCaseId, setNextCaseId] = useState(108);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 'n1', title: 'New Request', message: 'Urgent transfer request for Johnathan Doe', time: '2m ago', read: false, type: 'request' },
    { id: 'n2', title: 'Message from Specialist', message: 'Dr. Lee: "Vitals are stabilizing."', time: '1h ago', read: false, type: 'message' },
  ]);

  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);

  // Initialize userProfile directly from localStorage on first render
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Health ID Profile Synchronization
  // This effect ensures that the profile is correctly loaded on mount,
  // and re-synced if the storage changes in another tab.
  useEffect(() => {
    let lastProfileRaw = '';

    const syncProfile = () => {
      const raw = localStorage.getItem('user_profile') || localStorage.getItem('provider_session') || '';
      // Only update if the raw storage string has actually changed
      if (lastProfileRaw !== raw) {
        lastProfileRaw = raw;
        setUserProfile(getInitialProfile());
      }
    };

    // Initial sync
    syncProfile();

    // Listen for storage changes from other tabs
    window.addEventListener('storage', syncProfile);
    
    // We also set a short-lived interval to check for session changes
    // after redirect, because AppContext stays mounted and storage event
    // doesn't fire for the same window.
    const interval = setInterval(syncProfile, 2000);

    return () => {
      window.removeEventListener('storage', syncProfile);
      clearInterval(interval);
    };
  }, []);

  const [activities, setActivities] = useState<ActivityLogItem[]>([
    { 
      id: 'a1', 
      title: 'Emergency Alert', 
      desc: 'Patient HC-9920 vitals dropped. Immediate review requested by Dr. Alan.', 
      time: 'JUST NOW',
      icon: 'alert',
      timestamp: Date.now(),
      details: 'Patient: Sarah Jenkins (HC-9920). Vitals: SpO2 88%, BP 90/60. Dr. Alan requested immediate cardiology consultation due to suspected acute coronary syndrome.'
    },
    { 
      id: 'a2', 
      title: 'New Case Note', 
      desc: 'Nurse Sarah added lab results for Jane Smith (HC-8812).', 
      time: '12 MINS AGO',
      icon: 'note',
      timestamp: Date.now() - 12 * 60 * 1000,
      details: 'Comprehensive Metabolic Panel (CMP) results uploaded. Potassium levels slightly elevated (5.2 mEq/L). Notified attending physician.'
    },
    { 
      id: 'a3', 
      title: 'Specialist Online', 
      desc: 'Dr. Michael Chen (Neurology) is now online.', 
      time: '25 MINS AGO',
      icon: 'system',
      timestamp: Date.now() - 25 * 60 * 1000,
      details: 'System Login: Dr. Michael Chen authenticated via HealthID at 14:48. Location: Siriraj Hospital.'
    },
    { 
      id: 'a4', 
      title: 'Case Approved', 
      desc: 'Request for Patient HC-101 has been approved.', 
      time: '1 HOUR AGO',
      icon: 'update',
      timestamp: Date.now() - 60 * 60 * 1000,
      details: 'Consultation request for Johnathan Doe (HC-101) reviewed and approved by Medical Director. Assigned to Cardiology team.'
    },
    { 
      id: 'a5', 
      title: 'Lab Results Uploaded', 
      desc: 'Blood tests for #106 are ready.', 
      time: '4 DAYS AGO',
      icon: 'note',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000,
      details: 'Complete Blood Count (CBC) and Troponin levels uploaded for Michael Chen.'
    },
    { 
      id: 'a6', 
      title: 'Critical Alert Resolved', 
      desc: 'Emergency for #104 marked as resolved.', 
      time: '10 DAYS AGO',
      icon: 'update',
      timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
      details: 'Patient #104 stabilized and transferred to regular ward. Specialist review complete.'
    },
    { 
      id: 'a7', 
      title: 'System Maintenance', 
      desc: 'Monthly system backup completed successfully.', 
      time: '40 DAYS AGO',
      icon: 'system',
      timestamp: Date.now() - 40 * 24 * 60 * 60 * 1000,
      details: 'Automated monthly maintenance cycle. All databases backed up and verified.'
    },
  ]);

  const [specialists] = useState<SpecialistMember[]>([
    {
      id: 's1', title: 'Dr.', firstName: 'Sarah', lastName: 'Jenkins', specialty: 'Cardiology', hospital: 'City General Hospital', email: 'sarah@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=14b8a6&color=fff', isAcceptingCases: true, status: 'online', availability: 'AVAILABLE', role: 'Specialist', rating: 4.9,      consultations: 124, nextAppt: 'Today, 2:30 PM', phoneNumber: '+66800000001',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    },
    {
      id: 's2', title: 'Dr.', firstName: 'Michael', lastName: 'Chen', specialty: 'Neurology', hospital: "St. Mary's Medical Center", email: 'michael@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0ea5e9&color=fff', isAcceptingCases: true, status: 'away', availability: 'IN SURGERY', role: 'Consultant', rating: 5.0, consultations: 89, nextAppt: 'Tomorrow, 9:00 AM', phoneNumber: '+66800000002',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    },
    {
      id: 's3', title: 'Dr.', firstName: 'Elena', lastName: 'Rodriguez', specialty: 'Oncology', hospital: 'University Health Institute', email: 'elena@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=8b5cf6&color=fff', isAcceptingCases: true, status: 'online', availability: 'AVAILABLE', role: 'Consultant', rating: 4.8, consultations: 210, nextAppt: 'Today, 4:00 PM', phoneNumber: '+66800000003',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    },
    {
      id: 's4', title: 'Dr.', firstName: 'David', lastName: 'Kim', specialty: 'Pediatrics', hospital: 'City General Hospital', email: 'david@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=David+Kim&background=f43f5e&color=fff', isAcceptingCases: true, status: 'dnd', availability: 'BUSY', role: 'Specialist', rating: 4.7, consultations: 156, nextAppt: 'Tomorrow, 8:30 AM', phoneNumber: '+66800000004',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    },
    {
      id: 's5', title: 'Dr.', firstName: 'Maya', lastName: 'Patel', specialty: 'Radiology', hospital: 'North Regional Clinic', email: 'maya@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Maya+Patel&background=10b981&color=fff', isAcceptingCases: true, status: 'online', availability: 'AVAILABLE', role: 'Consultant', rating: 4.9, consultations: 340, nextAppt: 'Today, 3:15 PM', phoneNumber: '+66800000005',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    },
    {
      id: 's6', title: 'Dr.', firstName: 'Robert', lastName: 'Wilson', specialty: 'Cardiology', hospital: "St. Mary's Medical Center", email: 'robert@example.com', avatarUrl: 'https://ui-avatars.com/api/?name=Robert+Wilson&background=64748b&color=fff', isAcceptingCases: true, status: 'online', availability: 'AVAILABLE', role: 'Specialist', rating: 4.6, consultations: 95, nextAppt: 'Today, 5:00 PM', phoneNumber: '+66800000006',
      notifPrefs: { newRequest: true, requestApproved: true, newMessage: true, caseUpdate: true, weeklyReport: true, systemAlert: true }
    }
  ]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToast({ id, message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const addNotification = (title: string, message: string, type: 'request' | 'message' | 'alert') => {
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const approveRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    if (request) {
      setRequests(prev => prev.filter(r => r.id !== id));
      setActiveCases(prev => [...prev, { ...request, status: 'Active' }]);
      addNotification('Request Approved', `Case for ${request.patientName} is now active.`, 'alert');
      showToast(`✓ Request for ${request.patientName} approved`);
    }
  };

  const declineRequest = (id: string) => {
    const request = requests.find(r => r.id === id);
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Declined' } : r));
    if (request) showToast(`Request for ${request.patientName} declined`, 'error');
  };

  const closeCase = (id: string) => {
    const caseToClose = activeCases.find(c => c.id === id);
    if (caseToClose) {
      setActiveCases(prev => prev.filter(c => c.id !== id));
      setArchiveCases(prev => [...prev, { ...caseToClose, status: 'Archived' }]);
      addNotification('Case Closed', `Case for ${caseToClose.patientName} has been archived.`, 'alert');
      showToast(`✓ Case for ${caseToClose.patientName} moved to Archive`);
    }
  };

  const addRequest = (data: Omit<Case, 'id' | 'status' | 'date'>): string => {
    // @ts-ignore
    const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
    const telegramUser = tg?.initDataUnsafe?.user;
    const currentUserId = telegramUser ? `user_${telegramUser.id}` : 'guest_user';
    
    const id = nextCaseId.toString();
    const newCase: Case = {
      ...data,
      id,
      status: 'Pending',
      type: 'sent',
      senderId: currentUserId,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      lastAction: 'Request Submitted',
      lastActiveTime: 'Just now'
    };
    setRequests(prev => [newCase, ...prev]);
    setNextCaseId(prev => prev + 1);
    addNotification('New Request Submitted', `Consultation request for ${data.patientName} submitted.`, 'request');

    fetch('http://localhost:3001/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        caseId: id,
        patientName: data.patientName,
        hospital: data.hospital,
        priority: data.priority,
        specialty: data.specialty,
        age: data.age,
        gender: data.gender,
        reason: data.reason,
        type: 'newRequest',
        senderId: currentUserId
      })
    }).catch(err => console.warn('[Telegram Notification Warning]', err));

    return id;
  };

  const selectCase = (id: string) => {
    const found = activeCases.find(c => c.id === id) || requests.find(r => r.id === id);
    if (found) setSelectedCase(found);
  };

  const clearSelectedCase = () => setSelectedCase(null);

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUserProfile(prev => ({ ...prev, ...profile }));
  };

  // --- Telegram Web App Integration ---
  useEffect(() => {
    // @ts-ignore - Telegram is injected globally in index.html
    const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
      const telegramUser = tg.initDataUnsafe?.user;
      if (telegramUser) {
        console.log('[Telegram Auth] Secure Web App Payload received:', telegramUser);
        
        // Update local profile
        setUserProfile(prev => ({
          ...prev,
          firstName: telegramUser.first_name,
          lastName: telegramUser.last_name || '',
          specialty: 'Verified via Telegram',
        }));

        // Register Chat ID with Backend (Dynamic Targeting)
        // We use the first name as a rudimentary specialistId for now, or you can use telegramUser.id
        fetch('http://localhost:3001/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            specialistId: `user_${telegramUser.id}`,
            chatId: telegramUser.id.toString(),
            isAvailable: userProfile.isAcceptingCases,
            preferences: Object.keys(userProfile.notifPrefs).filter(k => userProfile.notifPrefs[k as keyof typeof userProfile.notifPrefs])
          })
        }).catch(err => console.warn('[Telegram Registration Warning]', err));
      }
    }
  }, []);

  // Sync Availability with Backend
  useEffect(() => {
    // @ts-ignore
    const tg = (typeof window !== 'undefined' ? window.Telegram : undefined)?.WebApp;
    const telegramUser = tg?.initDataUnsafe?.user;
    if (telegramUser) {
      fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          specialistId: `user_${telegramUser.id}`,
          chatId: telegramUser.id.toString(),
          isAvailable: userProfile.isAcceptingCases,
          preferences: Object.keys(userProfile.notifPrefs).filter(k => userProfile.notifPrefs[k as keyof typeof userProfile.notifPrefs])
        })
      }).catch(err => console.warn('[Telegram Sync Warning]', err));
    }
  }, [userProfile.isAcceptingCases, userProfile.notifPrefs]);
  // ------------------------------------

  return (
    <AppContext.Provider value={{
      requests,
      activeCases,
      archiveCases,
      notifications,
      selectedCase,
      toast,
      approveRequest,
      declineRequest,
      closeCase,
      addRequest,
      selectCase,
      clearSelectedCase,
      markNotificationAsRead,
      clearNotifications,
      showToast,
      userProfile,
      specialists,
      activities,
      updateUserProfile,
      refreshActivities: () => {
        setActivities(prev => {
          const shuffled = [...prev].sort(() => Math.random() - 0.5);
          if (shuffled.length > 0) {
            shuffled[0] = { ...shuffled[0], time: 'JUST NOW', timestamp: Date.now() };
          }
          return shuffled;
        });
      }
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
