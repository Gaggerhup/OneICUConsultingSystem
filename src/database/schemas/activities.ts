import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const activities = mysqlTable('activities', {
  id: varchar('id', { length: 191 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  desc: text('desc').notNull(),
  time: varchar('time_string', { length: 191 }),
  details: text('details'),
  icon: mysqlEnum('icon', ['alert', 'note', 'system', 'update']).notNull().default('system'),
  timestamp: int('timestamp_unix').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type ActivityItem = InferSelectModel<typeof activities>;
export type NewActivity = InferInsertModel<typeof activities>;
