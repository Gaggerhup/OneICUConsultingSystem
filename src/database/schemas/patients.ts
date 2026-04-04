import { date, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const patients = mysqlTable('patients', {
  id: varchar('id', { length: 191 }).primaryKey(),
  cid: varchar('cid', { length: 32 }).notNull(),
  passportNo: varchar('passport_no', { length: 64 }),
  hn: varchar('hn', { length: 64 }).notNull(),
  patientName: varchar('patient_name', { length: 191 }).notNull(),
  firstName: varchar('first_name', { length: 191 }).notNull(),
  lastName: varchar('last_name', { length: 191 }).notNull(),
  gender: mysqlEnum('gender', ['male', 'female', 'other', 'unknown']).notNull().default('unknown'),
  birthDate: date('birth_date', { mode: 'string' }),
  age: int('age'),
  phoneNumber: varchar('phone_number', { length: 32 }),
  district: varchar('district', { length: 191 }),
  province: varchar('province', { length: 191 }),
  bloodType: mysqlEnum('blood_type', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown']).notNull().default('unknown'),
  allergies: json('allergies').$type<string[]>().notNull(),
  conditions: json('conditions').$type<string[]>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  cidUnique: uniqueIndex('patients_cid_unique').on(table.cid),
}));

export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;
