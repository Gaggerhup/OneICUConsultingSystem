import { cookies, headers } from 'next/headers';
import { execute, query } from '@/database';

export type StoredSession = {
  id: string;
  accountId: string;
  device: string;
  ipAddress: string | null;
  userAgent: string | null;
  platform: string | null;
  createdAt: string;
  lastSeenAt: string;
  expiresAt: string;
  revokedAt: string | null;
  isCurrent: boolean;
  isOnline: boolean;
  lastSeenSecondsAgo: number;
};

type RawStoredSession = Omit<StoredSession, 'accountId' | 'createdAt' | 'lastSeenAt' | 'expiresAt' | 'revokedAt' | 'isCurrent' | 'isOnline' | 'lastSeenSecondsAgo'> & {
  account_id: string;
  created_at: Date | string;
  last_seen_at: Date | string;
  expires_at: Date | string;
  revoked_at: Date | string | null;
};

const SESSION_COOKIE = 'auth_session';
const SESSION_TTL_DAYS = 7;
const ONLINE_WINDOW_SECONDS = 120;

let hasEnsuredSessionTable = false;

export function getProviderAccountId(profile: Record<string, any> | null | undefined) {
  const direct = String(
    profile?.account_id ||
    profile?.member_id ||
    profile?.user_id ||
    profile?.provider_id ||
    profile?.cid ||
    '',
  );
  if (direct) return direct;

  return firstDeepAccountId(profile);
}

function firstDeepAccountId(source: unknown, seen = new WeakSet<object>()): string {
  if (!source || typeof source !== 'object') return '';
  if (seen.has(source)) return '';
  seen.add(source);

  if (Array.isArray(source)) {
    for (const item of source) {
      const found = firstDeepAccountId(item, seen);
      if (found) return found;
    }
    return '';
  }

  const record = source as Record<string, unknown>;
  for (const key of ['account_id', 'member_id', 'user_id', 'provider_id', 'cid']) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  }

  for (const value of Object.values(record)) {
    const found = firstDeepAccountId(value, seen);
    if (found) return found;
  }

  return '';
}

function detectBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  if (/CriOS|Chrome\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent)) return 'Safari';
  return 'Browser';
}

function detectOs(userAgent: string, platform?: string | null) {
  const value = `${userAgent} ${platform || ''}`;
  if (/iPhone|iPad|iPod/.test(value)) return 'iOS';
  if (/Android/.test(value)) return 'Android';
  if (/Mac/.test(value)) return 'macOS';
  if (/Win/.test(value)) return 'Windows';
  if (/Linux/.test(value)) return 'Linux';
  return 'this device';
}

