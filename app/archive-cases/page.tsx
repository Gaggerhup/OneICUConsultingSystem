'use client';
import { 
  Download,
  FileSpreadsheet,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Search,
  Calendar
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useApp, type Case } from '@/context/AppContext';
import './style.css';

const HOSPITALS = [
  'All Hospitals',
  'โรงพยาบาลพุทธชินราช พิษณุโลก',
  'โรงพยาบาลวังทอง',
  'โรงพยาบาลวัดโบสถ์',
  'โรงพยาบาลพรหมพิราม',
  'โรงพยาบาลบางระกำ',
  'โรงพยาบาลบางกระทุ่ม',
  'โรงพยาบาลเนินมะปราง',
  'โรงพยาบาลสมเด็จพระยุพราชนครไทย',
  'โรงพยาบาลชาติตระการ'
];

const DATE_RANGES = [
  { label: 'All Time', days: Infinity },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'Last 12 Months', days: 365 },
];

const OUTCOMES = ['All Outcomes', 'Discharge', 'Referred', 'Dead'];

function ArchiveCases() {
  const { archiveCases, reactivateCase } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [hospitalFilter, setHospitalFilter] = useState('All Hospitals');
  const [outcomeFilter, setOutcomeFilter] = useState('All Outcomes');
  const [dateRange, setDateRange] = useState(DATE_RANGES[2]); // Default 30 Days

  const filteredCases = useMemo(() => {
    return archiveCases.filter(c => {
      // 1. Search Filter
      const matchesSearch = searchQuery === '' || 
        c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Hospital Filter
      const matchesHospital = hospitalFilter === 'All Hospitals' || c.hospital === hospitalFilter;
      
      // 3. Outcome Filter
      const matchesOutcome = outcomeFilter === 'All Outcomes' || c.status === outcomeFilter;
      
      // 4. Date Range Filter
      let matchesDate = true;
      if (dateRange.days !== Infinity && c.closedTimestamp) {
        const diffDays = (Date.now() - c.closedTimestamp) / (1000 * 60 * 60 * 24);
        matchesDate = diffDays <= dateRange.days;
      }

      return matchesSearch && matchesHospital && matchesOutcome && matchesDate;
    });
  }, [archiveCases, searchQuery, hospitalFilter, outcomeFilter, dateRange]);

  return (
    <Layout>
      <div className="archive-page-wrapper">
          <div className="page-header-split">
            <div>
               <h1>Archive Cases</h1>
               <p className="page-subtitle">Review and manage historical interhospital consultation records.</p>
            </div>
            <div className="search-bar-wrap-archive">
               <Search size={18} className="search-icon" />
               <input 
                 type="text" 
                 placeholder="Search by ID or Name..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
          </div>

          <div className="advanced-filters-box">
             <div className="filter-row">
                <span className="filter-label"><Filter size={14}/> FILTERS</span>
                
                <div className="filter-select-wrapper">
                   <select 
                     className="filter-select"
                     value={hospitalFilter}
                     onChange={(e) => setHospitalFilter(e.target.value)}
                   >
                      {HOSPITALS.map(h => <option key={h}>{h}</option>)}
                   </select>
                   <ChevronDown size={14} className="select-icon" />
                </div>
                
                <div className="filter-select-wrapper">
                   <select 
                     className="filter-select"
                     value={outcomeFilter}
                     onChange={(e) => setOutcomeFilter(e.target.value)}
                   >
                      {OUTCOMES.map(o => <option key={o}>{o}</option>)}
                   </select>
                   <ChevronDown size={14} className="select-icon" />
                </div>
                
                <div className="filter-select-wrapper date-select">
                   <Calendar size={14} className="mr-2 text-gray" />
                   <select 
                     className="filter-select auto-width"
                     value={dateRange.label}
                     onChange={(e) => {
                       const range = DATE_RANGES.find(r => r.label === e.target.value);
                       if (range) setDateRange(range);
                     }}
                   >
                      {DATE_RANGES.map(r => <option key={r.label}>{r.label}</option>)}
                   </select>
                </div>

                <button 
                  className="clear-filters-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setHospitalFilter('All Hospitals');
                    setOutcomeFilter('All Outcomes');
                    setDateRange(DATE_RANGES[0]);
                  }}
                >
                  Clear All
                </button>
             </div>
          </div>

          <div className="table-container">
            <table className="data-table archive-table">
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>PATIENT NAME</th>
                  <th>HOSPITAL</th>
                  <th>CLOSE DATE</th>
                  <th>STATUS / OUTCOME</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr key={c.id}>
                    <td className="case-id text-gray font-medium">#{c.id}</td>
                    <td>
                       <div className="patient-stack">
                          <span className="font-bold text-dark">{c.patientName}</span>
                          <span className="demographics-sub">{c.age}{c.gender?.charAt(0)} • {c.priority}</span>
                       </div>
                    </td>
                    <td className="text-gray">{c.hospital}</td>
                    <td className="text-gray">{c.closeDate || c.date}</td>
                    <td>
                      <span className={`status-pill status-${c.status.toLowerCase()}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="archive-actions">
                        <button className="action-link-btn" title="View Record">
                           <Download size={16} />
                        </button>
                        <button 
                          className="reactivate-btn" 
                          onClick={() => reactivateCase(c.id)}
                          title="Reactivate Case"
                        >
                           <RefreshCcw size={16} /> Reactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                      <div className="empty-state">
                        <Filter size={40} strokeWidth={1.5} />
                        <p>No archived records found matching those filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <span className="pagination-text">Showing <strong>{filteredCases.length}</strong> of <strong>{archiveCases.length}</strong> records</span>
          </div>
      </div>
    </Layout>
  );
}

export default ArchiveCases;
