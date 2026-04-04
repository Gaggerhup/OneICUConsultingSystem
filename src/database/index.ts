import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

// Import schemas
import * as users from './schemas/users';
import * as patients from './schemas/patients';
import * as cases from './schemas/cases';
import * as caseFiles from './schemas/case_files';
import * as notifications from './schemas/notifications';
import * as activities from './schemas/activities';
import * as vitals from './schemas/vitals';
import * as clinicalData from './schemas/clinical_data';
import * as collaboration from './schemas/collaboration';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in the environment variables');
}

// MariaDB/MySQL pool for queries
export const client = mysql.createPool(connectionString);

// Drizzle instance with all schemas
export const db = drizzle(client, {
  mode: 'default',
  schema: {
    ...users,
    ...patients,
    ...cases,
    ...caseFiles,
    ...notifications,
    ...activities,
    ...vitals,
    ...clinicalData,
    ...collaboration,
  },
});

// Export helper for re-use
export * from 'drizzle-orm';
