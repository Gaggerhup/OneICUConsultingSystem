import { boolean, int, mysqlTable, varchar, text } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const notifications = mysqlTable('notification', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('user_id').notNull(),
  notifyDate: varchar('notify_date', { length: 10 }).notNull(),
  notifyTime: varchar('notify_time', { length: 8 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  type: varchar('type', { length: 32 }).notNull().default('alert'),
});

export type NotificationRow = InferSelectModel<typeof notifications>;
export type NewNotificationRow = InferInsertModel<typeof notifications>;
