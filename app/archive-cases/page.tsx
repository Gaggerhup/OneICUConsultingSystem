'use client';
import {
  Download,
  Filter,
  ChevronDown,
  Search,
  Calendar,
  RefreshCcw,
  FileText,
  FileType
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { StatusPill } from '@/components/ui/case-badges';
import { CasePatientCell, ClickableCaseText } from '@/components/ui/case-patterns';
import { PaginationSummary } from '@/components/ui/pagination-patterns';
import { PageHeader, SearchField, TableEmptyState } from '@/components/ui/page-patterns';
import { getCaseById } from '@/actions/cases';
import { getPatientByCaseId } from '@/actions/patients';
import type { Case } from '@/context/AppContext';
import { useApp } from '@/context/AppContext';
import { useLocale } from '@/context/LocaleContext';
import { NETWORK_HOSPITALS } from '@/constants/hospitals';
import { cx } from '@/lib/cx';
import { filterArchiveCases, type ArchiveDateRange } from '@/lib/case-directory';
import styles from './style.module.css';

type ArchiveExportCase = Case & {
  phoneNumber?: string | null;
  birthDate?: string | null;
};

const ALL_HOSPITALS = '__all_hospitals__';
const ALL_OUTCOMES = '__all_outcomes__';
const DATE_RANGE_CONFIG = {
  all: Infinity,
  days7: 7,
  days30: 30,
  days90: 90,
  months12: 365,
} as const;
type DateRangeKey = keyof typeof DATE_RANGE_CONFIG;

const formatArchiveValue = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0 ? value.join(', ') : '-';
  if (value === null || value === undefined || value === '') return '-';
  return String(value);
};

const createArchiveCaseReport = (caseItem: ArchiveExportCase, t: (key: string) => string) => {
  const lines = [
    t('archiveCases.title'),
    '===================',
    '',
    `Case ID: ${caseItem.id}`,
    `Patient Name: ${caseItem.patientName}`,
    `Hospital: ${caseItem.hospital}`,
    `Status / Outcome: ${caseItem.status}`,
    `Priority: ${caseItem.priority}`,
    `Close Date: ${formatArchiveValue(caseItem.closeDate || caseItem.date)}`,
    `Specialty: ${formatArchiveValue(caseItem.specialty)}`,
    `Reason: ${formatArchiveValue(caseItem.reason)}`,
    '',
    t('archiveCases.patientName'),
    '-------',
    `Age: ${formatArchiveValue(caseItem.age)}`,
    `Gender: ${formatArchiveValue(caseItem.gender)}`,
    `HN: ${formatArchiveValue(caseItem.hn)}`,
    `AN: ${formatArchiveValue(caseItem.an)}`,
    `CID: ${formatArchiveValue(caseItem.cid)}`,
    `Phone: ${formatArchiveValue(caseItem.phone || caseItem.phoneNumber)}`,
    `Date of Birth: ${formatArchiveValue(caseItem.dob || caseItem.birthDate)}`,
    `District: ${formatArchiveValue(caseItem.district)}`,
    `Province: ${formatArchiveValue(caseItem.province)}`,
    `Blood Type: ${formatArchiveValue(caseItem.bloodType)}`,
    `Allergies: ${formatArchiveValue(caseItem.allergies)}`,
    `Conditions: ${formatArchiveValue(caseItem.conditions)}`,
    '',
    t('common.summary'),
    '----------------',
    `Reason: ${formatArchiveValue(caseItem.reason)}`,
    `Current Symptoms: ${formatArchiveValue(caseItem.currentSymptoms)}`,
    `Initial Diagnosis: ${formatArchiveValue(caseItem.initialDiagnosis)}`,
    `Clinical Notes: ${formatArchiveValue(caseItem.clinicalNotes)}`,
    '',
    t('archiveCases.actions'),
    '--------',
    `Type: ${formatArchiveValue(caseItem.type)}`,
    `Last Action: ${formatArchiveValue(caseItem.lastAction)}`,
    `Last Activity: ${formatArchiveValue(caseItem.lastActiveTime)}`,
  ];

  return `${lines.join('\n')}\n`;
};

