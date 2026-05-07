'use server';

import { execute, query } from '@/database';
import { canAccessHospital, normalizeHospitalName } from '@/lib/provider-profile';
import { recordCaseWorkflowEpisode } from '@/actions/case-workflow-episodes';

type MonitorPatientRow = {
  id: number;
  hn: string | null;
  cid: string | null;
  first_name: string | null;
  last_name: string | null;
  gender: string | null;
  birth_date: Date | string | null;
  reported_age: number | null;
  blood_type: string | null;
  phone_number: string | null;
  district: string | null;
  province: string | null;
  case_id: number | null;
  an: string | null;
  hospital: string | null;
  status: string | null;
  priority: string | null;
  specialty: string | null;
  reason: string | null;
  last_action: string | null;
  last_active_time: string | null;
  record_date: Date | string | null;
};

const activeConsultStatuses = new Set(['Approved', 'Active', 'Critical']);

function dateToString(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function calculateAge(birthDate?: string | Date | null) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const birthdayPassed =
    now.getMonth() > birth.getMonth()
    || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate());

  if (!birthdayPassed) age -= 1;
  return Math.max(0, age);
}

function splitDateTime() {
  const iso = new Date().toISOString();
  return {
    date: iso.slice(0, 10),
    time: iso.slice(11, 19),
  };
}

