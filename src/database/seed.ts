import { db } from './index';
import { patients } from './schemas/patients';
import { users } from './schemas/users';
import { cases } from './schemas/cases';
import { notifications } from './schemas/notifications';
import { activities } from './schemas/activities';
import { vitals } from './schemas/vitals';
import { labs, medications } from './schemas/clinical_data';
import { notes, team, messages } from './schemas/collaboration';
import { caseFiles } from './schemas/case_files';

async function wipeSeedData() {
  // Delete children first to satisfy foreign-key constraints.
  await db.delete(caseFiles);
  await db.delete(messages);
  await db.delete(notes);
  await db.delete(team);
  await db.delete(vitals);
  await db.delete(labs);
  await db.delete(medications);
  await db.delete(cases);
  await db.delete(notifications);
  await db.delete(activities);
  await db.delete(patients);
  await db.delete(users);
}

async function upsertRows(table: any, rows: any[]) {
  if (!rows.length) {
    return;
  }
  await db.insert(table).values(rows);
}

async function main() {
  console.log('🌱 Seeding database...');

  await wipeSeedData();

  const specialistRows = [
    {
      id: 's1',
      title: 'Dr.',
      firstName: 'Sarah',
      lastName: 'Jenkins',
      specialty: 'Cardiology',
      hospital: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
      email: 'sarah.jenkins@phitsanulok-med.local',
      avatarUrl: 'https://ui-avatars.com/api/?name=Sarah+Jenkins&background=14b8a6&color=fff',
      phoneNumber: '+66800000001',
      license: 'MD-TH-1001',
      isAcceptingCases: true,
      isAcceptingNotifications: true,
      status: 'online' as const,
    },
    {
      id: 's2',
      title: 'Dr.',
      firstName: 'Michael',
      lastName: 'Chen',
      specialty: 'Diagnostic Radiology',
      hospital: 'โรงพยาบาลวัดโบสถ์',
      email: 'michael.chen@phitsanulok-med.local',
      avatarUrl: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0ea5e9&color=fff',
      phoneNumber: '+66800000002',
      license: 'MD-TH-1002',
      isAcceptingCases: true,
      isAcceptingNotifications: true,
      status: 'online' as const,
    },
    {
      id: 's3',
      title: 'Dr.',
      firstName: 'Elena',
      lastName: 'Rodriguez',
      specialty: 'Pulmonary Medicine and Critical Care',
      hospital: 'โรงพยาบาลบางระกำ',
      email: 'elena.rodriguez@phitsanulok-med.local',
      avatarUrl: 'https://ui-avatars.com/api/?name=Elena+Rodriguez&background=8b5cf6&color=fff',
      phoneNumber: '+66800000003',
      license: 'MD-TH-1003',
      isAcceptingCases: true,
      isAcceptingNotifications: true,
      status: 'away' as const,
    },
    {
      id: 's4',
      title: 'Dr.',
      firstName: 'Thanapon',
      lastName: 'Kittisak',
      specialty: 'General Surgery',
      hospital: 'โรงพยาบาลพรหมพิราม',
      email: 'thanapon.kittisak@phitsanulok-med.local',
      avatarUrl: 'https://ui-avatars.com/api/?name=Thanapon+Kittisak&background=f97316&color=fff',
      phoneNumber: '+66800000004',
      license: 'MD-TH-1004',
      isAcceptingCases: false,
      isAcceptingNotifications: true,
      status: 'online' as const,
    },
  ];

  const patientRows = [
    {
      id: 'p1',
      cid: '1101700200011',
      passportNo: null,
      hn: 'HN-100001',
      patientName: 'สมชาย ใจดี',
      firstName: 'สมชาย',
      lastName: 'ใจดี',
      gender: 'male' as const,
      birthDate: '1974-07-15',
      age: 52,
      phoneNumber: '0812345001',
      district: 'mueang_phitsanulok',
      province: 'phitsanulok',
      bloodType: 'O+' as const,
      allergies: ['Penicillin'],
      conditions: ['Hypertension'],
    },
    {
      id: 'p2',
      cid: '1101700200029',
      passportNo: null,
      hn: 'HN-100045',
      patientName: 'มาลี จันทร์เพ็ญ',
      firstName: 'มาลี',
      lastName: 'จันทร์เพ็ญ',
      gender: 'female' as const,
      birthDate: '1969-11-03',
      age: 56,
      phoneNumber: '0812345002',
      district: 'bang_krathum',
      province: 'phitsanulok',
      bloodType: 'B-' as const,
      allergies: ['NSAIDs'],
      conditions: ['Asthma'],
    },
    {
      id: 'p3',
      cid: '1101700200036',
      passportNo: null,
      hn: 'HN-200312',
      patientName: 'นิรันดร์ สุขใจ',
      firstName: 'นิรันดร์',
      lastName: 'สุขใจ',
      gender: 'male' as const,
      birthDate: '1958-02-20',
      age: 68,
      phoneNumber: '0812345003',
      district: 'wang_thong',
      province: 'phitsanulok',
      bloodType: 'A+' as const,
      allergies: ['None'],
      conditions: ['Atrial Fibrillation', 'Stroke risk'],
    },
    {
      id: 'p4',
      cid: '1101700200044',
      passportNo: null,
      hn: 'HN-300087',
      patientName: 'สุดารัตน์ ขมิ้น',
      firstName: 'สุดารัตน์',
      lastName: 'ขมิ้น',
      gender: 'female' as const,
      birthDate: '1988-08-28',
      age: 37,
      phoneNumber: '0812345004',
      district: 'phrom_phiram',
      province: 'phitsanulok',
      bloodType: 'AB+' as const,
      allergies: ['Latex'],
      conditions: ['Post-operative observation'],
    },
    {
      id: 'p5',
      cid: '1101700200051',
      passportNo: null,
      hn: 'HN-400001',
      patientName: 'พิเชษฐ์ วงศ์ชัย',
      firstName: 'พิเชษฐ์',
      lastName: 'วงศ์ชัย',
      gender: 'male' as const,
      birthDate: '1961-12-09',
      age: 64,
      phoneNumber: '0812345005',
      district: 'nakhon_thai',
      province: 'phitsanulok',
      bloodType: 'A-' as const,
      allergies: ['Seafood'],
      conditions: ['Type 2 Diabetes'],
    },
  ];

  const caseRows = [
    {
      id: '101',
      patientName: 'สมชาย ใจดี',
      hospital: 'โรงพยาบาลวังทอง',
      status: 'Active' as const,
      priority: 'URGENT' as const,
      specialty: 'General Surgery',
      age: 52,
      gender: 'Male',
      reason: 'Abdominal pain with suspected appendicitis',
      date: 'Apr 1, 2026',
      hn: 'HN-100001',
      an: 'AN-2026-001',
      cid: '1101700200011',
      bloodType: 'O+',
      conditions: ['Hypertension'],
      allergies: ['Penicillin'],
      currentSymptoms: 'Lower right abdominal pain, nausea, low-grade fever for 24 hours.',
      initialDiagnosis: 'Acute appendicitis (suspected)',
      clinicalNotes: 'RLQ tenderness present. CT abdomen requested for surgical review.',
      senderId: 's1',
      lastAction: 'CT review pending',
      lastActiveTime: '10m ago',
    },
    {
      id: '102',
      patientName: 'มาลี จันทร์เพ็ญ',
      hospital: 'โรงพยาบาลวัดโบสถ์',
      status: 'Critical' as const,
      priority: 'IMMEDIATE' as const,
      specialty: 'Pulmonary Medicine and Critical Care',
      age: 56,
      gender: 'Female',
      reason: 'Severe asthma exacerbation with hypoxia',
      date: 'Apr 1, 2026',
      hn: 'HN-100045',
      an: 'AN-2026-002',
      cid: '1101700200029',
      bloodType: 'B-',
      conditions: ['Asthma'],
      allergies: ['NSAIDs'],
      currentSymptoms: 'Dyspnea, wheezing, chest tightness, SpO2 92% on room air.',
      initialDiagnosis: 'Acute exacerbation of asthma',
      clinicalNotes: 'Requires bronchodilator support and close respiratory monitoring.',
      senderId: 's3',
      lastAction: 'Respiratory support escalated',
      lastActiveTime: '5m ago',
    },
    {
      id: '103',
      patientName: 'นิรันดร์ สุขใจ',
      hospital: 'โรงพยาบาลบางกระทุ่ม',
      status: 'Pending' as const,
      priority: 'SEMI-URGENT' as const,
      specialty: 'Neurology',
      age: 68,
      gender: 'Male',
      reason: 'Acute ischemic stroke evaluation',
      date: 'Apr 1, 2026',
      hn: 'HN-200312',
      an: 'AN-2026-003',
      cid: '1101700200036',
      bloodType: 'A+',
      conditions: ['Atrial fibrillation'],
      allergies: ['None'],
      currentSymptoms: 'Left-sided weakness, slurred speech, onset 2 hours ago.',
      initialDiagnosis: 'Suspected ischemic stroke',
      clinicalNotes: 'Stroke window assessment in progress. Awaiting acceptance.',
      senderId: 's2',
      lastAction: 'Awaiting specialist acceptance',
      lastActiveTime: '25m ago',
    },
    {
      id: '104',
      patientName: 'สุดารัตน์ ขมิ้น',
      hospital: 'โรงพยาบาลพุทธชินราช พิษณุโลก',
      status: 'Discharge' as const,
      priority: 'NON-URGENT' as const,
      specialty: 'Internal Medicine',
      age: 37,
      gender: 'Female',
      reason: 'Community-acquired pneumonia, improving',
      date: 'Mar 29, 2026',
      closeDate: 'Mar 30, 2026',
      closedTimestamp: new Date('2026-03-30T15:00:00+07:00'),
      hn: 'HN-300087',
      an: 'AN-2026-004',
      cid: '1101700200044',
      bloodType: 'AB+',
      conditions: ['Post-operative observation'],
      allergies: ['Latex'],
      currentSymptoms: 'Improving cough and fever after antibiotics.',
      initialDiagnosis: 'Pneumonia, resolving',
      clinicalNotes: 'Discharged with oral antibiotics and follow-up plan.',
      senderId: 's1',
      lastAction: 'Discharged with follow-up',
      lastActiveTime: '1d ago',
    },
    {
      id: '105',
      patientName: 'พิเชษฐ์ วงศ์ชัย',
      hospital: 'โรงพยาบาลพรหมพิราม',
      status: 'Active' as const,
      priority: 'EMERGENCY' as const,
      specialty: 'Cardiology',
      age: 64,
      gender: 'Male',
      reason: 'Chest pain with hypotension',
      date: 'Apr 1, 2026',
      hn: 'HN-400001',
      an: 'AN-2026-005',
      cid: '1101700200051',
      bloodType: 'A-',
      conditions: ['Type 2 Diabetes'],
      allergies: ['Seafood'],
      currentSymptoms: 'Cold sweat, crushing chest pain, SBP 92 mmHg.',
      initialDiagnosis: 'Acute coronary syndrome',
      clinicalNotes: 'ECG and cardiac enzymes sent. Needs urgent cardiology review.',
      senderId: 's4',
      lastAction: 'Cardiology review requested',
      lastActiveTime: '2m ago',
    },
  ];

  const vitalRows = [
    { id: 'v1', caseId: '101', bp: '134/78', hr: 96, temp: 37.8, rr: 22, spo2: 95, gcs: '15/15', recordedAt: '08:40' },
    { id: 'v2', caseId: '102', bp: '118/72', hr: 118, temp: 36.9, rr: 24, spo2: 92, gcs: '15/15', recordedAt: '09:05' },
    { id: 'v3', caseId: '103', bp: '142/86', hr: 104, temp: 37.1, rr: 20, spo2: 97, gcs: '14/15', recordedAt: '09:25' },
    { id: 'v4', caseId: '104', bp: '126/80', hr: 90, temp: 37.0, rr: 18, spo2: 98, gcs: '15/15', recordedAt: '09:50' },
    { id: 'v5', caseId: '105', bp: '92/60', hr: 112, temp: 36.8, rr: 22, spo2: 94, gcs: '15/15', recordedAt: '10:10' },
  ];

  const labRows = [
    { id: 'l1', caseId: '101', name: 'WBC', result: '15.2', unit: 'x10³/µL', refRange: '4.5-11.0', status: 'critical' as const },
    { id: 'l2', caseId: '101', name: 'CRP', result: '82.4', unit: 'mg/L', refRange: '< 10', status: 'critical' as const },
    { id: 'l3', caseId: '102', name: 'pCO2', result: '48', unit: 'mmHg', refRange: '35-45', status: 'high' as const },
    { id: 'l4', caseId: '103', name: 'Glucose', result: '142', unit: 'mg/dL', refRange: '70-110', status: 'high' as const },
    { id: 'l5', caseId: '104', name: 'Hgb', result: '13.8', unit: 'g/dL', refRange: '12.0-16.0', status: 'normal' as const },
    { id: 'l6', caseId: '105', name: 'Troponin I', result: '0.82', unit: 'ng/mL', refRange: '< 0.04', status: 'critical' as const },
  ];

  const medicationRows = [
    { id: 'm1', caseId: '101', name: 'Ceftriaxone IV', dose: '2 g', freq: 'Every 24h', route: 'IV Push', start: 'Today', category: 'Antibiotic' },
    { id: 'm2', caseId: '102', name: 'Salbutamol', dose: '2.5 mg/3 mL', freq: 'PRN Q20min', route: 'Nebulisation', start: 'Today', category: 'Bronchodilator' },
    { id: 'm3', caseId: '103', name: 'Aspirin', dose: '300 mg', freq: 'Once', route: 'PO', start: 'Today', category: 'Antiplatelet' },
    { id: 'm4', caseId: '104', name: 'Amoxicillin-Clavulanate', dose: '625 mg', freq: 'TID', route: 'PO', start: 'Today', category: 'Antibiotic' },
    { id: 'm5', caseId: '105', name: 'Nitroglycerin', dose: '5 mcg/min', freq: 'Titrate', route: 'IV', start: 'Today', category: 'Cardiac' },
  ];

  const noteRows = [
    { id: 'n1', caseId: '101', authorId: 's1', authorName: 'Dr. Sarah Jenkins', authorRole: 'General Surgeon', authorColor: '14b8a6', body: 'Recommended immediate laparoscopic appendectomy. Patient currently NPO.', time: '2h ago' },
    { id: 'n2', caseId: '102', authorId: 's3', authorName: 'Dr. Elena Rodriguez', authorRole: 'Pulmonary Medicine and Critical Care', authorColor: '8b5cf6', body: 'Escalated bronchodilator support and reassess SpO2 after nebulization.', time: '1h ago' },
    { id: 'n3', caseId: '103', authorId: 's2', authorName: 'Dr. Michael Chen', authorRole: 'Diagnostic Radiology', authorColor: '0ea5e9', body: 'CT brain request sent. Please confirm stroke onset time and anticoagulant use.', time: '45m ago' },
    { id: 'n4', caseId: '104', authorId: 's1', authorName: 'Dr. Sarah Jenkins', authorRole: 'Cardiology', authorColor: '14b8a6', body: 'Patient completed treatment and was discharged with oral antibiotics.', time: '1d ago' },
    { id: 'n5', caseId: '105', authorId: 's4', authorName: 'Dr. Thanapon Kittisak', authorRole: 'General Surgery', authorColor: 'f97316', body: 'Needs urgent ECG repeat and cath lab consideration if troponin rises.', time: '20m ago' },
  ];

  const messageRows = [
    { id: 'msg1', caseId: '101', senderId: 's1', senderName: 'Dr. Sarah Jenkins', text: 'Has the patient been prepped for surgery?', time: '14:15', isSelf: false, isSystem: false },
    { id: 'msg2', caseId: '101', senderId: null, senderName: '', text: '🔔 Lab WBC result updated — 15.2 x10³/µL (CRITICAL)', time: '14:30', isSelf: false, isSystem: true },
    { id: 'msg3', caseId: '101', senderId: 's4', senderName: 'Dr. Thanapon Kittisak', text: 'Yes, proceed to OR once anesthesia clears.', time: '14:35', isSelf: false, isSystem: false },
    { id: 'msg4', caseId: '102', senderId: 's3', senderName: 'Dr. Elena Rodriguez', text: 'Please continue nebulization and monitor oxygen saturation every 15 minutes.', time: '11:05', isSelf: false, isSystem: false },
    { id: 'msg5', caseId: '103', senderId: 's2', senderName: 'Dr. Michael Chen', text: 'CT brain is ready. Please confirm tPA eligibility before escalation.', time: '09:55', isSelf: false, isSystem: false },
    { id: 'msg6', caseId: '105', senderId: 's1', senderName: 'Dr. Sarah Jenkins', text: 'Urgent cardiology consult requested. ECG and troponin now.', time: '10:20', isSelf: false, isSystem: false },
  ];

  const teamRows = [
    { id: 't1', caseId: '101', userId: 's1', role: 'General Surgeon' as const },
    { id: 't2', caseId: '101', userId: 's2', role: 'Radiologist' as const },
    { id: 't3', caseId: '102', userId: 's3', role: 'Pulmonologist' as const },
    { id: 't4', caseId: '103', userId: 's2', role: 'Consultant' as const },
    { id: 't5', caseId: '104', userId: 's1', role: 'Consultant' as const },
    { id: 't6', caseId: '105', userId: 's4', role: 'Consultant' as const },
  ];

  const fileRows = [
    { id: 'f1', caseId: '101', uploadedById: 's2', fileName: 'CT_Abdomen_Appendix_2026-04-01.dcm', fileType: 'dicom' as const, category: 'imaging' as const, mimeType: 'application/dicom', fileUrl: '/mock-files/ct-abdomen.dcm', sizeKb: 8420, description: 'CT abdomen with suspected appendicitis', isPreviewable: false },
    { id: 'f2', caseId: '101', uploadedById: 's1', fileName: 'WBC_Lab_Report.pdf', fileType: 'document' as const, category: 'lab' as const, mimeType: 'application/pdf', fileUrl: '/mock-files/wbc-lab.pdf', sizeKb: 512, description: 'CBC and inflammatory markers', isPreviewable: true },
    { id: 'f3', caseId: '102', uploadedById: 's3', fileName: 'Chest_Xray_Review.png', fileType: 'image' as const, category: 'imaging' as const, mimeType: 'image/png', fileUrl: '/mock-files/chest-xray.png', sizeKb: 1240, description: 'Chest x-ray showing hyperinflation', isPreviewable: true },
    { id: 'f4', caseId: '103', uploadedById: 's2', fileName: 'Stroke_Protocol.pdf', fileType: 'document' as const, category: 'report' as const, mimeType: 'application/pdf', fileUrl: '/mock-files/stroke-protocol.pdf', sizeKb: 688, description: 'Stroke evaluation and transfer protocol', isPreviewable: true },
    { id: 'f5', caseId: '105', uploadedById: 's4', fileName: 'ECG_Trace_01.png', fileType: 'image' as const, category: 'imaging' as const, mimeType: 'image/png', fileUrl: '/mock-files/ecg.png', sizeKb: 980, description: 'Initial ECG trace for ACS review', isPreviewable: true },
    { id: 'f6', caseId: '104', uploadedById: 's1', fileName: 'Medication_Mar_List.csv', fileType: 'csv' as const, category: 'medication' as const, mimeType: 'text/csv', fileUrl: '/mock-files/medication-list.csv', sizeKb: 84, description: 'Medication reconciliation and schedule', isPreviewable: true },
    { id: 'f7', caseId: '102', uploadedById: 's3', fileName: 'Respiratory_Consult_Note.txt', fileType: 'document' as const, category: 'note' as const, mimeType: 'text/plain', fileUrl: '/mock-files/respiratory-note.txt', sizeKb: 12, description: 'Consult summary from respiratory team', isPreviewable: true },
    { id: 'f8', caseId: '105', uploadedById: 's4', fileName: 'Consent_Form_Scanned.pdf', fileType: 'document' as const, category: 'other' as const, mimeType: 'application/pdf', fileUrl: '/mock-files/consent-form.pdf', sizeKb: 430, description: 'Signed consent scanned for cath lab review', isPreviewable: true },
    { id: 'f9', caseId: '103', uploadedById: 's2', fileName: 'ABG_Trend_2026-04-01.csv', fileType: 'csv' as const, category: 'lab' as const, mimeType: 'text/csv', fileUrl: '/mock-files/abg-trend.csv', sizeKb: 22, description: 'ABG trend log from monitoring device', isPreviewable: true },
    { id: 'f10', caseId: '104', uploadedById: 's1', fileName: 'Discharge_Summary_Final.pdf', fileType: 'document' as const, category: 'report' as const, mimeType: 'application/pdf', fileUrl: '/mock-files/discharge-summary.pdf', sizeKb: 742, description: 'Final discharge summary with follow-up plan', isPreviewable: true },
  ];

  const notificationRows = [
    { id: 'noti1', userId: 's1', title: 'New urgent consult', message: 'Case #105 needs cardiology review now.', time: '2m ago', read: false, type: 'request' as const },
    { id: 'noti2', userId: 's1', title: 'Lab updated', message: 'WBC for Case #101 increased to critical level.', time: '10m ago', read: false, type: 'alert' as const },
    { id: 'noti3', userId: 's1', title: 'Message received', message: 'Dr. Thanapon replied in Case #101 chat.', time: '14m ago', read: true, type: 'message' as const },
    { id: 'noti4', userId: 's1', title: 'Case discharged', message: 'Case #104 moved to archive.', time: '1d ago', read: true, type: 'alert' as const },
  ];

  const activityRows = [
    { id: 'a1', title: 'Urgent case escalated', desc: 'Case #105 moved to active cardiology review.', time: 'Just now', details: 'Chest pain with hypotension', icon: 'alert' as const, timestamp: 1743476400 },
    { id: 'a2', title: 'Lab result posted', desc: 'Case #101 WBC changed to critical.', time: '10m ago', details: 'WBC 15.2 x10³/µL', icon: 'update' as const, timestamp: 1743475800 },
    { id: 'a3', title: 'Consult accepted', desc: 'Case #102 accepted by respiratory team.', time: '25m ago', details: 'Nebulization started', icon: 'note' as const, timestamp: 1743474900 },
    { id: 'a4', title: 'Case discharged', desc: 'Case #104 was moved to archive.', time: '1d ago', details: 'Discharge summary completed', icon: 'system' as const, timestamp: 1743388800 },
    { id: 'a5', title: 'Imaging uploaded', desc: 'CT abdomen added for Case #101.', time: '2h ago', details: 'CT_Abdomen_Appendix_2026-04-01.dcm', icon: 'note' as const, timestamp: 1743469200 },
  ];

  await upsertRows(users, specialistRows);
  await upsertRows(patients, patientRows);
  await upsertRows(cases, caseRows);
  await upsertRows(vitals, vitalRows);
  await upsertRows(labs, labRows);
  await upsertRows(medications, medicationRows);
  await upsertRows(notes, noteRows);
  await upsertRows(messages, messageRows);
  await upsertRows(team, teamRows);
  await upsertRows(caseFiles, fileRows);
  await upsertRows(notifications, notificationRows);
  await upsertRows(activities, activityRows);

  console.log('✅ Seeding completed.');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
