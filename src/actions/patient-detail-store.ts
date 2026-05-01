'use server';

import { execute, query } from '@/database';

function toCaseRegisterId(caseId: string) {
  const numeric = Number.parseInt(caseId.replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(numeric)) throw new Error(`Invalid case id: ${caseId}`);
  return numeric;
}

function dateToString(value: unknown): string {
  if (!value) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function calculateAge(birthDate?: string | Date | null) {
  if (!birthDate) return 0;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return 0;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > birth.getMonth()
    || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

  if (!hasBirthdayPassed) {
    age -= 1;
  }

  return Math.max(0, age);
}

function resolveAge(birthDate?: string | Date | null, reportedAge?: number | null) {
  const derivedAge = calculateAge(birthDate);
  if (derivedAge > 0) return derivedAge;
  if (typeof reportedAge === 'number' && Number.isFinite(reportedAge)) return Math.max(0, reportedAge);
  return 0;
}

function splitDateTime(value?: string | null) {
  const date = value ? new Date(value) : new Date();
  const iso = date.toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 19),
  };
}

function recentLabel(dateIso?: string | null) {
  if (!dateIso) return 'recently';
  const diffMs = Date.now() - new Date(dateIso).getTime();
  const diffMin = Math.max(0, Math.round(diffMs / 60000));
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return new Date(dateIso).toLocaleDateString('th-TH', { month: 'short', day: 'numeric' });
}

function splitPatientName(name?: string | null) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ') || firstName;
  return { firstName, lastName };
}

export async function listCasesWithOverrides() {
  const rows = await query<any>(`
    SELECT
      cr.id,
      cr.an,
      cr.hospital,
      cr.status,
      cr.priority,
      cr.specialty,
      cr.reason,
      cr.current_symptoms,
      cr.initial_diagnosis,
      cr.clinical_notes,
      cr.sender_id,
      cr.last_action,
      cr.last_active_time,
      p.hn,
      p.cid,
      p.gender,
      p.blood_type,
      p.birth_date,
      p.reported_age,
      p.first_name,
      p.last_name
    FROM case_register cr
    INNER JOIN app_patient p ON p.id = cr.patient_id
    ORDER BY cr.id DESC
  `);

  return rows.map((row) => ({
    id: String(row.id),
    patientName: `${row.first_name} ${row.last_name}`.trim(),
    hospital: row.hospital || '—',
    status: row.status,
    priority: row.priority,
    specialty: row.specialty,
    reason: row.reason,
    senderId: row.sender_id,
    hn: row.hn,
    an: row.an,
    cid: row.cid,
    age: resolveAge(row.birth_date, row.reported_age),
    gender: row.gender,
    bloodType: row.blood_type,
    currentSymptoms: row.current_symptoms,
    initialDiagnosis: row.initial_diagnosis,
    clinicalNotes: row.clinical_notes,
    lastAction: row.last_action,
    lastActiveTime: row.last_active_time,
  }));
}

export async function getCaseWithOverrides(caseId: string) {
  const rows = await query<any>(`
    SELECT
      cr.id,
      cr.patient_id,
      cr.an,
      cr.hospital,
      cr.record_date,
      cr.status,
      cr.priority,
      cr.specialty,
      cr.reason,
      cr.current_symptoms,
      cr.initial_diagnosis,
      cr.clinical_notes,
      cr.sender_id,
      cr.last_action,
      cr.last_active_time,
      p.hn,
      p.cid,
      p.gender,
      p.blood_type,
      p.birth_date,
      p.reported_age,
      p.first_name,
      p.last_name
    FROM case_register cr
    INNER JOIN app_patient p ON p.id = cr.patient_id
    WHERE cr.id = ?
    LIMIT 1
  `, [toCaseRegisterId(caseId)]);

  const row = rows[0];
  if (!row) return null;

  const [conditions, allergies] = await Promise.all([
    query<any>(`SELECT condition_name FROM app_patient_condition WHERE patient_id = ? ORDER BY item_order ASC`, [row.patient_id]),
    query<any>(`SELECT allergy_name FROM patient_allergy WHERE patient_id = ? ORDER BY item_order ASC`, [row.patient_id]),
  ]);

  return {
    id: String(row.id),
    patientName: `${row.first_name} ${row.last_name}`.trim(),
    hospital: row.hospital || '—',
    status: row.status,
    priority: row.priority,
    date: dateToString(row.record_date),
    specialty: row.specialty,
    reason: row.reason,
    senderId: row.sender_id,
    hn: row.hn,
    an: row.an,
    cid: row.cid,
    age: resolveAge(row.birth_date, row.reported_age),
    gender: row.gender,
    bloodType: row.blood_type,
    currentSymptoms: row.current_symptoms,
    initialDiagnosis: row.initial_diagnosis,
    clinicalNotes: row.clinical_notes,
    lastAction: row.last_action,
    lastActiveTime: row.last_active_time,
    conditions: conditions.map((item) => item.condition_name),
    allergies: allergies.map((item) => item.allergy_name),
  };
}

