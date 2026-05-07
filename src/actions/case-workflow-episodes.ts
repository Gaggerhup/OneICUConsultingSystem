'use server';

import { execute } from '@/database';

let hasEnsuredWorkflowEpisodeTable = false;

async function ensureWorkflowEpisodeTable() {
  if (hasEnsuredWorkflowEpisodeTable) return;

  await execute(`
    CREATE TABLE IF NOT EXISTS case_workflow_episode (
      id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
      case_register_id INT NOT NULL,
      patient_id INT NULL,
      episode_type VARCHAR(32) NOT NULL,
      status VARCHAR(32) NOT NULL,
      action VARCHAR(191) NOT NULL,
      actor_id VARCHAR(191) NULL,
      note TEXT NULL,
      created_at DATETIME(3) NOT NULL,
      INDEX idx_case_workflow_episode_case (case_register_id),
      INDEX idx_case_workflow_episode_patient (patient_id),
      INDEX idx_case_workflow_episode_type (episode_type),
      INDEX idx_case_workflow_episode_status (status)
    )
  `);

  hasEnsuredWorkflowEpisodeTable = true;
}

export async function recordCaseWorkflowEpisode(input: {
  caseId: string;
  patientId?: string | number | null;
  episodeType: 'request' | 'consult';
  status: string;
  action: string;
  actorId?: string | null;
  note?: string | null;
}) {
  const caseRegisterId = Number.parseInt(String(input.caseId).replace(/[^\d]/g, ''), 10);
  if (!Number.isFinite(caseRegisterId)) return null;

  const patientId = input.patientId === null || input.patientId === undefined
    ? null
    : Number.parseInt(String(input.patientId).replace(/[^\d]/g, ''), 10);

  await ensureWorkflowEpisodeTable();
  const result = await execute(`
    INSERT INTO case_workflow_episode (
      case_register_id, patient_id, episode_type, status, action, actor_id, note, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    caseRegisterId,
    Number.isFinite(patientId) ? patientId : null,
    input.episodeType,
    input.status,
    input.action,
    input.actorId || null,
    input.note || null,
    new Date(),
  ]);

  return { id: String(result.insertId) };
}
