import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export const caseFiles = mysqlTable('case_files', {
  id: varchar('id', { length: 191 }).primaryKey(),
  caseId: varchar('case_id', { length: 191 }).notNull(),
  uploadedById: varchar('uploaded_by_id', { length: 191 }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileType: mysqlEnum('file_type', ['image', 'document', 'dicom', 'csv', 'other']).notNull().default('other'),
  category: mysqlEnum('category', ['imaging', 'lab', 'report', 'medication', 'note', 'other']).notNull().default('other'),
  mimeType: varchar('mime_type', { length: 191 }),
  fileUrl: text('file_url'),
  sizeKb: int('size_kb'),
  description: text('description'),
  isPreviewable: boolean('is_previewable').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

export type CaseFile = InferSelectModel<typeof caseFiles>;
export type NewCaseFile = InferInsertModel<typeof caseFiles>;
