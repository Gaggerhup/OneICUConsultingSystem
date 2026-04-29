'use client';

import React from 'react';
import Image from 'next/image';
import {
  Activity,
  AlertTriangle,
  BriefcaseMedical,
  CheckCircle,
  ChevronRight,
  Clock,
  CornerDownRight,
  Download,
  Droplets,
  Eye,
  FileText,
  FlaskConical,
  Heart,
  ImageIcon,
  MessageCircle,
  Minus,
  Paperclip,
  Pill,
  Send,
  ShieldAlert,
  Stethoscope,
  Syringe,
  Thermometer,
  TrendingDown,
  TrendingUp,
  UploadCloud,
  User,
  Wind,
  X,
} from 'lucide-react';
import styles from './style.module.css';
import type {
  FileCategoryFilter,
  FileRecord,
  PatientRecord,
  Tab,
} from './page';
import { cx } from '@/lib/cx';

type NoteItem = {
  id: number;
  author: string;
  role: string;
  body: string;
  time: string;
  color: string;
};

type MessageItem = {
  id: number;
  sender: string;
  text: string;
  time: string;
  isSelf: boolean;
  isSystem: boolean;
};

type TabItem = {
  id: Tab;
  label: string;
  icon: React.ReactNode;
  badge?: string;
};

type UrgencyTone = {
  bg: string;
  text: string;
  label: string;
};

const fileCategoryOptions: Array<{ id: FileCategoryFilter; label: string }> = [
  { id: 'all', label: 'All Files' },
  { id: 'imaging', label: 'Imaging' },
  { id: 'lab', label: 'Lab' },
  { id: 'report', label: 'Report' },
  { id: 'medication', label: 'Medication' },
  { id: 'note', label: 'Note' },
  { id: 'other', label: 'Other' },
];

function getStatusColor(status: string) {
  if (status === 'critical') return '#ef4444';
  if (status === 'high') return '#f97316';
  if (status === 'low') return '#3b82f6';
  return '#10b981';
}

function getStatusLabel(status: string) {
  if (status === 'critical') return '▲ CRITICAL';
  if (status === 'high') return '▲ HIGH';
  if (status === 'low') return '▼ LOW';
  return '✓ Normal';
}

function getTrendIcon(status: string) {
  if (status === 'high' || status === 'critical') return <TrendingUp size={13} />;
  if (status === 'low') return <TrendingDown size={13} />;
  return <Minus size={13} />;
}

function Skel({ h = 16, r = 8 }: { h?: number; r?: number }) {
  return <div className={styles['pd-skel']} style={{ height: h, borderRadius: r }} />;
}

