import { date, double, int, mysqlTable, time, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const vitals = mysqlTable('case_vital', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  recordDate: date('record_date', { mode: 'string' }),
  recordTime: time('record_time'),
  bp: varchar('bp', { length: 32 }),
  hr: int('hr'),
  temp: double('temp'),
  rr: int('rr'),
  spo2: int('spo2'),
  gcs: varchar('gcs', { length: 32 }),
});

export type VitalSign = InferSelectModel<typeof vitals>;
export type NewVitalSign = InferInsertModel<typeof vitals>;
