import { boolean, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel, sql } from 'drizzle-orm';

export const users = mysqlTable('users', {
  id: varchar('id', { length: 191 }).primaryKey(),
  title: varchar('title', { length: 32 }).default('Dr.'),
  firstName: varchar('first_name', { length: 191 }).notNull(),
  lastName: varchar('last_name', { length: 191 }).notNull(),
  specialty: varchar('specialty', { length: 191 }),
  hospital: varchar('hospital', { length: 255 }),
  email: varchar('email', { length: 191 }),
  avatarUrl: text('avatar_url'),
  phoneNumber: varchar('phone_number', { length: 32 }),
  license: varchar('license', { length: 191 }),
  isAcceptingCases: boolean('is_accepting_cases').notNull().default(true),
  isAcceptingNotifications: boolean('is_accepting_notifications').notNull().default(true),
  status: mysqlEnum('status', ['online', 'away', 'dnd']).notNull().default('online'),
  notifPrefs: json('notif_prefs').$type<{
    newRequest: boolean;
    requestApproved: boolean;
    newMessage: boolean;
    caseUpdate: boolean;
    weeklyReport: boolean;
    systemAlert: boolean;
  }>().default(sql`(json_object('newRequest', true, 'requestApproved', true, 'newMessage', true, 'caseUpdate', false, 'weeklyReport', true, 'systemAlert', true))`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
