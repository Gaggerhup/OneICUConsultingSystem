import { NextResponse } from 'next/server';
import { createCase } from '@/actions/cases';
import {
  insertStoredLab,
  insertStoredMedication,
  insertStoredNote,
  insertStoredVital,
} from '@/actions/patient-detail-store';

type HospitalPayload = Record<string, any>;

function asObject(value: unknown): Record<string, any> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {};
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown) {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
}

function asNumber(value: unknown) {
  if (value === undefined || value === null || value === '') return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    const text = asString(value);
    if (text) return text;
  }
  return null;
}

function pickArray(...values: unknown[]) {
  for (const value of values) {
    if (Array.isArray(value)) return value.map(asString).filter(Boolean) as string[];
    const text = asString(value);
    if (text) return text.split(',').map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function buildPatientName(patient: HospitalPayload, body: HospitalPayload) {
  const fullName = pickString(patient.name, patient.patientName, body.patientName, body.name);
  if (fullName) return fullName;

  const firstName = pickString(patient.firstName, patient.first_name, body.firstName, body.first_name);
  const lastName = pickString(patient.lastName, patient.last_name, body.lastName, body.last_name);
  const combinedName = [firstName, lastName].filter(Boolean).join(' ').trim();
  if (combinedName) return combinedName;

  const identifier = pickString(patient.hn, body.hn, patient.cid, body.cid);
  return identifier ? `Unknown patient ${identifier}` : 'Unknown patient';
}

function assertAuthorized(request: Request) {
  const expectedToken = process.env.ICU_API_TOKEN;
  if (!expectedToken) return null;

  const authorization = request.headers.get('authorization') || '';
  const bearerToken = authorization.match(/^Bearer\s+(.+)$/i)?.[1];
  const apiKey = request.headers.get('x-api-key');

  if (bearerToken === expectedToken || apiKey === expectedToken) return null;

  return NextResponse.json(
    { success: false, error: 'Unauthorized ICU API request' },
    { status: 401 },
  );
}

export async function POST(request: Request) {
  const unauthorizedResponse = assertAuthorized(request);
  if (unauthorizedResponse) return unauthorizedResponse;

  let body: HospitalPayload;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Request body must be valid JSON' },
      { status: 400 },
    );
  }

  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json(
      { success: false, error: 'Request body must be a JSON object' },
      { status: 400 },
    );
  }

  const patient = asObject(body.patient);
  const caseData = asObject(body.case || body.consult || body.request);
  const patientName = buildPatientName(patient, body);
  const priority = pickString(caseData.priority, body.priority, caseData.urgency, body.urgency) || 'Medium';

  try {
    const createdCase = await createCase({
      patientName,
      hospital: pickString(caseData.hospital, body.hospital, patient.hospital, body.hospitalName),
      priority,
      specialty: pickString(caseData.specialty, body.specialty, caseData.department, body.department),
      reason: pickString(caseData.reason, body.reason, caseData.chiefComplaint, body.chiefComplaint),
      senderId: pickString(caseData.senderId, body.senderId, caseData.requesterId, body.requesterId),
      hn: pickString(patient.hn, body.hn),
      an: pickString(caseData.an, patient.an, body.an),
      cid: pickString(patient.cid, patient.nationalId, body.cid, body.nationalId),
      age: asNumber(patient.age ?? patient.reportedAge ?? body.age ?? body.reportedAge),
      phone: pickString(patient.phone, patient.phoneNumber, body.phone, body.phoneNumber),
      dob: pickString(patient.dob, patient.birthDate, patient.birth_date, body.dob, body.birthDate),
      district: pickString(patient.district, body.district),
      province: pickString(patient.province, body.province),
      bloodType: pickString(patient.bloodType, patient.blood_type, body.bloodType, body.blood_type),
      gender: pickString(patient.gender, body.gender),
      allergies: pickArray(patient.allergies, body.allergies),
      conditions: pickArray(patient.conditions, patient.diagnoses, body.conditions, body.diagnoses),
      presentIllness: pickString(caseData.presentIllness, caseData.present_illness, body.presentIllness, body.present_illness),
      currentSymptoms: pickString(caseData.presentIllness, caseData.present_illness, body.presentIllness, body.present_illness, caseData.currentSymptoms, caseData.current_symptoms, body.currentSymptoms, body.symptoms),
      initialDiagnosis: pickString(caseData.initialDiagnosis, caseData.initial_diagnosis, body.initialDiagnosis, body.diagnosis),
      clinicalNotes: pickString(caseData.clinicalNotes, caseData.clinical_notes, body.clinicalNotes, body.note),
    });

    const caseId = String(createdCase?.id || '');
    const inserted = {
      vitals: 0,
      labs: 0,
      medications: 0,
      notes: 0,
    };

    for (const vital of asArray(body.vitals).map(asObject)) {
      await insertStoredVital(caseId, {
        recordedAt: pickString(vital.recordedAt, vital.recorded_at, vital.datetime, vital.createdAt) || new Date().toISOString(),
        bp: pickString(vital.bp, vital.bloodPressure, vital.blood_pressure),
        hr: pickString(vital.hr, vital.heartRate, vital.heart_rate),
        temp: pickString(vital.temp, vital.temperature),
        rr: pickString(vital.rr, vital.respiratoryRate, vital.respiratory_rate),
        spo2: pickString(vital.spo2, vital.spo2Percent, vital.oxygenSaturation),
        gcs: pickString(vital.gcs),
      });
      inserted.vitals += 1;
    }

    for (const lab of asArray(body.labs).map(asObject)) {
      const name = pickString(lab.name, lab.labName, lab.lab_name, lab.test);
      if (!name) continue;
      await insertStoredLab(caseId, {
        name,
        result: pickString(lab.result, lab.value),
        unit: pickString(lab.unit),
        refRange: pickString(lab.refRange, lab.ref_range, lab.referenceRange),
        status: pickString(lab.status),
      });
      inserted.labs += 1;
    }

    for (const medication of asArray(body.medications).map(asObject)) {
      const name = pickString(medication.name, medication.drugName, medication.drug_name);
      if (!name) continue;
      await insertStoredMedication(caseId, {
        name,
        dose: pickString(medication.dose),
        freq: pickString(medication.freq, medication.frequency),
        route: pickString(medication.route),
        start: pickString(medication.start, medication.startDate, medication.start_date),
        category: pickString(medication.category),
      });
      inserted.medications += 1;
    }

    for (const note of asArray(body.notes).map(asObject)) {
      const bodyText = pickString(note.body, note.noteText, note.note_text, note.text);
      if (!bodyText) continue;
      await insertStoredNote(caseId, {
        body: bodyText,
        authorId: pickString(note.authorId, note.providerId),
        authorName: pickString(note.authorName, note.author) || 'Hospital API',
        authorRole: pickString(note.authorRole, note.role) || 'Hospital',
        authorColor: pickString(note.authorColor, note.color) || '4318FF',
      });
      inserted.notes += 1;
    }

    return NextResponse.json(
      {
        success: true,
        caseId,
        case: createdCase,
        inserted,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('[icu:post]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to receive ICU case data' },
      { status: 400 },
    );
  }
}
