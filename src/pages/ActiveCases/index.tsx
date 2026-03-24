import {
  ChevronDown,
  AlertCircle,
  Clock,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import './style.css';

function ActiveCases() {
  const navigate = useNavigate();
  const { activeCases, selectCase } = useApp();

  const handleRowClick = (id: string) => {
    selectCase(id);
    navigate('/consultation-status');
  };

  return (
    <Layout>
      <div className="active-cases-wrapper">
        <div className="page-header">
          <h1>Active Cases</h1>
          <p className="page-subtitle">Monitor and manage high-priority interhospital consultations.</p>
        </div>

        <div className="controls-bar">
          <span className="filter-label">QUICK FILTERS:</span>

          <button className="filter-dropdown-btn">
             <AlertCircle size={16} className="text-purple" />
             Urgency
             <ChevronDown size={14} />
          </button>

          <button className="filter-dropdown-btn">
             <span className="hospital-icon-mini">🏥</span>
             Hospital
             <ChevronDown size={14} />
          </button>

          <div className="filter-toggles">
             <button className="toggle-btn active">All Cases</button>
             <button className="toggle-btn">Internal</button>
             <button className="toggle-btn">External</button>
          </div>
        </div>

        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>PATIENT NAME</th>
                <th>SPECIALTY</th>
                <th>CONSULTING DOCTOR</th>
                <th>LAST ACTIVITY</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {activeCases.map((caseItem) => (
                <tr 
                  key={caseItem.id} 
                  onClick={() => handleRowClick(caseItem.id)}
                  style={{ cursor: 'pointer' }}
                  className="table-row-hover"
                >
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
                     <div className="specialty-cell">
                        <span className="icon-container"><Activity size={18} /></span>
                        {caseItem.specialty || 'General'}
                     </div>
                  </td>
                  <td>
                     <div className="doctor-cell">
                        <span className="doc-name font-bold text-dark">Dr. Sarah Smith</span>
                        <span className="doc-hospital">{caseItem.hospital}</span>
                     </div>
                  </td>
                  <td>
                     <div className="activity-cell text-gray">
                        <Clock size={14} className="mr-1"/> {caseItem.date}
                     </div>
                  </td>
                  <td>
                    <span className={`status-pill ${caseItem.status === 'Critical' ? 'pill-red' : 'pill-blue'}`}>
                      <span className={`dot ${caseItem.status === 'Critical' ? 'dot-red' : 'dot-blue'}`}></span>
                      {caseItem.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="more-btn"><MoreVertical size={16}/></button>
                  </td>
                </tr>
              ))}
              {activeCases.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No active cases at the moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination-bar">
          <span className="pagination-text">Showing <strong>{activeCases.length}</strong> of <strong>{activeCases.length}</strong> active cases</span>
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
