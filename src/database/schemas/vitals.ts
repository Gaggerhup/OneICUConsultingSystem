import { double, int, mysqlTable, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const vitals = mysqlTable('case_vitals', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  bp: varchar('bp', { length: 32 }),
  hr: int('hr'),
  temp: double('temp'),
  rr: int('rr'),
  spo2: int('spo2'),
  gcs: varchar('gcs', { length: 32 }),
  recordedAt: varchar('recorded_at_string', { length: 191 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type VitalSign = InferSelectModel<typeof vitals>;
export type NewVitalSign = InferInsertModel<typeof vitals>;