export function PatientHeroSection({
  isLoading,
  record,
  urgency,
}: {
  isLoading: boolean;
  record: PatientRecord | null;
  urgency: UrgencyTone;
}) {
  return (
    <div className={styles['pd-hero']} style={{ borderTopColor: urgency.text }}>
      {isLoading ? (
        <div className={cx(styles, 'pd-hero-body', 'pd-stack-gap-sm')}>
          <Skel h={50} r={14} />
          <Skel h={24} r={8} />
          <Skel h={20} r={6} />
        </div>
      ) : (
        <>
          <div className={styles['pd-hero-body']}>
            <Image
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(record?.name || '??')}&background=4318FF&color=fff&size=72&bold=true`}
              className={styles['pd-hero-avatar']}
              alt=""
              width={72}
              height={72}
              unoptimized
            />
            <div className={styles['pd-hero-info']}>
              <div className={styles['pd-hero-name-row']}>
                <h1>{record?.name || '—'}</h1>
                <span className={styles['pd-urg-badge']} style={{ background: urgency.bg, color: urgency.text }}>
                  {urgency.label}
                </span>
              </div>
              <div className={styles['pd-hero-subrow']}>
                <span>{record?.age}y · {record?.gender} · {record?.bloodType}</span>
                <span className={styles['pd-hero-dot']}>·</span>
                <span className={styles['pd-hero-chip']}><User size={12} />CID: {record?.cid}</span>
                <span className={styles['pd-hero-chip']}><BriefcaseMedical size={12} />HN: {record?.hn}</span>
                <span className={styles['pd-hero-chip']}><FileText size={12} />AN: {record?.an}</span>
              </div>
            </div>
          </div>
          <div className={styles['pd-vitals-row']}>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-red')}><Heart size={14} /><span>{record?.vitals.hr || '—'}</span><small>HR bpm</small></div>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-blue')}><Activity size={14} /><span>{record?.vitals.bp || '—'}</span><small>BP mmHg</small></div>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-orange')}><Thermometer size={14} /><span>{record?.vitals.temp ? `${record.vitals.temp}°C` : '—'}</span><small>Temp</small></div>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-teal')}><Wind size={14} /><span>{record?.vitals.rr || '—'}</span><small>RR /min</small></div>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-green')}><Droplets size={14} /><span>{record?.vitals.spo2 ? `${record.vitals.spo2}%` : '—'}</span><small>SpO₂</small></div>
            <div className={cx(styles, 'pd-vital-pill', 'pd-v-purple')}><BriefcaseMedical size={14} /><span>{record?.vitals.gcs || '—'}</span><small>GCS</small></div>
          </div>
        </>
      )}
    </div>
  );
}

export function PatientSidebar({
  isLoading,
  record,
}: {
  isLoading: boolean;
  record: PatientRecord | null;
}) {
  return (
    <aside className={styles['pd-col-l']}>
      {isLoading ? (
        <div className={cx(styles, 'pd-card', 'pd-card-loading')}>
          {Array.from({ length: 6 }).map((_, i) => <Skel key={i} h={20} r={8} />)}
        </div>
      ) : (
        <>
          <div className={styles['pd-card']}>
            <div className={styles['pd-card-title']}><User size={14} />PATIENT INFO</div>
            <div className={styles['pd-info-grid']}>
              <div className={styles['pd-info-row']}><span>Phone</span><strong>{record?.phone}</strong></div>
              <div className={styles['pd-info-row']}><span>DOB</span><strong>{record?.dob}</strong></div>
              <div className={styles['pd-info-row']}><span>Blood</span><strong>{record?.bloodType}</strong></div>
              <div className={styles['pd-info-row']}><span>District</span><strong>{record?.district}</strong></div>
              <div className={styles['pd-info-row']}><span>Province</span><strong>{record?.province}</strong></div>
            </div>
          </div>

          <div className={styles['pd-card']}>
            <div className={cx(styles, 'pd-card-title', 'pd-allergy-title')}><AlertTriangle size={14} />ALLERGIES</div>
            <div className={styles['pd-allergy-wrap']}>
              {record?.allergies.map((allergy, i) => (
                <span key={i} className={styles['pd-allergy-tag']}>{allergy}</span>
              ))}
            </div>
          </div>

          <div className={styles['pd-card']}>
            <div className={styles['pd-card-title']}><ShieldAlert size={14} />MEDICAL HISTORY</div>
            <div className={styles['pd-conditions-wrap']}>
              {record?.conditions.map((condition, i) => (
                <span key={i} className={styles['pd-cond-tag']}>{condition}</span>
              ))}
            </div>
            <div className={styles['pd-label-spaced']}>
              <div className={styles['pd-label']}>Current Symptoms</div>
              <p className={styles['pd-symp-text']}>{record?.currentSymptoms}</p>
            </div>
            <div className={styles['pd-diag-box']}>
              <div className={styles['pd-diag-label']}>INITIAL DIAGNOSIS</div>
              <div className={styles['pd-diag-value']}>{record?.initialDiagnosis}</div>
            </div>
          </div>

          <div className={styles['pd-card']}>
            <div className={styles['pd-card-title']}><Stethoscope size={14} />CONSULT TEAM</div>
            {record?.team.length === 0 ? (
              <div className={styles['pd-empty-state-sm']}>No team assigned</div>
            ) : (
              <div className={styles['pd-team-list']}>
                {record?.team.map((member, i) => (
                  <div key={i} className={styles['pd-team-member']}>
                    <div className={styles['pd-t-av-wrap']}>
                      <Image
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=${member.color}&color=fff&size=40`}
                        alt=""
                        width={40}
                        height={40}
                        unoptimized
                      />
                      <span className={cx(styles, 'pd-online-dot', member.online ? 'online' : 'offline')} />
                    </div>
                    <div className={styles['pd-t-info']}>
                      <strong>{member.name}</strong>
                      <small>{member.role}</small>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </aside>
  );
}

