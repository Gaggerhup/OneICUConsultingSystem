import { boolean, int, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const users = mysqlTable('provider', {
  id: int('id').autoincrement().primaryKey(),
  providerCode: varchar('provider_code', { length: 191 }).notNull(),
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
  status: varchar('status', { length: 255 }).notNull().default('online'),
  notifPrefs: text('notif_prefs'),
  telegramChatId: varchar('telegram_chat_id', { length: 64 }),
});

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;
