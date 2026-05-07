import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { boolean, datetime, mysqlTable, text, varchar } from 'drizzle-orm/mysql-core';

export const providerSessions = mysqlTable('provider_session', {
  id: varchar('id', { length: 64 }).primaryKey(),
  accountId: varchar('account_id', { length: 191 }).notNull(),
  device: varchar('device', { length: 191 }).notNull(),
  userAgent: text('user_agent'),
  platform: varchar('platform', { length: 191 }),
  ipAddress: varchar('ip_address', { length: 64 }),
  isMock: boolean('is_mock').notNull().default(false),
  createdAt: datetime('created_at', { mode: 'date', fsp: 3 }).notNull(),
  lastSeenAt: datetime('last_seen_at', { mode: 'date', fsp: 3 }).notNull(),
  expiresAt: datetime('expires_at', { mode: 'date', fsp: 3 }).notNull(),
  revokedAt: datetime('revoked_at', { mode: 'date', fsp: 3 }),
});

export type ProviderSession = InferSelectModel<typeof providerSessions>;
export type NewProviderSession = InferInsertModel<typeof providerSessions>;
