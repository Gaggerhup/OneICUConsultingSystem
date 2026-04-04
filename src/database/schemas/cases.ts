import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar, foreignKey } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { patients } from './patients';

export const cases = mysqlTable('cases', {
  id: varchar('id', { length: 191 }).primaryKey(),
  patientName: varchar('patient_name', { length: 191 }).notNull(),
  hospital: varchar('hospital', { length: 255 }).notNull(),
  status: mysqlEnum('status', ['Pending', 'Approved', 'Declined', 'Active', 'Critical', 'Archived', 'Discharge', 'Referred', 'Dead']).notNull().default('Pending'),
  priority: mysqlEnum('priority', ['IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI-URGENT', 'NON-URGENT']).notNull(),
  age: int('age'),
  gender: varchar('gender', { length: 32 }),
  specialty: varchar('specialty', { length: 191 }),
  reason: text('reason'),
  hn: varchar('hn', { length: 64 }),
  an: varchar('an', { length: 64 }),
  cid: varchar('cid', { length: 32 }),
  bloodType: varchar('blood_type', { length: 16 }),
  allergies: json('allergies').$type<string[] | null>(),
  conditions: json('conditions').$type<string[] | null>(),
  currentSymptoms: text('current_symptoms'),
  initialDiagnosis: text('initial_diagnosis'),
  clinicalNotes: text('clinical_notes'),
  senderId: varchar('sender_id', { length: 191 }),
  date: varchar('date_string', { length: 191 }),
  closeDate: varchar('close_date_string', { length: 191 }),
  closedTimestamp: timestamp('closed_timestamp'),
  lastAction: varchar('last_action', { length: 255 }),
  lastActiveTime: varchar('last_active_time', { length: 191 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  cidForeignKey: foreignKey({
    columns: [table.cid],
    foreignColumns: [patients.cid],
    name: 'fk_cases_cid',
  }),
}));

export type Case = InferSelectModel<typeof cases>;
export type NewCase = InferInsertModel<typeof cases>;