export function PatientTabContent({
  activeTab,
  setActiveTab,
  tabs,
  isLoading,
  record,
  selectedFileCategory,
  setSelectedFileCategory,
  filteredFiles,
  isUploading,
  openFilePicker,
  openFilePreview,
  downloadFile,
}: {
  activeTab: Tab;
  setActiveTab: React.Dispatch<React.SetStateAction<Tab>>;
  tabs: TabItem[];
  isLoading: boolean;
  record: PatientRecord | null;
  selectedFileCategory: FileCategoryFilter;
  setSelectedFileCategory: React.Dispatch<React.SetStateAction<FileCategoryFilter>>;
  filteredFiles: FileRecord[];
  isUploading: boolean;
  openFilePicker: () => void;
  openFilePreview: (file: FileRecord) => void;
  downloadFile: (file: FileRecord) => void;
}) {
  return (
    <main className={styles['pd-col-c']}>
      <div className={styles['pd-tabs-bar']}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cx(styles, 'pd-tab', activeTab === tab.id && 'active')}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}{tab.label}
            {tab.badge && tab.badge !== '0' && (
              <span className={cx(styles, 'pd-tab-badge', tab.id === 'labs' ? 'pd-badge-labs' : 'pd-badge-default')}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={styles['pd-tab-content']}>
        {isLoading ? (
          <div className={styles['pd-status-block']}>
            <Skel h={180} r={14} />
            <Skel h={120} r={14} />
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <div className={styles['pd-fade-in']}>
                <div className={styles['pd-section-title']}>CLINICAL STATUS</div>
                <div className={styles['pd-status-grid']}>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>Neurological (GCS)</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.gcs}</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>Respiratory</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.rr} /min · SpO₂ {record?.vitals.spo2}%</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>Cardiac</div>
                    <div className={styles['pd-s-value']}>{record?.vitals.hr} bpm · {record?.vitals.bp} mmHg</div>
                  </div>
                  <div className={styles['pd-s-card']}>
                    <div className={styles['pd-s-label']}>Temperature</div>
                    <div className={cx(styles, 'pd-s-value', record && record.vitals.temp > 37.5 && 'text-orange')}>
                      {record?.vitals.temp}°C
                    </div>
                  </div>
                </div>

                {record?.clinicalNotes && (
                  <>
                    <div className={cx(styles, 'pd-section-title', 'pd-summary-title-spaced')}>CLINICAL SUMMARY</div>
                    <div className={styles['pd-clinical-note-box']}>{record.clinicalNotes}</div>
                  </>
                )}

                {record && record.labs.length > 0 && (
                  <>
                    <div className={cx(styles, 'pd-section-title', 'pd-alert-title-spaced')}>CRITICAL ALERTS</div>
                    <div className={styles['pd-alerts-list']}>
                      {record.labs
                        .filter((lab) => lab.status === 'critical' || lab.status === 'high' || lab.status === 'low')
                        .map((lab) => (
                          <div key={lab.name} className={styles['pd-alert-row']} style={{ borderLeftColor: getStatusColor(lab.status) }}>
                            <div className={styles['pd-a-name']}>{lab.name}</div>
                            <div className={styles['pd-a-result']} style={{ color: getStatusColor(lab.status) }}>
                              {lab.result} {lab.unit}
                            </div>
                            <div
                              className={styles['pd-a-status']}
                              style={{ color: getStatusColor(lab.status), background: `${getStatusColor(lab.status)}12` }}
                            >
                              {getStatusLabel(lab.status)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'labs' && (
              <div className={styles['pd-fade-in']}>
                {record && record.labs.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <FlaskConical size={36} strokeWidth={1} />
                    <p>No lab results on file.</p>
                    <small>Results will appear here once processed.</small>
                  </div>
                ) : (
                  <table className={styles['pd-lab-table']}>
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Result</th>
                        <th>Reference</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record?.labs.map((lab) => (
                        <tr key={lab.name} className={lab.status !== 'normal' ? styles['pd-lab-row-alert'] : undefined}>
                          <td><strong>{lab.name}</strong></td>
                          <td style={{ color: getStatusColor(lab.status), fontWeight: 700 }}>
                            {lab.result} <span style={{ fontWeight: 500, color: '#94a3b8', fontSize: '0.7em' }}>{lab.unit}</span>
                          </td>
                          <td className={styles['pd-lab-ref']}>{lab.ref}</td>
                          <td>
                            <span
                              className={styles['pd-lab-status']}
                              style={{ color: getStatusColor(lab.status), background: `${getStatusColor(lab.status)}15` }}
                            >
                              {getTrendIcon(lab.status)} {getStatusLabel(lab.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'medications' && (
              <div className={styles['pd-fade-in']}>
                {record && record.medications.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <Pill size={36} strokeWidth={1} />
                    <p>No medications recorded.</p>
                  </div>
                ) : (
                  <div className={styles['pd-med-list']}>
                    {record?.medications.map((medication, i) => (
                      <div key={i} className={styles['pd-med-card']}>
                        <div className={styles['pd-med-icon']}><Syringe size={18} /></div>
                        <div className={styles['pd-med-info']}>
                          <div className={styles['pd-med-name']}>
                            {medication.name} <span className={styles['pd-med-dose']}>{medication.dose}</span>
                          </div>
                          <div className={styles['pd-med-meta']}>{medication.freq} · via {medication.route}</div>
                          <div className={styles['pd-med-category']}>{medication.category}</div>
                        </div>
                        <div className={styles['pd-med-start']}><Clock size={12} />{medication.start}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'imaging' && (
              <div className={styles['pd-fade-in']}>
                <div className={styles['pd-file-toolbar']}>
                  <div>
                    <div className={cx(styles, 'pd-section-title', 'pd-section-title-compact')}>FILE LIBRARY</div>
                    <div className={styles['pd-file-toolbar-subtitle']}>
                      {record?.files.length || 0} files stored in `case_file`
                    </div>
                  </div>
                  <div className={styles['pd-file-toolbar-actions']}>
                    <button className={styles['pd-file-upload-btn']} onClick={openFilePicker} disabled={isUploading}>
                      <UploadCloud size={14} />
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </button>
                  </div>
                </div>

                <div className={styles['pd-file-filterbar']}>
                  {fileCategoryOptions.map((option) => {
                    const count = option.id === 'all'
                      ? record?.files.length || 0
                      : record?.files.filter((file) => file.category === option.id).length || 0;

                    return (
                      <button
                        key={option.id}
                        className={cx(styles, 'pd-file-filter', selectedFileCategory === option.id && 'active')}
                        onClick={() => setSelectedFileCategory(option.id)}
                      >
                        {option.label}
                        <span>{count}</span>
                      </button>
                    );
                  })}
                </div>

                {record && record.files.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <ImageIcon size={36} strokeWidth={1} />
                    <p>No imaging or attachment files on file.</p>
                    <small>Uploaded studies and reports will appear here.</small>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className={styles['pd-empty-state']}>
                    <ImageIcon size={36} strokeWidth={1} />
                    <p>No files in this category.</p>
                    <small>Try another filter or upload a new file.</small>
                  </div>
                ) : (
                  <div className={styles['pd-imaging-grid']}>
                    {filteredFiles.map((file, i) => {
                      const isImaging = file.category === 'imaging' || file.fileType === 'image' || file.fileType === 'dicom';
                      const previewLabel = file.description || file.fileName;

                      return (
                        <div
                          key={file.id}
                          className={cx(styles, 'pd-img-card', file.fileUrl && 'clickable')}
                          onClick={() => openFilePreview(file)}
                          role={file.fileUrl ? 'button' : undefined}
                          tabIndex={file.fileUrl ? 0 : -1}
                          onKeyDown={(event) => {
                            if (!file.fileUrl) return;
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              openFilePreview(file);
                            }
                          }}
                        >
                          <div className={cx(styles, 'pd-img-preview', `scan-style-${(i % 3) + 1}`)}>
                            <span className={styles['pd-img-label']}>{previewLabel}</span>
                            <span className={styles['pd-img-badge']}>{file.category}{isImaging ? ' · Imaging' : ''}</span>
                          </div>
                          <div className={styles['pd-img-meta']}>
                            <span>{file.fileName}</span>
                            <span>
                              <Clock size={11} /> {file.sizeKb ? `${file.sizeKb} KB` : '—'}
                            </span>
                          </div>
                          <div className={styles['pd-img-foot']}>
                            <span>{file.fileType}</span>
                            <div className={styles['pd-img-actions']}>
                              {file.isPreviewable && file.fileUrl && (
                                <button
                                  type="button"
                                  className={styles['pd-img-action-btn']}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openFilePreview(file);
                                  }}
                                >
                                  <Eye size={12} /> Preview
                                </button>
                              )}
                              {file.fileUrl && (
                                <button
                                  type="button"
                                  className={styles['pd-img-action-btn']}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    downloadFile(file);
                                  }}
                                >
                                  <Download size={12} /> Download
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <button className={styles['pd-img-upload']} type="button" onClick={openFilePicker} disabled={isUploading}>
                      <UploadCloud size={22} />
                      <span>{isUploading ? 'Uploading...' : 'Upload New Study'}</span>
                      <small>DICOM, JPG, PNG, PDF, CSV</small>
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export function PatientActivityPanel({
  activePanel,
  setActivePanel,
  notes,
  messages,
  noteInput,
  setNoteInput,
  chatInput,
  setChatInput,
  chatEndRef,
  handlePostNote,
  handleSendChat,
}: {
  activePanel: 'notes' | 'chat';
  setActivePanel: React.Dispatch<React.SetStateAction<'notes' | 'chat'>>;
  notes: NoteItem[];
  messages: MessageItem[];
  noteInput: string;
  setNoteInput: React.Dispatch<React.SetStateAction<string>>;
  chatInput: string;
  setChatInput: React.Dispatch<React.SetStateAction<string>>;
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  handlePostNote: () => Promise<void>;
  handleSendChat: () => void;
}) {
  return (
    <div className={styles['pd-col-r']}>
      <div className={styles['pd-panel-switcher']}>
        <button className={cx(styles, 'pd-ps-btn', activePanel === 'notes' && 'active')} onClick={() => setActivePanel('notes')}>
          <FileText size={14} /> Consult Notes <span className={styles['pd-ps-count']}>{notes.length}</span>
        </button>
        <button className={cx(styles, 'pd-ps-btn', activePanel === 'chat' && 'active')} onClick={() => setActivePanel('chat')}>
          <MessageCircle size={14} /> Case Chat <span className={styles['pd-ps-count']}>{messages.length}</span>
        </button>
      </div>

      {activePanel === 'notes' && (
        <div className={styles['pd-panel']}>
          <div className={styles['pd-panel-scroll']}>
            {notes.map((note) => (
              <div key={note.id} className={styles['pd-note-card']}>
                <div className={styles['pd-note-header']}>
                  <Image
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(note.author)}&background=${note.color}&color=fff&size=36`}
                    alt=""
                    width={36}
                    height={36}
                    unoptimized
                  />
                  <div>
                    <strong>{note.author}</strong>
                    <small>{note.role}</small>
                  </div>
                  <span className={styles['pd-note-time']}>{note.time}</span>
                </div>
                <p className={styles['pd-note-body']}>{note.body}</p>
              </div>
            ))}
          </div>
          <div className={styles['pd-notes-compose']}>
            <textarea
              placeholder="Write a formal clinical note..."
              value={noteInput}
              onChange={(event) => setNoteInput(event.target.value)}
              rows={3}
            />
            <button className={styles['pd-btn-post']} onClick={handlePostNote} disabled={!noteInput.trim()}>
              <CornerDownRight size={14} /> Post Note
            </button>
          </div>
        </div>
      )}

      {activePanel === 'chat' && (
        <div className={styles['pd-panel']}>
          <div className={styles['pd-panel-scroll']} id="pd-chat-scroll">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cx(styles, 'pd-chat-msg', message.isSystem ? 'system' : message.isSelf ? 'self' : 'other')}
              >
                {!message.isSelf && !message.isSystem && <div className={styles['pd-chat-sender']}>{message.sender}</div>}
                <div className={styles['pd-chat-bubble']}>
                  {message.text}
                  <span className={styles['pd-chat-time']}>{message.time}</span>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className={styles['pd-chat-compose']}>
            <div className={styles['pd-chat-input-row']}>
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendChat();
                  }
                }}
              />
              <button className={styles['pd-chat-send-btn']} onClick={handleSendChat} disabled={!chatInput.trim()}>
                <Send size={16} />
              </button>
            </div>
            <div className={styles['pd-chat-attachments']}>
              <button><Paperclip size={14} /> Attach</button>
              <button><ImageIcon size={14} /> Image</button>
              <div className={styles['pd-online-info']}><span className={styles['pd-track-dot']} /> 3 Online</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function PatientPreviewOverlay({
  previewFile,
  setPreviewFile,
  downloadFile,
}: {
  previewFile: FileRecord | null;
  setPreviewFile: React.Dispatch<React.SetStateAction<FileRecord | null>>;
  downloadFile: (file: FileRecord) => void;
}) {
  if (!previewFile) return null;

  return (
    <div className={styles['pd-overlay']} onClick={() => setPreviewFile(null)}>
      <div className={styles['pd-preview-modal']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-preview-modal-hd']}>
          <div>
            <h2>{previewFile.fileName}</h2>
            <p>{previewFile.description || 'File preview'}</p>
          </div>
          <button className={styles['pd-preview-close']} onClick={() => setPreviewFile(null)} aria-label="Close preview">
            <X size={18} />
          </button>
        </div>

        <div className={styles['pd-preview-stage']}>
          {previewFile.fileType === 'image' && previewFile.fileUrl ? (
            <Image
              src={previewFile.fileUrl}
              alt={previewFile.fileName}
              className={styles['pd-preview-image']}
              width={1200}
              height={800}
              unoptimized
            />
          ) : previewFile.fileType === 'dicom' ? (
            <div className={styles['pd-preview-placeholder']}>
              <ImageIcon size={42} />
              <strong>DICOM study</strong>
              <p>Open this file in a DICOM viewer to inspect the scan.</p>
            </div>
          ) : previewFile.fileType === 'csv' ? (
            <div className={styles['pd-preview-placeholder']}>
              <FileText size={42} />
              <strong>CSV data file</strong>
              <p>Download to inspect the dataset in a spreadsheet.</p>
            </div>
          ) : previewFile.fileUrl ? (
            <iframe title={previewFile.fileName} src={previewFile.fileUrl} className={styles['pd-preview-frame']} />
          ) : (
            <div className={styles['pd-preview-placeholder']}>
              <FileText size={42} />
              <strong>No preview available</strong>
              <p>This file does not have a browsable URL.</p>
            </div>
          )}
        </div>

        <div className={styles['pd-preview-footer']}>
          <div className={styles['pd-preview-meta']}>
            <span><strong>Category:</strong> {previewFile.category}</span>
            <span><strong>Type:</strong> {previewFile.fileType}</span>
            <span><strong>Size:</strong> {previewFile.sizeKb ? `${previewFile.sizeKb} KB` : '—'}</span>
          </div>
          <div className={styles['pd-preview-actions']}>
            {previewFile.fileUrl && (
              <button className={cx(styles, 'pd-preview-btn', 'pd-preview-action-primary')} onClick={() => downloadFile(previewFile)}>
                <Download size={14} /> Download
              </button>
            )}
            <button className={cx(styles, 'pd-preview-btn', 'pd-preview-btn-secondary')} onClick={() => setPreviewFile(null)}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PatientCloseCaseModal({
  showCloseModal,
  setShowCloseModal,
  closeOutcome,
  setCloseOutcome,
  handleClose,
}: {
  showCloseModal: boolean;
  setShowCloseModal: React.Dispatch<React.SetStateAction<boolean>>;
  closeOutcome: 'Discharge' | 'Referred' | 'Dead';
  setCloseOutcome: React.Dispatch<React.SetStateAction<'Discharge' | 'Referred' | 'Dead'>>;
  handleClose: () => void;
}) {
  if (!showCloseModal) return null;

  return (
    <div className={styles['pd-overlay']} onClick={() => setShowCloseModal(false)}>
      <div className={styles['pd-modal']} onClick={(event) => event.stopPropagation()}>
        <div className={styles['pd-modal-hd']}>
          <CheckCircle size={22} color="#10b981" />
          <h2>Close Consultation Case</h2>
          <button onClick={() => setShowCloseModal(false)}><X size={18} /></button>
        </div>
        <p className={styles['pd-modal-sub']}>Select an outcome to finalize this case. This action cannot be undone.</p>
        <div className={styles['pd-outcome-grid']}>
          {(['Discharge', 'Referred', 'Dead'] as const).map((outcome) => {
            const icons: Record<string, React.ReactNode> = {
              Discharge: <CheckCircle size={18} />,
              Referred: <CornerDownRight size={18} />,
              Dead: <X size={18} />,
            };
            const colors: Record<string, string> = {
              Discharge: '#10b981',
              Referred: '#3b82f6',
              Dead: '#64748b',
            };

            return (
              <button
                key={outcome}
                className={cx(styles, 'pd-outcome-btn', closeOutcome === outcome && 'active')}
                style={closeOutcome === outcome ? { borderColor: colors[outcome], background: `${colors[outcome]}10`, color: colors[outcome] } : {}}
                onClick={() => setCloseOutcome(outcome)}
              >
                <span className={styles['pd-outcome-icon']} style={{ color: colors[outcome] }}>{icons[outcome]}</span>
                {outcome}
              </button>
            );
          })}
        </div>
        <div className={styles['pd-modal-ft']}>
          <button className={styles['pd-btn-cancel']} onClick={() => setShowCloseModal(false)}>Cancel</button>
          <button className={styles['pd-btn-confirm']} onClick={handleClose}>Confirm &amp; Close</button>
        </div>
      </div>
    </div>
  );
}