function getDeviceName(userAgent: string, platform?: string | null) {
  return `${detectBrowser(userAgent)} on ${detectOs(userAgent, platform)}`;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toIso(value: Date | string | null) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

function secondsSince(value: Date | string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
}

function toStoredSession(row: RawStoredSession, currentId: string): StoredSession {
  const lastSeenSecondsAgo = secondsSince(row.last_seen_at);

  return {
    id: row.id,
    accountId: row.account_id,
    device: row.device,
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    platform: row.platform,
    createdAt: toIso(row.created_at) || '',
    lastSeenAt: toIso(row.last_seen_at) || '',
    expiresAt: toIso(row.expires_at) || '',
    revokedAt: toIso(row.revoked_at),
    isCurrent: row.id === currentId,
    isOnline: lastSeenSecondsAgo <= ONLINE_WINDOW_SECONDS,
    lastSeenSecondsAgo,
  };
}

async function getClientIp() {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || requestHeaders.get('x-real-ip') || null;
}

async function ensureSessionTable() {
  if (hasEnsuredSessionTable) return;

  await execute(`
    CREATE TABLE IF NOT EXISTS provider_session (
      id VARCHAR(64) NOT NULL PRIMARY KEY,
      account_id VARCHAR(191) NOT NULL,
      device VARCHAR(191) NOT NULL,
      user_agent TEXT NULL,
      platform VARCHAR(191) NULL,
      ip_address VARCHAR(64) NULL,
      is_mock BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME(3) NOT NULL,
      last_seen_at DATETIME(3) NOT NULL,
      expires_at DATETIME(3) NOT NULL,
      revoked_at DATETIME(3) NULL,
      INDEX idx_provider_session_account (account_id),
      INDEX idx_provider_session_active (account_id, revoked_at, expires_at)
    )
  `);

  hasEnsuredSessionTable = true;
}

export async function createProviderSession(input: {
  profile: Record<string, any>;
  userAgent?: string;
  platform?: string;
}) {
  await ensureSessionTable();

  const accountId = getProviderAccountId(input.profile);
  if (!accountId) {
    throw new Error('Provider profile does not include a usable account id');
  }

  const now = new Date();
  const sessionId = crypto.randomUUID();
  const requestHeaders = await headers();
  const userAgent = input.userAgent || requestHeaders.get('user-agent') || '';
  const platform = input.platform || null;
  const expiresAt = addDays(now, SESSION_TTL_DAYS);

  await execute(
    `INSERT INTO provider_session
      (id, account_id, device, user_agent, platform, ip_address, is_mock, created_at, last_seen_at, expires_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionId,
      accountId,
      getDeviceName(userAgent, platform),
      userAgent,
      platform,
      await getClientIp(),
      false,
      now,
      now,
      expiresAt,
    ],
  );

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt,
  });

  return { sessionId, expiresAt: expiresAt.toISOString() };
}

export async function getCurrentServerSession() {
  await ensureSessionTable();

  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId || sessionId === 'true') return null;

  const rows = await query<RawStoredSession>(
    `SELECT id, account_id, device, user_agent AS userAgent, platform, ip_address AS ipAddress,
      created_at, last_seen_at, expires_at, revoked_at
     FROM provider_session
     WHERE id = ? AND revoked_at IS NULL AND expires_at > NOW()
     LIMIT 1`,
    [sessionId],
  );
  const row = rows[0];
  if (!row) return null;

  await execute('UPDATE provider_session SET last_seen_at = ? WHERE id = ?', [new Date(), sessionId]);

  return {
    ...toStoredSession(row, row.id),
    lastSeenAt: new Date().toISOString(),
    isOnline: true,
    lastSeenSecondsAgo: 0,
  } satisfies StoredSession;
}

export async function touchCurrentProviderSession() {
  const current = await getCurrentServerSession();
  if (!current) return null;
  return current;
}

export async function listProviderSessions() {
  await ensureSessionTable();

  const current = await getCurrentServerSession();
  if (!current) return [];

  const rows = await query<RawStoredSession>(
    `SELECT id, account_id, device, user_agent AS userAgent, platform, ip_address AS ipAddress,
      created_at, last_seen_at, expires_at, revoked_at
     FROM provider_session
     WHERE account_id = ? AND revoked_at IS NULL AND expires_at > NOW()
     ORDER BY last_seen_at DESC`,
    [current.accountId],
  );

  return rows.map((row) => toStoredSession(row, current.id));
}

export async function revokeProviderSession(sessionId: string) {
  await ensureSessionTable();

  const current = await getCurrentServerSession();
  if (!current) return { ok: false, status: 401, error: 'No active server session' };

  const rows = await query<{ account_id: string }>(
    'SELECT account_id FROM provider_session WHERE id = ? LIMIT 1',
    [sessionId],
  );
  const target = rows[0];
  if (!target) return { ok: false, status: 404, error: 'Session not found' };
  if (target.account_id !== current.accountId) return { ok: false, status: 403, error: 'Cannot revoke another account session' };
  if (sessionId === current.id) return { ok: false, status: 400, error: 'Cannot revoke the current session from this list' };

  await execute('UPDATE provider_session SET revoked_at = ? WHERE id = ?', [new Date(), sessionId]);
  return { ok: true, status: 200 };
}
