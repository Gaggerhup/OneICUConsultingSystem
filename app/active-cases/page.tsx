'use client';
import { useState, useMemo, useRef, useEffect } from 'react';
import {
  ChevronDown,
  AlertCircle,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Activity,
  Filter,
  Search,
  Check
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { useApp } from '@/context/AppContext';
import './style.css';

const URGENCY_LEVELS = [
  { id: 'all', label: 'All Urgency', value: null },
  { id: 'IMMEDIATE', label: 'Immediate Life-threatening', color: '#ef4444' },
  { id: 'EMERGENCY', label: 'Emergency', color: '#ec4899' },
  { id: 'URGENT', label: 'Urgency', color: '#f59e0b' },
  { id: 'SEMI-URGENT', label: 'Semi-urgency', color: '#10b981' },
  { id: 'NON-URGENT', label: 'Non-urgency', color: '#64748b' },
];

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

function ActiveCases() {
  const router = useRouter();
  const navigate = router.push;
  const { activeCases, selectCase, userProfile } = useApp();

  // Filter States
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  const [hospitalFilter, setHospitalFilter] = useState<string>('All Hospitals');
  const [viewFilter, setViewFilter] = useState<'All' | 'Internal' | 'External'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Dropdown UI States
  const [isUrgencyOpen, setIsUrgencyOpen] = useState(false);
  const [isHospitalOpen, setIsHospitalOpen] = useState(false);

  // Refs for closing dropdowns
  const urgencyRef = useRef<HTMLDivElement>(null);
  const hospitalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (urgencyRef.current && !urgencyRef.current.contains(event.target as Node)) setIsUrgencyOpen(false);
      if (hospitalRef.current && !hospitalRef.current.contains(event.target as Node)) setIsHospitalOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRowClick = (id: string) => {
    selectCase(id);
    navigate('/consultation-status');
  };

  const filteredCases = useMemo(() => {
    return activeCases.filter(c => {
      // 1. Urgency Filter
      if (urgencyFilter && c.priority !== urgencyFilter) return false;

      // 2. Hospital Filter
      if (hospitalFilter !== 'All Hospitals' && c.hospital !== hospitalFilter) return false;

      // 3. View Filter (Internal/External)
      if (viewFilter === 'Internal') {
        if (c.hospital !== userProfile.hospital) return false;
      } else if (viewFilter === 'External') {
        if (c.hospital === userProfile.hospital) return false;
      }

      // 4. Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          c.patientName.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.hospital.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [activeCases, urgencyFilter, hospitalFilter, viewFilter, searchQuery, userProfile.hospital]);

  return (
    <Layout>
      <div className="active-cases-wrapper">
        <div className="page-header">
          <div className="header-left">
            <h1>Active Cases</h1>
            <p className="page-subtitle">Monitor and manage high-priority interhospital consultations.</p>
          </div>
          <div className="search-bar-wrap">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="controls-bar">
          <div className="filters-left">
            <span className="filter-label">QUICK FILTERS:</span>

            {/* Urgency Dropdown */}
            <div className="dropdown-wrap" ref={urgencyRef}>
              <button 
                className={`filter-dropdown-btn ${urgencyFilter ? 'active' : ''}`}
                onClick={() => setIsUrgencyOpen(!isUrgencyOpen)}
              >
                <AlertCircle size={16} className={urgencyFilter ? '' : 'text-purple'} />
                {urgencyFilter ? URGENCY_LEVELS.find(u => u.id === urgencyFilter)?.label : 'Urgency'}
                <ChevronDown size={14} className={isUrgencyOpen ? 'rotate-180' : ''} />
              </button>
              {isUrgencyOpen && (
                <div className="custom-dropdown-menu">
                  {URGENCY_LEVELS.map(level => (
                    <button 
                      key={level.id} 
                      className={`dropdown-item ${urgencyFilter === level.id ? 'active' : ''}`}
                      onClick={() => {
                        setUrgencyFilter(level.id === 'all' ? null : level.id);
                        setIsUrgencyOpen(false);
                      }}
                    >
                      <div className="item-content">
                        {level.color && <span className="color-dot" style={{ backgroundColor: level.color }}></span>}
                        {level.label}
                      </div>
                      {urgencyFilter === level.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Hospital Dropdown */}
            <div className="dropdown-wrap" ref={hospitalRef}>
              <button 
                className={`filter-dropdown-btn ${hospitalFilter !== 'All Hospitals' ? 'active' : ''}`}
                onClick={() => setIsHospitalOpen(!isHospitalOpen)}
              >
                <span className="hospital-icon-mini">🏥</span>
                {hospitalFilter === 'All Hospitals' ? 'Primary Hospital' : hospitalFilter}
                <ChevronDown size={14} className={isHospitalOpen ? 'rotate-180' : ''} />
              </button>
              {isHospitalOpen && (
                <div className="custom-dropdown-menu wide">
                  {HOSPITALS.map(h => (
                    <button 
                      key={h} 
                      className={`dropdown-item ${hospitalFilter === h ? 'active' : ''}`}
                      onClick={() => {
                        setHospitalFilter(h);
                        setIsHospitalOpen(false);
                      }}
                    >
                      {h}
                      {hospitalFilter === h && <Check size={14} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-toggles">
            <button 
              className={`toggle-btn ${viewFilter === 'All' ? 'active' : ''}`}
              onClick={() => setViewFilter('All')}
            >
              All Cases
            </button>
            <button 
              className={`toggle-btn ${viewFilter === 'Internal' ? 'active' : ''}`}
              onClick={() => setViewFilter('Internal')}
            >
              Internal
            </button>
            <button 
              className={`toggle-btn ${viewFilter === 'External' ? 'active' : ''}`}
              onClick={() => setViewFilter('External')}
            >
              External
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>CASE ID</th>
                <th>PATIENT NAME</th>
                <th>PRIMARY HOSPITAL</th>
                <th>PRIORITY / URGENCY</th>
                <th>LAST ACTIVITY</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((caseItem) => (
                <tr 
                  key={caseItem.id} 
                  onClick={() => handleRowClick(caseItem.id)}
                  style={{ cursor: 'pointer' }}
                  className="table-row-hover"
                >
                  <td className="case-id-cell">
                    <span className="id-badge">#{caseItem.id}</span>
                  </td>
                  <td>
                    <div className="patient-cell">
                      <span className={`patient-avatar ${
                        caseItem.priority === 'IMMEDIATE' ? 'bg-red' : 
                        caseItem.priority === 'EMERGENCY' ? 'bg-pink' : 
                        caseItem.priority === 'URGENT' ? 'bg-yellow' : 
                        caseItem.priority === 'SEMI-URGENT' ? 'bg-green' : 'bg-gray'
                      }`}>
                        {caseItem.patientName.split(' ').map(n => n[0]).join('')}
                      </span>
                      <span className="font-bold text-dark">{caseItem.patientName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="hospital-cell">
                      {caseItem.hospital}
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge-large ${caseItem.priority.toLowerCase()}`}>
                      {URGENCY_LEVELS.find(u => u.id === caseItem.priority)?.label || caseItem.priority}
                    </span>
                  </td>
                  <td>
                    <div className="activity-cell text-gray">
                      <Clock size={14} className="mr-1"/> {caseItem.lastActiveTime || caseItem.date}
                    </div>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="more-btn"><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
                    <div className="empty-state">
                      <Filter size={40} strokeWidth={1.5} />
                      <p>No matching active cases found.</p>
                      <button 
                        className="reset-filters-btn"
                        onClick={() => {
                          setUrgencyFilter(null);
                          setHospitalFilter('All Hospitals');
                          setViewFilter('All');
                          setSearchQuery('');
                        }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-text">Showing <strong>{filteredCases.length}</strong> of <strong>{activeCases.length}</strong> active cases</span>
          <div className="pagination-controls">
            <button className="page-nav-btn"><ChevronLeft size={16} /></button>
            <button className="page-num-btn active">1</button>
            <button className="page-nav-btn"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ActiveCases;
