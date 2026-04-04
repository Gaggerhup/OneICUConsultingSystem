import { boolean, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const notifications = mysqlTable('notifications', {
  id: varchar('id', { length: 191 }).primaryKey(),
  userId: varchar('user_id', { length: 191 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  time: varchar('time_string', { length: 191 }),
  read: boolean('read').notNull().default(false),
  type: mysqlEnum('type', ['request', 'message', 'alert']).notNull().default('alert'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
