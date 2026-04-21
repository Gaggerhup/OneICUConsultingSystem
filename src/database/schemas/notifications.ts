import { boolean, date, int, mysqlTable, text, time, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const notifications = mysqlTable('notification', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('provider_id').notNull(),
  notifyDate: date('notify_date', { mode: 'string' }),
  notifyTime: time('notify_time'),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('is_read').notNull().default(false),
  type: varchar('type', { length: 255 }).notNull().default('alert'),
});

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
