import { boolean, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const notes = mysqlTable('case_notes', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  authorId: varchar('author_id', { length: 191 }).notNull(),
  authorName: varchar('author_name', { length: 191 }),
  authorRole: varchar('author_role', { length: 191 }),
  authorColor: varchar('author_color', { length: 32 }),
  body: text('body').notNull(),
  time: varchar('posted_time_string', { length: 191 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const messages = mysqlTable('case_messages', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  senderId: varchar('sender_id', { length: 191 }),
  senderName: varchar('sender_name', { length: 191 }),
  text: text('text').notNull(),
  time: varchar('timestamp_string', { length: 191 }),
  isSelf: boolean('is_self').notNull().default(false),
  isSystem: boolean('is_system').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export const team = mysqlTable('case_team', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  role: mysqlEnum('role', ['General Surgeon', 'Radiologist', 'Pulmonologist', 'Attending Physician', 'Consultant']).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type CaseNote = InferSelectModel<typeof notes>;
export type NewCaseNote = InferInsertModel<typeof notes>;
export type CaseMessage = InferSelectModel<typeof messages>;
export type NewCaseMessage = InferInsertModel<typeof messages>;
export type CaseTeamMember = InferSelectModel<typeof team>;
