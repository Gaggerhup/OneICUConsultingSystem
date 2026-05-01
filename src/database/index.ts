import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
export { eq } from 'drizzle-orm';

let pool: mysql.Pool | null = null;
let drizzleDb: any = null;

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) {
    throw new Error('DATABASE_URL is not configured');
  }
  return value;
}

function getPool() {
  if (!pool) {
    pool = mysql.createPool(getDatabaseUrl());
  }
  return pool;
}

function getDrizzleDb() {
  if (!drizzleDb) {
    drizzleDb = drizzle({ client: getPool() });
  }
  return drizzleDb;
}

export const db = new Proxy({} as any, {
  get(_target, prop, receiver) {
    return Reflect.get(getDrizzleDb(), prop, receiver);
  },
});

export async function query<T>(sql: string, params: unknown[] = []) {
  const [rows] = await getPool().query(sql, params as any[]);
  return rows as T[];
}

export async function execute(sql: string, params: unknown[] = []) {
  const [result] = await getPool().execute(sql, params as any[]);
  return result as mysql.ResultSetHeader;
}
