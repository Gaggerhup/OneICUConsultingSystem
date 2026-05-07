import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, date, datetime, int, mysqlTable, text, time, varchar } from 'drizzle-orm/mysql-core';

export const appPatients = mysqlTable('app_patient', {
  id: int('id').autoincrement().primaryKey(),
  hn: varchar('hn', { length: 64 }),
  cid: varchar('cid', { length: 32 }),
  firstName: varchar('first_name', { length: 191 }),
  lastName: varchar('last_name', { length: 191 }),
  gender: varchar('gender', { length: 32 }),
  birthDate: date('birth_date'),
  reportedAge: int('reported_age'),
  bloodType: varchar('blood_type', { length: 16 }),
  phoneNumber: varchar('phone_number', { length: 32 }),
  district: varchar('district', { length: 191 }),
  province: varchar('province', { length: 191 }),
});

export const appPatientConditions = mysqlTable('app_patient_condition', {
  id: int('id').autoincrement().primaryKey(),
  patientId: int('patient_id').notNull(),
  conditionName: varchar('condition_name', { length: 255 }).notNull(),
  itemOrder: int('item_order').notNull().default(1),
});

export const patientAllergies = mysqlTable('patient_allergy', {
  id: int('id').autoincrement().primaryKey(),
  patientId: int('patient_id').notNull(),
  allergyName: varchar('allergy_name', { length: 255 }).notNull(),
  itemOrder: int('item_order').notNull().default(1),
});

export const caseRegisters = mysqlTable('case_register', {
  id: int('id').autoincrement().primaryKey(),
  patientId: int('patient_id').notNull(),
  an: varchar('an', { length: 64 }),
  hospital: varchar('hospital', { length: 255 }),
  recordDate: date('record_date').notNull(),
  recordTime: time('record_time'),
  status: varchar('status', { length: 32 }).notNull(),
  priority: varchar('priority', { length: 32 }).notNull(),
  specialty: varchar('specialty', { length: 191 }),
  reason: text('reason'),
  currentSymptoms: text('current_symptoms'),
  initialDiagnosis: text('initial_diagnosis'),
  clinicalNotes: text('clinical_notes'),
  senderId: varchar('sender_id', { length: 191 }),
  lastAction: varchar('last_action', { length: 191 }),
  lastActiveTime: varchar('last_active_time', { length: 64 }),
});

export const caseWorkflowEpisodes = mysqlTable('case_workflow_episode', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  patientId: int('patient_id'),
  episodeType: varchar('episode_type', { length: 32 }).notNull(),
  status: varchar('status', { length: 32 }).notNull(),
  action: varchar('action', { length: 191 }).notNull(),
  actorId: varchar('actor_id', { length: 191 }),
  note: text('note'),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
});

export const caseVitals = mysqlTable('case_vital', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  recordDate: date('record_date').notNull(),
  recordTime: time('record_time'),
  bp: varchar('bp', { length: 32 }),
  hr: varchar('hr', { length: 32 }),
  temp: varchar('temp', { length: 32 }),
  rr: varchar('rr', { length: 32 }),
  spo2: varchar('spo2', { length: 32 }),
  gcs: varchar('gcs', { length: 32 }),
});

export const caseLabs = mysqlTable('case_lab', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  labDate: date('lab_date').notNull(),
  labTime: time('lab_time'),
  name: varchar('name', { length: 191 }).notNull(),
  result: varchar('result', { length: 191 }),
  unit: varchar('unit', { length: 64 }),
  refRange: varchar('ref_range', { length: 191 }),
  status: varchar('status', { length: 64 }),
});

export const caseMedications = mysqlTable('case_medication', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  startDate: date('start_date').notNull(),
  startTime: time('start_time'),
  name: varchar('name', { length: 191 }).notNull(),
  dose: varchar('dose', { length: 191 }),
  freq: varchar('freq', { length: 191 }),
  route: varchar('route', { length: 64 }),
  category: varchar('category', { length: 64 }),
});

export const caseNotes = mysqlTable('case_note', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  recordDate: date('record_date').notNull(),
  recordTime: time('record_time'),
  providerIdDoNote: int('provider_id_do_note'),
  color: varchar('color', { length: 32 }),
  noteText: text('note_text').notNull(),
});

export const caseFiles = mysqlTable('case_file', {
  id: int('id').autoincrement().primaryKey(),
  caseRegisterId: int('case_register_id').notNull(),
  fileDate: date('file_date').notNull(),
  fileTime: time('file_time'),
  privderIdDoFile: varchar('privder_id_do_file', { length: 64 }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: varchar('file_type', { length: 64 }),
  category: varchar('category', { length: 64 }),
  mimeType: varchar('mime_type', { length: 191 }),
  fileUrl: text('file_url').notNull(),
  sizeKb: int('size_kb'),
  description: text('description'),
  isPreviewable: boolean('is_previewable').notNull().default(false),
});

export type AppPatient = InferSelectModel<typeof appPatients>;
export type NewAppPatient = InferInsertModel<typeof appPatients>;
export type AppPatientCondition = InferSelectModel<typeof appPatientConditions>;
export type NewAppPatientCondition = InferInsertModel<typeof appPatientConditions>;
export type PatientAllergy = InferSelectModel<typeof patientAllergies>;
export type NewPatientAllergy = InferInsertModel<typeof patientAllergies>;
export type CaseRegister = InferSelectModel<typeof caseRegisters>;
export type NewCaseRegister = InferInsertModel<typeof caseRegisters>;
export type CaseWorkflowEpisode = InferSelectModel<typeof caseWorkflowEpisodes>;
export type NewCaseWorkflowEpisode = InferInsertModel<typeof caseWorkflowEpisodes>;
export type CaseVital = InferSelectModel<typeof caseVitals>;
export type NewCaseVital = InferInsertModel<typeof caseVitals>;
export type CaseLab = InferSelectModel<typeof caseLabs>;
export type NewCaseLab = InferInsertModel<typeof caseLabs>;
export type CaseMedication = InferSelectModel<typeof caseMedications>;
export type NewCaseMedication = InferInsertModel<typeof caseMedications>;
export type CaseNote = InferSelectModel<typeof caseNotes>;
export type NewCaseNote = InferInsertModel<typeof caseNotes>;
export type CaseFile = InferSelectModel<typeof caseFiles>;
export type NewCaseFile = InferInsertModel<typeof caseFiles>;