const createArchiveFilename = (caseItem: Case) => {
  const safeId = caseItem.id.replace(/[^a-z0-9_-]/gi, '-');
  return `archive-case-${safeId}.txt`;
};

const createArchivePdfFilename = (caseItem: Case) => createArchiveFilename(caseItem).replace(/\.txt$/, '.pdf');

const mergeArchiveCaseData = (
  caseItem: Case,
  dbCase?: Partial<ArchiveExportCase> | null,
  patient?: Partial<ArchiveExportCase> | null,
): ArchiveExportCase => ({
  ...caseItem,
  ...dbCase,
  hn: patient?.hn ?? dbCase?.hn ?? caseItem.hn,
  cid: patient?.cid ?? dbCase?.cid ?? caseItem.cid,
  age: patient?.age ?? dbCase?.age ?? caseItem.age,
  gender: patient?.gender ?? dbCase?.gender ?? caseItem.gender,
  bloodType: patient?.bloodType ?? dbCase?.bloodType ?? caseItem.bloodType,
  phone: patient?.phone ?? patient?.phoneNumber ?? dbCase?.phone ?? caseItem.phone,
  phoneNumber: patient?.phoneNumber ?? dbCase?.phoneNumber,
  dob: patient?.dob ?? patient?.birthDate ?? dbCase?.dob ?? caseItem.dob,
  birthDate: patient?.birthDate ?? dbCase?.birthDate,
  district: patient?.district ?? dbCase?.district ?? caseItem.district,
  province: patient?.province ?? dbCase?.province ?? caseItem.province,
  allergies: patient?.allergies ?? dbCase?.allergies ?? caseItem.allergies,
  conditions: patient?.conditions ?? dbCase?.conditions ?? caseItem.conditions,
});

const escapeSvgText = (value: unknown) => formatArchiveValue(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const wrapArchiveText = (value: unknown, maxChars = 64, maxLines = 3) => {
  const text = formatArchiveValue(value).replace(/\s+/g, ' ').trim();
  if (text === '-') return ['-'];

  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    if ((current + word).length > maxChars && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  });

  if (current) lines.push(current.trim());
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) visible[maxLines - 1] = `${visible[maxLines - 1].replace(/\.+$/, '')}...`;
  return visible;
};

const createSvgTextLines = (
  value: unknown,
  x: number,
  y: number,
  options: { maxChars?: number; maxLines?: number; size?: number; color?: string; weight?: number; lineHeight?: number } = {},
) => {
  const { maxChars = 64, maxLines = 3, size = 20, color = '#0f172a', weight = 700, lineHeight = 28 } = options;
  return wrapArchiveText(value, maxChars, maxLines)
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" font-size="${size}" font-weight="${weight}" fill="${color}">${escapeSvgText(line)}</text>`)
    .join('');
};

const createInfoItem = (label: string, value: unknown, x: number, y: number, width = 300) => `
  <g>
    <text x="${x}" y="${y}" font-size="15" font-weight="800" fill="#64748b" letter-spacing="1.2">${escapeSvgText(label.toUpperCase())}</text>
    ${createSvgTextLines(value, x, y + 30, { maxChars: width > 330 ? 42 : 28, maxLines: 2, size: 24, lineHeight: 30 })}
  </g>
`;

