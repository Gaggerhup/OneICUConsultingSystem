import { date, int, mysqlTable, text, time, uniqueIndex, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const patients = mysqlTable('patient', {
  id: int('id').autoincrement().primaryKey(),
  hoscode: varchar('hoscode', { length: 20 }).notNull(),
  pid: varchar('pid', { length: 32 }).notNull(),
  hn: varchar('hn', { length: 64 }).notNull(),
  an: varchar('an', { length: 64 }).notNull(),
  admitDate: date('admit_date', { mode: 'string' }),
  admitTime: time('admit_time'),
  preName: varchar('pre_name', { length: 191 }).notNull(),
  firstName: varchar('first_name', { length: 191 }).notNull(),
  lastName: varchar('last_name', { length: 191 }).notNull(),
  gender: varchar('gender', { length: 255 }).notNull().default('unknown'),
  birthDate: date('birth_date', { mode: 'string' }),
  phoneNumber: varchar('phone_number', { length: 32 }),
  district: varchar('district', { length: 191 }),
  province: varchar('province', { length: 191 }),
  bloodType: varchar('blood_type', { length: 255 }).notNull().default('unknown'),
  dischargeDate: date('discharge_date', { mode: 'string' }),
  dischargeTime: time('discharge_time'),
  dischargeType: varchar('discharge_type', { length: 100 }),
  dischargeNote: text('discharge_note'),
}, (table) => ({
  patientPidUnique: uniqueIndex('patient_pid_unique').on(table.pid),
}));

export const patientAllergies = mysqlTable('patient_allergy', {
  id: int('id').autoincrement().primaryKey(),
  patientId: int('patient_id').notNull(),
  allergyName: varchar('allergy_name', { length: 255 }).notNull(),
  itemOrder: int('item_order').notNull().default(1),
});

export const patientConditions = mysqlTable('patient_condition', {
  id: int('id').autoincrement().primaryKey(),
  patientId: int('patient_id').notNull(),
  conditionName: varchar('condition_name', { length: 255 }).notNull(),
  itemOrder: int('item_order').notNull().default(1),
});

export type Patient = InferSelectModel<typeof patients>;
export type NewPatient = InferInsertModel<typeof patients>;
