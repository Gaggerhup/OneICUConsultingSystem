import { date, int, mysqlTable, text, time, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const labs = mysqlTable('case_lab', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  labDate: date('lab_date', { mode: 'string' }),
  labTime: time('lab_time'),
  name: varchar('name', { length: 191 }).notNull(),
  result: varchar('result', { length: 191 }).notNull(),
  unit: varchar('unit', { length: 64 }).notNull(),
  refRange: varchar('ref_range', { length: 191 }),
  status: varchar('status', { length: 255 }).notNull().default('normal'),
  note: text('note'),
});

export const medications = mysqlTable('case_medication', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  startDate: date('start_date', { mode: 'string' }),
  startTime: time('start_time'),
  name: varchar('name', { length: 191 }).notNull(),
  dose: varchar('dose', { length: 191 }).notNull(),
  freq: varchar('freq', { length: 191 }).notNull(),
  route: varchar('route', { length: 191 }).notNull(),
  category: varchar('category', { length: 191 }),
  note: text('note'),
});

export type LabRow = InferSelectModel<typeof labs>;
export type NewLabRow = InferInsertModel<typeof labs>;
export type MedRow = InferSelectModel<typeof medications>;
export type NewMedRow = InferInsertModel<typeof medications>;