export async function patchCase(caseId: string, patch: Record<string, unknown>) {
  const caseRegisterId = toCaseRegisterId(caseId);
  const updates: string[] = [];
  const params: unknown[] = [];

  const fieldMap: Record<string, string> = {
    patientName: '',
    currentSymptoms: 'current_symptoms',
    initialDiagnosis: 'initial_diagnosis',
    clinicalNotes: 'clinical_notes',
    hospital: 'hospital',
    an: 'an',
    priority: 'priority',
    specialty: 'specialty',
    reason: 'reason',
    lastAction: 'last_action',
    lastActiveTime: 'last_active_time',
    status: 'status',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (!column || !(key in patch)) continue;
    updates.push(`${column} = ?`);
    params.push(patch[key]);
  }

  if (updates.length > 0) {
    await execute(`UPDATE case_register SET ${updates.join(', ')} WHERE id = ?`, [...params, caseRegisterId]);
  }

  return getCaseWithOverrides(caseId);
}

type UpsertStoredCaseInput = {
  patientName: string;
  hospital?: string | null;
  priority: string;
  specialty?: string | null;
  reason?: string | null;
  senderId?: string | null;
  hn?: string | null;
  an?: string | null;
  cid?: string | null;
  age?: number | null;
  phone?: string | null;
  dob?: string | null;
  district?: string | null;
  province?: string | null;
  bloodType?: string | null;
  gender?: string | null;
  allergies?: string[] | null;
  conditions?: string[] | null;
  currentSymptoms?: string | null;
  initialDiagnosis?: string | null;
  clinicalNotes?: string | null;
};