const createArchivePdfSvg = (caseItem: ArchiveExportCase, t: (key: string) => string) => {
  const outcomeColor = caseItem.status === 'Dead' ? '#1e293b' : caseItem.status === 'Referred' ? '#2563eb' : '#16a34a';
  const generatedAt = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="1240" height="1754" viewBox="0 0 1240 1754">
      <rect width="1240" height="1754" fill="#f8fafc"/>
      <rect x="0" y="0" width="1240" height="270" fill="#0f766e"/>
      <circle cx="1048" cy="88" r="170" fill="#14b8a6" opacity="0.23"/>
      <circle cx="1165" cy="248" r="118" fill="#38bdf8" opacity="0.18"/>
      <rect x="84" y="72" width="88" height="88" rx="24" fill="#ffffff" opacity="0.96"/>
      <path d="M113 119h30M128 104v30M110 144h36" stroke="#0f766e" stroke-width="10" stroke-linecap="round"/>
      <text x="200" y="108" font-size="28" font-weight="800" fill="#d1fae5" letter-spacing="2">${escapeSvgText(t('archiveCases.title').toUpperCase())}</text>
      ${createSvgTextLines(caseItem.patientName, 200, 162, { maxChars: 34, maxLines: 1, size: 48, color: '#ffffff', lineHeight: 54 })}
      <text x="200" y="214" font-size="24" font-weight="700" fill="#ccfbf1">Case #${escapeSvgText(caseItem.id)} • ${escapeSvgText(caseItem.hospital)}</text>

      <rect x="84" y="316" width="1072" height="214" rx="28" fill="#ffffff" stroke="#e2e8f0"/>
      <rect x="112" y="346" width="14" height="128" rx="7" fill="${outcomeColor}"/>
      ${createInfoItem('Outcome', caseItem.status, 154, 374, 250)}
      ${createInfoItem(t('dashboard.priority'), caseItem.priority, 438, 374, 250)}
      ${createInfoItem(t('archiveCases.closeDate'), caseItem.closeDate || caseItem.date, 720, 374, 310)}
      ${createInfoItem(t('settings.specialty'), caseItem.specialty, 154, 474, 330)}
      ${createInfoItem('Case Type', caseItem.type, 534, 474, 220)}
      <text x="794" y="504" font-size="18" font-weight="700" fill="#64748b">Generated ${escapeSvgText(generatedAt)}</text>

      <rect x="84" y="570" width="1072" height="372" rx="28" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="124" y="634" font-size="26" font-weight="900" fill="#0f172a">${escapeSvgText(t('newRequest.patientInformation'))}</text>
      ${createInfoItem('Age / Gender', `${formatArchiveValue(caseItem.age)} / ${formatArchiveValue(caseItem.gender)}`, 124, 694, 260)}
      ${createInfoItem('HN', caseItem.hn, 424, 694, 220)}
      ${createInfoItem('AN', caseItem.an, 664, 694, 220)}
      ${createInfoItem('CID', caseItem.cid, 904, 694, 210)}
      ${createInfoItem('Phone', caseItem.phone || caseItem.phoneNumber, 124, 812, 260)}
      ${createInfoItem('DOB', caseItem.dob || caseItem.birthDate, 424, 812, 220)}
      ${createInfoItem('Blood Type', caseItem.bloodType, 664, 812, 220)}
      ${createInfoItem('Location', [caseItem.district, caseItem.province].filter(Boolean).join(', '), 904, 812, 210)}
      <text x="124" y="910" font-size="15" font-weight="800" fill="#64748b" letter-spacing="1.2">ALLERGIES / CONDITIONS</text>
      ${createSvgTextLines(`Allergies: ${formatArchiveValue(caseItem.allergies)} | Conditions: ${formatArchiveValue(caseItem.conditions)}`, 124, 936, { maxChars: 92, maxLines: 1, size: 20, lineHeight: 26 })}

      <rect x="84" y="982" width="1072" height="452" rx="28" fill="#ffffff" stroke="#e2e8f0"/>
      <text x="124" y="1046" font-size="26" font-weight="900" fill="#0f172a">${escapeSvgText(t('common.summary'))}</text>
      <text x="124" y="1108" font-size="15" font-weight="800" fill="#64748b" letter-spacing="1.2">REASON</text>
      ${createSvgTextLines(caseItem.reason, 124, 1142, { maxChars: 82, maxLines: 2, size: 22, lineHeight: 30 })}
      <text x="124" y="1234" font-size="15" font-weight="800" fill="#64748b" letter-spacing="1.2">CURRENT SYMPTOMS</text>
      ${createSvgTextLines(caseItem.currentSymptoms, 124, 1268, { maxChars: 82, maxLines: 2, size: 22, lineHeight: 30 })}
      <text x="124" y="1360" font-size="15" font-weight="800" fill="#64748b" letter-spacing="1.2">DIAGNOSIS / CLINICAL NOTES</text>
      ${createSvgTextLines(`Diagnosis: ${formatArchiveValue(caseItem.initialDiagnosis)} | Notes: ${formatArchiveValue(caseItem.clinicalNotes)}`, 124, 1394, { maxChars: 82, maxLines: 2, size: 22, lineHeight: 30 })}

      <rect x="84" y="1474" width="1072" height="144" rx="28" fill="#ecfeff" stroke="#bae6fd"/>
      <text x="124" y="1534" font-size="24" font-weight="900" fill="#0f172a">${escapeSvgText(t('archiveCases.actions'))}</text>
      ${createInfoItem('Last Action', caseItem.lastAction, 124, 1582, 360)}
      ${createInfoItem('Last Activity', caseItem.lastActiveTime, 534, 1582, 360)}
      <text x="84" y="1688" font-size="18" font-weight="700" fill="#94a3b8">Phitsanulok Med Consultation • Confidential archive export</text>
    </svg>
  `;
};

const createArchivePdfBlob = async (caseItem: ArchiveExportCase, t: (key: string) => string) => {
  const svg = createArchivePdfSvg(caseItem, t);
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = window.URL.createObjectURL(svgBlob);

  try {
    const image = new Image();
    image.decoding = 'async';
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Unable to render archive PDF template.'));
    });
    image.src = svgUrl;
    await loaded;

    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Unable to create PDF canvas.');
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    const jpegData = canvas.toDataURL('image/jpeg', 0.94).split(',')[1];
    const imageBytes = Uint8Array.from(window.atob(jpegData), (char) => char.charCodeAt(0));
    const encoder = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let byteLength = 0;
    const pushText = (text: string) => {
      const bytes = encoder.encode(text);
      chunks.push(bytes);
      byteLength += bytes.length;
    };
    const pushBytes = (bytes: Uint8Array) => {
      chunks.push(bytes);
      byteLength += bytes.length;
    };
    const addObject = (id: number, body: string | Uint8Array, options?: { prefix?: string; suffix?: string }) => {
      offsets[id] = byteLength;
      pushText(`${id} 0 obj\n`);
      if (options?.prefix) pushText(options.prefix);
      if (typeof body === 'string') pushText(body);
      else pushBytes(body);
      if (options?.suffix) pushText(options.suffix);
      pushText('\nendobj\n');
    };

    pushText('%PDF-1.4\n');
    addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
    addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    addObject(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    addObject(4, imageBytes, {
      prefix: `<< /Type /XObject /Subtype /Image /Width 1240 /Height 1754 /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`,
      suffix: '\nendstream',
    });
    const content = 'q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ';
    addObject(5, content, {
      prefix: `<< /Length ${encoder.encode(content).length} >>\nstream\n`,
      suffix: '\nendstream',
    });

    const xrefOffset = byteLength;
    pushText('xref\n0 6\n0000000000 65535 f \n');
    for (let id = 1; id <= 5; id += 1) {
      pushText(`${String(offsets[id]).padStart(10, '0')} 00000 n \n`);
    }
    pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

    const pdfBytes = new Uint8Array(byteLength);
    let position = 0;
    chunks.forEach((chunk) => {
      pdfBytes.set(chunk, position);
      position += chunk.length;
    });
    return new Blob([pdfBytes], { type: 'application/pdf' });
  } finally {
    window.URL.revokeObjectURL(svgUrl);
  }
};

function ArchiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { archiveCases, reactivateCase, selectCase, showToast } = useApp();
  const { t } = useLocale();
  const DATE_RANGES: Array<ArchiveDateRange & { key: DateRangeKey }> = [
    { key: 'all', label: t('archiveCases.allTime'), days: DATE_RANGE_CONFIG.all },
    { key: 'days7', label: t('archiveCases.last7Days'), days: DATE_RANGE_CONFIG.days7 },
    { key: 'days30', label: t('archiveCases.last30Days'), days: DATE_RANGE_CONFIG.days30 },
    { key: 'days90', label: t('archiveCases.last90Days'), days: DATE_RANGE_CONFIG.days90 },
    { key: 'months12', label: t('archiveCases.last12Months'), days: DATE_RANGE_CONFIG.months12 },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState(ALL_HOSPITALS);
  const [outcomeFilter, setOutcomeFilter] = useState(ALL_OUTCOMES);
  const [dateRangeKey, setDateRangeKey] = useState<DateRangeKey>('days30');
  const [currentTime] = useState(() => Date.now());
  const [openDownloadMenu, setOpenDownloadMenu] = useState<string | null>(null);
  const dateRange = DATE_RANGES.find((range) => range.key === dateRangeKey) ?? DATE_RANGES[2];

  const openCaseDetail = (caseId: string) => {
    selectCase(caseId);
    navigate(`/patient-detail?caseId=${encodeURIComponent(caseId)}`);
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    if (typeof window === 'undefined') return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => window.URL.revokeObjectURL(url), 0);
  };

  const loadArchiveExportCase = async (caseItem: Case) => {
    const [dbCase, patient] = await Promise.all([
      getCaseById(caseItem.id).catch((error) => {
        console.error('[ArchiveCases] Case detail lookup failed:', error);
        return null;
      }),
      getPatientByCaseId(caseItem.id).catch((error) => {
        console.error('[ArchiveCases] Patient detail lookup failed:', error);
        return null;
      }),
    ]);

    return mergeArchiveCaseData(caseItem, dbCase as Partial<ArchiveExportCase> | null, patient as Partial<ArchiveExportCase> | null);
  };

  const downloadArchiveRecord = async (caseItem: Case, format: 'txt' | 'pdf') => {
    try {
      setOpenDownloadMenu(null);
      const exportCase = await loadArchiveExportCase(caseItem);

      if (format === 'txt') {
        const file = new Blob([createArchiveCaseReport(exportCase, t)], { type: 'text/plain;charset=utf-8' });
        downloadBlob(file, createArchiveFilename(exportCase));
        showToast(t('archiveCases.downloadTxtStarted'), 'success');
        return;
      }

      const file = await createArchivePdfBlob(exportCase, t);
      downloadBlob(file, createArchivePdfFilename(exportCase));
      showToast(t('archiveCases.downloadPdfStarted'), 'success');
    } catch (error) {
      console.error('[ArchiveCases] Download failed:', error);
      showToast(t('archiveCases.downloadFailed'), 'error');
    }
  };

  const filteredCases = useMemo(() => {
    return filterArchiveCases(archiveCases, {
      searchQuery,
      hospitalFilter: hospitalFilter === ALL_HOSPITALS ? null : hospitalFilter,
      outcomeFilter: outcomeFilter === ALL_OUTCOMES ? null : outcomeFilter,
      dateRange,
      currentTime,
    });
  }, [archiveCases, searchQuery, hospitalFilter, outcomeFilter, dateRange, currentTime]);

  return (
    <Layout>
      <div className={styles['archive-page-wrapper']}>
        <PageHeader
          title={t('archiveCases.title')}
          subtitle={t('archiveCases.subtitle')}
          wrapperClassName={styles['page-header-split']}
          subtitleClassName={styles['page-subtitle']}
          rightContent={(
            <SearchField
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder={t('archiveCases.searchPlaceholder')}
              wrapperClassName={styles['search-bar-wrap-archive']}
              iconClassName={styles['search-icon']}
            />
          )}
        />

        <div className={styles['advanced-filters-box']}>
          <div className={styles['filter-row']}>
            <span className={styles['filter-label']}><Filter size={14}/> {t('archiveCases.filters')}</span>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={hospitalFilter} onChange={(e) => setHospitalFilter(e.target.value)}>
                <option value={ALL_HOSPITALS}>{t('common.allHospitals')}</option>
                {NETWORK_HOSPITALS.map((hospital) => <option key={hospital} value={hospital}>{hospital}</option>)}
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={styles['filter-select-wrapper']}>
              <select className={styles['filter-select']} value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)}>
                <option value={ALL_OUTCOMES}>{t('common.allOutcomes')}</option>
                <option value="Discharge">{t('archiveCases.discharge')}</option>
                <option value="Referred">{t('archiveCases.referred')}</option>
                <option value="Dead">{t('archiveCases.dead')}</option>
              </select>
              <ChevronDown size={14} className={styles['select-icon']} />
            </div>

            <div className={`${styles['filter-select-wrapper']} ${styles['date-select']}`}>
              <Calendar size={14} className={cx(styles, 'mr-2', 'text-gray')} />
              <select
                className={`${styles['filter-select']} ${styles['auto-width']}`}
                value={dateRangeKey}
                onChange={(e) => setDateRangeKey(e.target.value as DateRangeKey)}
              >
                {DATE_RANGES.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>

            <button
              className={styles['clear-filters-btn']}
              onClick={() => {
                setSearchQuery('');
                setHospitalFilter(ALL_HOSPITALS);
                setOutcomeFilter(ALL_OUTCOMES);
                setDateRangeKey('all');
              }}
            >
              {t('archiveCases.clearAll')}
            </button>
          </div>
        </div>

        <div className={styles['table-container']}>
          <table className={`${styles['data-table']} ${styles['archive-table']}`}>
            <thead>
              <tr>
                <th>{t('archiveCases.caseId')}</th>
                <th>{t('archiveCases.patientName')}</th>
                <th>{t('archiveCases.hospital')}</th>
                <th>{t('archiveCases.closeDate')}</th>
                <th>{t('archiveCases.statusOutcome')}</th>
                <th>{t('archiveCases.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className={cx(styles, 'case-id', 'text-gray', 'font-medium')} data-label={t('archiveCases.caseId')}>#{c.id}</td>
                  <td data-label={t('archiveCases.patientName')}>
                    <CasePatientCell
                      wrapperClassName={styles['patient-stack']}
                      title={c.patientName}
                      titleClassName={cx(styles, 'font-bold', 'text-dark')}
                      meta={`${c.age}${c.gender?.charAt(0)} • ${c.priority}`}
                      metaClassName={styles['demographics-sub']}
                      onOpen={() => openCaseDetail(c.id)}
                    />
                  </td>
                  <td className={styles['text-gray']} data-label={t('archiveCases.hospital')}>
                    <ClickableCaseText onOpen={() => openCaseDetail(c.id)}>
                      {c.hospital}
                    </ClickableCaseText>
                  </td>
                  <td className={styles['text-gray']} data-label={t('archiveCases.closeDate')}>{c.closeDate || c.date}</td>
                  <td data-label={t('archiveCases.statusOutcome')}>
                    <StatusPill
                      value={c.status}
                      className={`${styles['status-pill']} ${styles[`status-${c.status.toLowerCase()}`]}`}
                    />
                  </td>
                  <td data-label={t('archiveCases.actions')}>
                    <div className={styles['archive-actions']}>
                      <div className={styles['download-menu-wrap']}>
                        <button
                          type="button"
                          className={styles['action-link-btn']}
                          title={t('archiveCases.downloadRecord')}
                          aria-label={`${t('archiveCases.downloadRecord')} ${c.id}`}
                          aria-expanded={openDownloadMenu === c.id}
                          onClick={() => setOpenDownloadMenu((current) => (current === c.id ? null : c.id))}
                        >
                          <Download size={16} />
                        </button>
                        {openDownloadMenu === c.id && (
                          <div className={styles['download-menu']} role="menu" aria-label={`${t('archiveCases.downloadRecord')} ${c.id}`}>
                            <button type="button" role="menuitem" onClick={() => void downloadArchiveRecord(c, 'txt')}>
                              <FileText size={15} />
                              <span>{t('archiveCases.downloadTxt')}</span>
                            </button>
                            <button type="button" role="menuitem" onClick={() => void downloadArchiveRecord(c, 'pdf')}>
                              <FileType size={15} />
                              <span>{t('archiveCases.downloadPdf')}</span>
                            </button>
                          </div>
                        )}
                      </div>
                      <button type="button" className={styles['reactivate-btn']} onClick={() => reactivateCase(c.id)} title={t('archiveCases.reactivate')}>
                        <RefreshCcw size={16} /> {t('archiveCases.reactivate')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <TableEmptyState
                  colSpan={6}
                  cellClassName={styles['empty-cell']}
                  contentClassName={styles['empty-state']}
                  icon={<Filter size={40} strokeWidth={1.5} />}
                  message={t('archiveCases.noResults')}
                />
              )}
            </tbody>
          </table>
        </div>

        <PaginationSummary
          wrapperClassName={styles['pagination-bar']}
          textClassName={styles['pagination-text']}
        >
          {t('archiveCases.showing')} <strong>{filteredCases.length}</strong> of <strong>{archiveCases.length}</strong> {t('archiveCases.records')}
        </PaginationSummary>
      </div>
    </Layout>
  );
}

export default ArchiveCases;