function createNowLabel() {
  return new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export async function listMonitoredCases(userHospital?: string | null) {
  const rows = await query<MonitorPatientRow>(`
    SELECT
      p.id,
      p.hn,
      p.cid,
      p.first_name,
      p.last_name,
      p.gender,
      p.birth_date,
      p.reported_age,
      p.blood_type,
      p.phone_number,
      p.district,
      p.province,
      cr.id AS case_id,
      cr.an,
      cr.hospital,
      cr.status,
      cr.priority,
      cr.specialty,
      cr.reason,
      cr.last_action,
      cr.last_active_time,
      cr.record_date
    FROM app_patient p
    LEFT JOIN (
      SELECT latest_case.*
      FROM case_register latest_case
      INNER JOIN (
        SELECT patient_id, MAX(id) AS id
        FROM case_register
        GROUP BY patient_id
      ) latest ON latest.id = latest_case.id
    ) cr ON cr.patient_id = p.id
    ORDER BY COALESCE(cr.id, p.id) DESC
    LIMIT 500
  `);

  return rows.map((row) => {
    const status = row.status || 'Unregistered';
    const registered = Boolean(row.case_id);
    const activeConsult = registered && activeConsultStatuses.has(status);
    const hospital = normalizeHospitalName(row.hospital || row.province) || row.hospital || row.province || 'ไม่ระบุหน่วยบริการ';

    return {
      patientId: String(row.id),
      caseId: row.case_id ? String(row.case_id) : null,
      patientName: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'ไม่ระบุชื่อ',
      hn: row.hn,
      an: row.an,
      cid: row.cid,
      age: calculateAge(row.birth_date) ?? row.reported_age,
      gender: row.gender,
      bloodType: row.blood_type,
      phone: row.phone_number,
      district: row.district,
      province: row.province,
      hospital,
      status,
      priority: row.priority || 'NON-URGENT',
      specialty: row.specialty,
      reason: row.reason,
      lastAction: row.last_action,
      lastActiveTime: row.last_active_time || dateToString(row.record_date),
      registered,
      activeConsult,
    };
  }).filter((row) => userHospital === undefined || canAccessHospital(userHospital, row.hospital));
}

export async function activateMonitoredPatientConsultRequest(
  patientId: string,
  userHospital?: string | null,
  senderId?: string | null,
) {
  const numericPatientId = Number.parseInt(patientId, 10);
  if (!Number.isFinite(numericPatientId)) {
    throw new Error(`Invalid patient id: ${patientId}`);
  }

  const patientRows = await query<any>(`
    SELECT id, province
    FROM app_patient
    WHERE id = ?
    LIMIT 1
  `, [numericPatientId]);

  const patient = patientRows[0];
  if (!patient) throw new Error('Patient not found');
  const patientHospital = normalizeHospitalName(patient.province) || patient.province || null;

  if (userHospital !== undefined && !canAccessHospital(userHospital, patientHospital)) {
    throw new Error('This account can register monitored cases only from its own hospital');
  }

  const existingRows = await query<any>(`
    SELECT id, status, an, hospital, priority, specialty, reason, current_symptoms, initial_diagnosis, clinical_notes
    FROM case_register
    WHERE patient_id = ?
    ORDER BY id DESC
    LIMIT 1
  `, [numericPatientId]);

  const existing = existingRows[0];
  if (existing) {
    if (activeConsultStatuses.has(existing.status)) {
      return { caseId: String(existing.id), created: false, status: existing.status };
    }

    if (existing.status === 'Pending') {
      if (senderId) {
        await execute(`
          UPDATE case_register
          SET sender_id = ?, last_action = ?, last_active_time = ?
          WHERE id = ?
        `, [senderId, 'Activated consult request', createNowLabel(), existing.id]);
      }

      return { caseId: String(existing.id), created: false, status: existing.status };
    }

    if (['Declined', 'Cancelled'].includes(existing.status)) {
      const now = splitDateTime();
      await execute(`
        UPDATE case_register
        SET hospital = ?, record_date = ?, record_time = ?, status = ?, priority = ?, specialty = ?, reason = ?,
            current_symptoms = ?, initial_diagnosis = ?, clinical_notes = ?, sender_id = ?, last_action = ?, last_active_time = ?
        WHERE id = ?
      `, [
        existing.hospital || patientHospital,
        now.date,
        now.time,
        'Pending',
        existing.priority || 'NON-URGENT',
        existing.specialty || null,
        existing.reason || 'Consult request from case monitor',
        existing.current_symptoms || null,
        existing.initial_diagnosis || null,
        existing.clinical_notes || null,
        senderId || null,
        'Consult request from monitor',
        createNowLabel(),
        existing.id,
      ]);
      await recordCaseWorkflowEpisode({
        caseId: String(existing.id),
        patientId: numericPatientId,
        episodeType: 'request',
        status: 'Pending',
        action: 'Activated consult request',
        actorId: senderId || null,
        note: 'Request again from Case Monitor',
      }).catch((error) => console.error('[case-monitor] Unable to record workflow episode:', error));

      return { caseId: String(existing.id), created: false, status: 'Pending' };
    }

    await execute(`
      UPDATE case_register
      SET status = ?, sender_id = ?, last_action = ?, last_active_time = ?
      WHERE id = ?
    `, ['Pending', senderId || null, 'Activated consult request', createNowLabel(), existing.id]);
    await recordCaseWorkflowEpisode({
      caseId: String(existing.id),
      patientId: numericPatientId,
      episodeType: 'request',
      status: 'Pending',
      action: 'Activated consult request',
      actorId: senderId || null,
      note: 'Request from Case Monitor',
    }).catch((error) => console.error('[case-monitor] Unable to record workflow episode:', error));

    return { caseId: String(existing.id), created: false, status: 'Pending' };
  }

  const now = splitDateTime();
  const created = await execute(`
    INSERT INTO case_register (
      patient_id, hospital, record_date, record_time, status, priority, specialty, reason,
      current_symptoms, initial_diagnosis, clinical_notes, sender_id, last_action, last_active_time
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    numericPatientId,
    patientHospital,
    now.date,
    now.time,
    'Pending',
    'NON-URGENT',
    null,
    'Consult request from case monitor',
    null,
    null,
    null,
    senderId || null,
    'Consult request from monitor',
    createNowLabel(),
  ]);
  await recordCaseWorkflowEpisode({
    caseId: String(created.insertId),
    patientId: numericPatientId,
    episodeType: 'request',
    status: 'Pending',
    action: 'Consult request from monitor',
    actorId: senderId || null,
    note: 'Initial request from Case Monitor',
  }).catch((error) => console.error('[case-monitor] Unable to record workflow episode:', error));

  return { caseId: String(created.insertId), created: true, status: 'Pending' };
}

export async function deactivateMonitoredPatientCase(patientId: string, userHospital?: string | null) {
  const numericPatientId = Number.parseInt(patientId, 10);
  if (!Number.isFinite(numericPatientId)) {
    throw new Error(`Invalid patient id: ${patientId}`);
  }

  const patientRows = await query<any>(`
    SELECT id, province
    FROM app_patient
    WHERE id = ?
    LIMIT 1
  `, [numericPatientId]);

  const patient = patientRows[0];
  if (!patient) throw new Error('Patient not found');
  const patientHospital = normalizeHospitalName(patient.province) || patient.province || null;

  if (userHospital !== undefined && !canAccessHospital(userHospital, patientHospital)) {
    throw new Error('This account can deactivate monitored cases only from its own hospital');
  }

  const existingRows = await query<any>(`
    SELECT id, status
    FROM case_register
    WHERE patient_id = ?
    ORDER BY id DESC
    LIMIT 1
  `, [numericPatientId]);

  const existing = existingRows[0];
  if (!existing) return { caseId: null, deactivated: false, status: 'Unregistered' };

  await execute(`
    UPDATE case_register
    SET status = ?, last_action = ?, last_active_time = ?
    WHERE id = ?
  `, ['Inactive', 'Deactivated consult', createNowLabel(), existing.id]);

  return { caseId: String(existing.id), deactivated: true, status: 'Inactive' };
}