export async function upsertStoredCase(input: UpsertStoredCaseInput) {
  const { firstName, lastName } = splitPatientName(input.patientName);
  let patientId: number | null = null;

  if (input.cid) {
    const cidRows = await query<any>(`SELECT id FROM app_patient WHERE cid = ? LIMIT 1`, [input.cid]);
    patientId = cidRows[0]?.id || null;
  }

  if (!patientId && input.hn) {
    const hnRows = await query<any>(`SELECT id FROM app_patient WHERE hn = ? LIMIT 1`, [input.hn]);
    patientId = hnRows[0]?.id || null;
  }

  if (!patientId) {
    const createdPatient = await execute(`
      INSERT INTO app_patient (hn, cid, first_name, last_name, gender, birth_date, reported_age, blood_type, phone_number, district, province)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      input.hn || null,
      input.cid || null,
      firstName || null,
      lastName || null,
      input.gender || null,
      input.dob || null,
      input.age ?? null,
      input.bloodType || null,
      input.phone || null,
      input.district || null,
      input.province || null,
    ]);
    patientId = createdPatient.insertId;
  } else {
    await execute(`
      UPDATE app_patient
      SET hn = ?, cid = ?, first_name = ?, last_name = ?, gender = ?, birth_date = ?, reported_age = ?, blood_type = ?, phone_number = ?, district = ?, province = ?
      WHERE id = ?
    `, [
      input.hn || null,
      input.cid || null,
      firstName || null,
      lastName || null,
      input.gender || null,
      input.dob || null,
      input.age ?? null,
      input.bloodType || null,
      input.phone || null,
      input.district || null,
      input.province || null,
      patientId,
    ]);
  }

  await execute(`DELETE FROM app_patient_condition WHERE patient_id = ?`, [patientId]);
  for (const [index, item] of (input.conditions || []).filter(Boolean).entries()) {
    await execute(
      `INSERT INTO app_patient_condition (patient_id, condition_name, item_order) VALUES (?, ?, ?)`,
      [patientId, item, index + 1],
    );
  }

  await execute(`DELETE FROM patient_allergy WHERE patient_id = ?`, [patientId]);
  for (const [index, item] of (input.allergies || []).filter(Boolean).entries()) {
    await execute(
      `INSERT INTO patient_allergy (patient_id, allergy_name, item_order) VALUES (?, ?, ?)`,
      [patientId, item, index + 1],
    );
  }

  const now = splitDateTime();
  const existingCaseRows = await query<any>(`SELECT id FROM case_register WHERE patient_id = ? LIMIT 1`, [patientId]);
  const existingCaseId = existingCaseRows[0]?.id || null;

  if (existingCaseId) {
    await execute(`
      UPDATE case_register
      SET an = ?, hospital = ?, record_date = ?, record_time = ?, status = ?, priority = ?, specialty = ?, reason = ?, current_symptoms = ?,
          initial_diagnosis = ?, clinical_notes = ?, sender_id = ?, last_action = ?, last_active_time = ?
      WHERE id = ?
    `, [
      input.an || null,
      input.hospital || null,
      now.date,
      now.time,
      'Pending',
      input.priority,
      input.specialty || null,
      input.reason || null,
      input.currentSymptoms || null,
      input.initialDiagnosis || null,
      input.clinicalNotes || null,
      input.senderId || null,
      'Created',
      new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      existingCaseId,
    ]);

    return getCaseWithOverrides(String(existingCaseId));
  }

  const createdCase = await execute(`
    INSERT INTO case_register (
      patient_id, an, hospital, record_date, record_time, status, priority, specialty, reason,
      current_symptoms, initial_diagnosis, clinical_notes, sender_id, last_action, last_active_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    patientId,
    input.an || null,
    input.hospital || null,
    now.date,
    now.time,
    'Pending',
    input.priority,
    input.specialty || null,
    input.reason || null,
    input.currentSymptoms || null,
    input.initialDiagnosis || null,
    input.clinicalNotes || null,
    input.senderId || null,
    'Created',
    new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
  ]);

  return getCaseWithOverrides(String(createdCase.insertId));
}

export async function getStoredPatient(caseId: string) {
  const rows = await query<any>(`
    SELECT p.*, cr.patient_id
    FROM case_register cr
    INNER JOIN app_patient p ON p.id = cr.patient_id
    WHERE cr.id = ?
    LIMIT 1
  `, [toCaseRegisterId(caseId)]);
  const row = rows[0];
  if (!row) return null;

  const [conditions, allergies] = await Promise.all([
    query<any>(`SELECT condition_name FROM app_patient_condition WHERE patient_id = ? ORDER BY item_order ASC`, [row.patient_id]),
    query<any>(`SELECT allergy_name FROM patient_allergy WHERE patient_id = ? ORDER BY item_order ASC`, [row.patient_id]),
  ]);

  return {
    id: row.patient_id,
    hn: row.hn,
    cid: row.cid,
    age: resolveAge(row.birth_date, row.reported_age),
    gender: row.gender,
    bloodType: row.blood_type,
    phoneNumber: row.phone_number,
    birthDate: dateToString(row.birth_date),
    district: row.district,
    province: row.province,
    conditions: conditions.map((item) => item.condition_name),
    allergies: allergies.map((item) => item.allergy_name),
  };
}

export async function patchStoredPatient(caseId: string, patch: Record<string, unknown>) {
  const patientRows = await query<any>(`SELECT patient_id FROM case_register WHERE id = ? LIMIT 1`, [toCaseRegisterId(caseId)]);
  const patientId = patientRows[0]?.patient_id;
  if (!patientId) throw new Error('Patient not found');

  const updates: string[] = [];
  const params: unknown[] = [];
  const fieldMap: Record<string, string> = {
    hn: 'hn',
    cid: 'cid',
    age: 'reported_age',
    gender: 'gender',
    bloodType: 'blood_type',
    phoneNumber: 'phone_number',
    birthDate: 'birth_date',
    district: 'district',
    province: 'province',
  };

  for (const [key, column] of Object.entries(fieldMap)) {
    if (!column || !(key in patch)) continue;
    updates.push(`${column} = ?`);
    params.push(patch[key]);
  }

  if (updates.length > 0) {
    await execute(`UPDATE app_patient SET ${updates.join(', ')} WHERE id = ?`, [...params, patientId]);
  }

  if ('conditions' in patch && Array.isArray(patch.conditions)) {
    await execute(`DELETE FROM app_patient_condition WHERE patient_id = ?`, [patientId]);
    for (const [index, item] of patch.conditions.entries()) {
      await execute(`INSERT INTO app_patient_condition (patient_id, condition_name, item_order) VALUES (?, ?, ?)`, [patientId, item, index + 1]);
    }
  }

  if ('allergies' in patch && Array.isArray(patch.allergies)) {
    await execute(`DELETE FROM patient_allergy WHERE patient_id = ?`, [patientId]);
    for (const [index, item] of patch.allergies.entries()) {
      await execute(`INSERT INTO patient_allergy (patient_id, allergy_name, item_order) VALUES (?, ?, ?)`, [patientId, item, index + 1]);
    }
  }

  if ('name' in patch && typeof patch.name === 'string') {
    const parts = patch.name.trim().split(/\s+/);
    const firstName = parts.shift() || '';
    const lastName = parts.join(' ') || firstName;
    await execute(`UPDATE app_patient SET first_name = ?, last_name = ? WHERE id = ?`, [firstName, lastName, patientId]);
  }

  return getStoredPatient(caseId);
}

export async function listStoredVitals(caseId: string) {
  const rows = await query<any>(`
    SELECT id, bp, hr, temp, rr, spo2, gcs,
           CONCAT(record_date, 'T', COALESCE(record_time, '00:00:00')) AS recorded_at
    FROM case_vital
    WHERE case_register_id = ?
    ORDER BY record_date DESC, record_time DESC, id DESC
  `, [toCaseRegisterId(caseId)]);
  return rows.map((row) => ({
    id: String(row.id),
    bp: row.bp,
    hr: row.hr,
    temp: row.temp,
    rr: row.rr,
    spo2: row.spo2,
    gcs: row.gcs,
    recordedAt: row.recorded_at,
  }));
}

export async function insertStoredVital(caseId: string, input: any) {
  const { date, time } = splitDateTime(input.recordedAt);
  const result = await execute(`
    INSERT INTO case_vital (case_register_id, record_date, record_time, bp, hr, temp, rr, spo2, gcs)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [toCaseRegisterId(caseId), date, time, input.bp, input.hr, input.temp, input.rr, input.spo2, input.gcs]);
  return { id: String(result.insertId), ...input, recordedAt: `${date}T${time}` };
}

export async function patchStoredVital(caseId: string, vitalId: string, patch: any) {
  const sets: string[] = [];
  const params: unknown[] = [];
  if (patch.recordedAt) {
    const { date, time } = splitDateTime(patch.recordedAt);
    sets.push('record_date = ?', 'record_time = ?');
    params.push(date, time);
  }
  for (const key of ['bp', 'hr', 'temp', 'rr', 'spo2', 'gcs']) {
    if (key in patch) {
      sets.push(`${key} = ?`);
      params.push(patch[key]);
    }
  }
  if (sets.length === 0) {
    const rows = await listStoredVitals(caseId);
    return rows.find((item) => item.id === vitalId) || null;
  }
  await execute(`UPDATE case_vital SET ${sets.join(', ')} WHERE id = ? AND case_register_id = ?`, [...params, Number(vitalId), toCaseRegisterId(caseId)]);
  const rows = await listStoredVitals(caseId);
  return rows.find((item) => item.id === vitalId) || null;
}

export async function removeStoredVital(caseId: string, vitalId: string) {
  await execute(`DELETE FROM case_vital WHERE id = ? AND case_register_id = ?`, [Number(vitalId), toCaseRegisterId(caseId)]);
  return true;
}

export async function listStoredLabs(caseId: string) {
  const rows = await query<any>(`SELECT * FROM case_lab WHERE case_register_id = ? ORDER BY id DESC`, [toCaseRegisterId(caseId)]);
  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    result: row.result,
    unit: row.unit,
    refRange: row.ref_range,
    status: row.status,
  }));
}

export async function insertStoredLab(caseId: string, input: any) {
  const now = splitDateTime();
  const result = await execute(`
    INSERT INTO case_lab (case_register_id, lab_date, lab_time, name, result, unit, ref_range, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [toCaseRegisterId(caseId), now.date, now.time, input.name, input.result, input.unit, input.refRange, input.status]);
  return { id: String(result.insertId), ...input };
}

export async function patchStoredLab(caseId: string, labId: string, patch: any) {
  const sets: string[] = [];
  const params: unknown[] = [];
  const map: Record<string, string> = { name: 'name', result: 'result', unit: 'unit', refRange: 'ref_range', status: 'status' };
  for (const [key, column] of Object.entries(map)) {
    if (key in patch) {
      sets.push(`${column} = ?`);
      params.push(patch[key]);
    }
  }
  if (sets.length === 0) {
    const rows = await listStoredLabs(caseId);
    return rows.find((item) => item.id === labId) || null;
  }
  await execute(`UPDATE case_lab SET ${sets.join(', ')} WHERE id = ? AND case_register_id = ?`, [...params, Number(labId), toCaseRegisterId(caseId)]);
  const rows = await listStoredLabs(caseId);
  return rows.find((item) => item.id === labId) || null;
}

export async function removeStoredLab(caseId: string, labId: string) {
  await execute(`DELETE FROM case_lab WHERE id = ? AND case_register_id = ?`, [Number(labId), toCaseRegisterId(caseId)]);
  return true;
}

export async function listStoredMedications(caseId: string) {
  const rows = await query<any>(`SELECT * FROM case_medication WHERE case_register_id = ? ORDER BY id DESC`, [toCaseRegisterId(caseId)]);
  return rows.map((row) => ({
    id: String(row.id),
    name: row.name,
    dose: row.dose,
    freq: row.freq,
    route: row.route,
    start: dateToString(row.start_date),
    category: row.category || '',
  }));
}

export async function insertStoredMedication(caseId: string, input: any) {
  const now = splitDateTime();
  const result = await execute(`
    INSERT INTO case_medication (case_register_id, start_date, start_time, name, dose, freq, route, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [toCaseRegisterId(caseId), input.start || now.date, now.time, input.name, input.dose, input.freq, input.route, input.category]);
  return { id: String(result.insertId), ...input };
}

export async function patchStoredMedication(caseId: string, medicationId: string, patch: any) {
  const sets: string[] = [];
  const params: unknown[] = [];
  const map: Record<string, string> = { name: 'name', dose: 'dose', freq: 'freq', route: 'route', start: 'start_date', category: 'category' };
  for (const [key, column] of Object.entries(map)) {
    if (key in patch) {
      sets.push(`${column} = ?`);
      params.push(patch[key]);
    }
  }
  if (sets.length === 0) {
    const rows = await listStoredMedications(caseId);
    return rows.find((item) => item.id === medicationId) || null;
  }
  await execute(`UPDATE case_medication SET ${sets.join(', ')} WHERE id = ? AND case_register_id = ?`, [...params, Number(medicationId), toCaseRegisterId(caseId)]);
  const rows = await listStoredMedications(caseId);
  return rows.find((item) => item.id === medicationId) || null;
}

export async function removeStoredMedication(caseId: string, medicationId: string) {
  await execute(`DELETE FROM case_medication WHERE id = ? AND case_register_id = ?`, [Number(medicationId), toCaseRegisterId(caseId)]);
  return true;
}

export async function listStoredNotes(caseId: string) {
  const rows = await query<any>(`
    SELECT cn.id, cn.note_text, cn.color, cn.record_date, cn.record_time, pr.title, pr.first_name, pr.last_name, pr.specialty
    FROM case_note cn
    LEFT JOIN provider pr ON pr.id = cn.provider_id_do_note
    WHERE cn.case_register_id = ?
    ORDER BY cn.record_date DESC, cn.record_time DESC, cn.id DESC
  `, [toCaseRegisterId(caseId)]);
  return rows.map((row) => {
    const authorName = (row.first_name || row.last_name) 
      ? `${row.title || ''} ${row.first_name || ''} ${row.last_name || ''}`.trim().replace(/\s+/g, ' ') 
      : 'Medical Staff';
      
    return {
      id: String(row.id),
      authorName,
      authorRole: row.specialty || 'Medical Staff',
      authorColor: row.color || '4318FF',
      body: row.note_text,
      time: recentLabel(`${dateToString(row.record_date)}T${row.record_time || '00:00:00'}`),
    };
  });
}

export async function insertStoredNote(caseId: string, input: any) {
  const now = splitDateTime();
  const providerId = Number(input.authorId?.replace(/[^\d]/g, '') || 1) || 1;
  const result = await execute(`
    INSERT INTO case_note (case_register_id, record_date, record_time, provider_id_do_note, color, note_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [toCaseRegisterId(caseId), now.date, now.time, providerId, input.authorColor || '4318FF', input.body]);
  return {
    id: String(result.insertId),
    authorName: input.authorName,
    authorRole: input.authorRole,
    authorColor: input.authorColor || '4318FF',
    body: input.body,
    time: 'Just now',
  };
}

export async function patchStoredNote(caseId: string, noteId: string, patch: any) {
  await execute(`UPDATE case_note SET note_text = ?, color = COALESCE(?, color) WHERE id = ? AND case_register_id = ?`, [patch.body, patch.authorColor || null, Number(noteId), toCaseRegisterId(caseId)]);
  const rows = await listStoredNotes(caseId);
  return rows.find((item) => item.id === noteId) || null;
}

export async function removeStoredNote(caseId: string, noteId: string) {
  await execute(`DELETE FROM case_note WHERE id = ? AND case_register_id = ?`, [Number(noteId), toCaseRegisterId(caseId)]);
  return true;
}

export async function listStoredFiles(caseId: string) {
  const rows = await query<any>(`SELECT * FROM case_file WHERE case_register_id = ? ORDER BY file_date DESC, file_time DESC, id DESC`, [toCaseRegisterId(caseId)]);
  return rows.map((row) => ({
    id: String(row.id),
    fileName: row.file_name,
    fileType: row.file_type,
    category: row.category,
    mimeType: row.mime_type,
    fileUrl: row.file_url,
    sizeKb: row.size_kb,
    description: row.description,
    isPreviewable: Boolean(row.is_previewable),
    createdAt: `${dateToString(row.file_date)}T${row.file_time || '00:00:00'}`,
  }));
}

export async function insertStoredFile(caseId: string, input: any) {
  const now = splitDateTime();
  const result = await execute(`
    INSERT INTO case_file (case_register_id, file_date, file_time, privder_id_do_file, file_name, file_type, category, mime_type, file_url, size_kb, description, is_previewable)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [toCaseRegisterId(caseId), now.date, now.time, '1', input.fileName, input.fileType, input.category, input.mimeType, input.fileUrl, input.sizeKb, input.description, input.isPreviewable ? 1 : 0]);
  return { id: String(result.insertId), ...input, createdAt: `${now.date}T${now.time}` };
}

export async function patchStoredFile(caseId: string, fileId: string, patch: any) {
  const sets: string[] = [];
  const params: unknown[] = [];
  const map: Record<string, string> = { fileName: 'file_name', fileType: 'file_type', category: 'category', mimeType: 'mime_type', fileUrl: 'file_url', sizeKb: 'size_kb', description: 'description', isPreviewable: 'is_previewable' };
  for (const [key, column] of Object.entries(map)) {
    if (key in patch) {
      sets.push(`${column} = ?`);
      params.push(key === 'isPreviewable' ? (patch[key] ? 1 : 0) : patch[key]);
    }
  }
  if (sets.length === 0) {
    const rows = await listStoredFiles(caseId);
    return rows.find((item) => item.id === fileId) || null;
  }
  await execute(`UPDATE case_file SET ${sets.join(', ')} WHERE id = ? AND case_register_id = ?`, [...params, Number(fileId), toCaseRegisterId(caseId)]);
  const rows = await listStoredFiles(caseId);
  return rows.find((item) => item.id === fileId) || null;
}

export async function removeStoredFile(caseId: string, fileId: string) {
  await execute(`DELETE FROM case_file WHERE id = ? AND case_register_id = ?`, [Number(fileId), toCaseRegisterId(caseId)]);
  return true;
}
