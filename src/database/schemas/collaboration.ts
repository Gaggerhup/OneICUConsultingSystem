import { boolean, date, int, mysqlTable, text, time, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const notes = mysqlTable('case_note', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  recordDate: date('record_date', { mode: 'string' }),
  recordTime: time('record_time'),
  authorId: int('provider_id_do_note').notNull(),
  authorColor: varchar('color', { length: 32 }),
  body: text('note_text').notNull(),
});

export const messages = mysqlTable('case_message', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  recordDate: date('record_date', { mode: 'string' }),
  recordTime: time('record_time'),
  senderId: varchar('sender_id', { length: 191 }),
  senderName: varchar('sender_name', { length: 191 }),
  text: text('text').notNull(),
  isSelf: boolean('is_self').notNull().default(false),
  isSystem: boolean('is_system').notNull().default(false),
});

export const team = mysqlTable('case_team', {
  id: int('id').autoincrement().primaryKey(),
  caseId: int('case_register_id'),
  userId: int('provider_id').notNull(),
  role: varchar('role', { length: 255 }).notNull(),
  assignDate: date('assign_date', { mode: 'string' }),
  assignTime: time('assign_time'),
});

export type CaseNote = InferSelectModel<typeof notes>;
export type NewCaseNote = InferInsertModel<typeof notes>;
export type CaseMessage = InferSelectModel<typeof messages>;
export type NewCaseMessage = InferInsertModel<typeof messages>;
export type CaseTeamMember = InferSelectModel<typeof team>;
