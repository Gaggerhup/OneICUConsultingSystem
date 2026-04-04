import { mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const labs = mysqlTable('case_labs', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  result: varchar('result', { length: 191 }).notNull(),
  unit: varchar('unit', { length: 64 }).notNull(),
  refRange: varchar('ref_range', { length: 191 }),
  status: mysqlEnum('status', ['normal', 'high', 'low', 'critical']).notNull().default('normal'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const medications = mysqlTable('case_medications', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  name: varchar('name', { length: 191 }).notNull(),
  dose: varchar('dose', { length: 191 }).notNull(),
  freq: varchar('freq', { length: 191 }).notNull(),
  route: varchar('route', { length: 191 }).notNull(),
  start: varchar('start_date', { length: 191 }),
  category: varchar('category', { length: 191 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type LabRow = InferSelectModel<typeof labs>;
export type NewLabRow = InferInsertModel<typeof labs>;
export type MedRow = InferSelectModel<typeof medications>;
export type NewMedRow = InferInsertModel<typeof medications>;
