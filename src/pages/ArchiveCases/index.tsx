import { 
  Download,
  FileSpreadsheet,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import './style.css';

function ArchiveCases() {
  const { archiveCases } = useApp();

  return (
    <Layout>
      <div className="archive-page-wrapper">
          <div className="page-header-split">
            <div>
               <h1>Archive Cases</h1>
               <p className="page-subtitle">Review and manage historical interhospital consultation records.</p>
            </div>
            <div className="export-actions">
               <button className="btn-export-csv"><Download size={16} /> Export CSV</button>
               <button className="btn-export-summary"><FileSpreadsheet size={16} /> Export Summary Report</button>
            </div>
          </div>

          <div className="advanced-filters-box">
             <div className="filter-row">
                <span className="filter-label"><Filter size={14}/> FILTERS</span>
                
                <div className="filter-select-wrapper">
                   <select className="filter-select">
                      <option>All Specialties</option>
                      <option>Cardiology</option>
                      <option>Neurology</option>
                      <option>Oncology</option>
                   </select>
                   <ChevronDown size={14} className="select-icon" />
                </div>
                
                <div className="filter-select-wrapper">
                   <select className="filter-select">
                      <option>All Hospitals</option>
                      <option>City General</option>
                      <option>St. Jude Medical</option>
                   </select>
                   <ChevronDown size={14} className="select-icon" />
                </div>
                
                <div className="filter-select-wrapper date-select">
                   <span className="mr-2 text-gray">📅</span>
                   <select className="filter-select auto-width">
                      <option>Last 12 Months</option>
                      <option>Last 6 Months</option>
                      <option>Last 30 Days</option>
                   </select>
                </div>
             </div>
             
             <div className="filter-row no-border">
                <div className="filter-select-wrapper">
                   <select className="filter-select">
                      <option>All Outcomes</option>
                      <option>Completed</option>
                      <option>Discharged</option>
                   </select>
                   <ChevronDown size={14} className="select-icon" />
                </div>
                
                <button className="clear-filters-btn">Clear All</button>
             </div>
          </div>

          <div className="table-container">
            <table className="data-table archive-table">
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>PATIENT NAME</th>
                  <th>HOSPITAL</th>
                  <th>SPECIALIST</th>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {/* Row 1 */}
                <tr>
                  <td className="case-id text-gray font-medium">#9842</td>
                  <td>
                     <div className="patient-stack">
                        <span className="font-bold text-dark">John Doe</span>
                        <span className="demographics-sub">45M • O+ Positive</span>
                     </div>
                  </td>
                  <td className="text-gray">City General</td>
                  <td className="text-gray">Dr. Smith</td>
                  <td className="text-gray">Oct 12, 2023</td>
                  <td><span className="status-pill status-completed">Completed</span></td>
                  <td>
                    <button className="action-link-btn">
                       <strong>View Record</strong> <Download size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>

                {/* Row 2 */}
                <tr>
                  <td className="case-id text-gray font-medium">#9831</td>
                  <td>
                     <div className="patient-stack">
                        <span className="font-bold text-dark">Jane Smith</span>
                        <span className="demographics-sub">32F • B- Negative</span>
                     </div>
                  </td>
                  <td className="text-gray">St. Jude Medical</td>
                  <td className="text-gray">Dr. Adams</td>
                  <td className="text-gray">Oct 10, 2023</td>
                  <td><span className="status-pill status-discharged">Discharged</span></td>
                  <td>
                    <button className="action-link-btn">
                       <strong>View Record</strong> <Download size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>

                {/* Row 3 */}
                <tr>
                  <td className="case-id text-gray font-medium">#9755</td>
                  <td>
                     <div className="patient-stack">
                        <span className="font-bold text-dark">Robert Brown</span>
                        <span className="demographics-sub">60M • A+ Positive</span>
                     </div>
                  </td>
                  <td className="text-gray">County Medical</td>
                  <td className="text-gray">Dr. Lee</td>
                  <td className="text-gray">Sep 28, 2023</td>
                  <td><span className="status-pill status-transferred">Transferred</span></td>
                  <td>
                    <button className="action-link-btn">
                       <strong>View Record</strong> <Download size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>

                {/* Row 4 */}
                <tr>
                  <td className="case-id text-gray font-medium">#9642</td>
                  <td>
                     <div className="patient-stack">
                        <span className="font-bold text-dark">Emily Davis</span>
                        <span className="demographics-sub">28F • AB- Negative</span>
                     </div>
                  </td>
                  <td className="text-gray">Memorial Hospital</td>
                  <td className="text-gray">Dr. White</td>
                  <td className="text-gray">Sep 15, 2023</td>
                  <td><span className="status-pill status-completed">Completed</span></td>
                  <td>
                    <button className="action-link-btn">
                       <strong>View Record</strong> <Download size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>
                
                {/* Row 5 */}
                <tr>
                  <td className="case-id text-gray font-medium">#9521</td>
                  <td>
                     <div className="patient-stack">
                        <span className="font-bold text-dark">Michael Wilson</span>
                        <span className="demographics-sub">52M • O+ Positive</span>
                     </div>
                  </td>
                  <td className="text-gray">St. Jude Medical</td>
                  <td className="text-gray">Dr. Taylor</td>
                  <td className="text-gray">Sep 01, 2023</td>
                  <td><span className="status-pill status-referred">Referred</span></td>
                  <td>
                    <button className="action-link-btn">
                       <strong>View Record</strong> <Download size={14} className="ml-1" />
                    </button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="pagination-bar">
            <span className="pagination-text">Showing <strong>1</strong> to <strong>5</strong> of <strong>1,248</strong> records</span>
            <div className="pagination-controls">
              <button className="page-nav-btn"><ChevronLeft size={16} /></button>
              <button className="page-num-btn active">1</button>
              <button className="page-num-btn">2</button>
              <button className="page-num-btn">3</button>
              <span className="page-dots">...</span>
              <button className="page-num-btn">125</button>
              <button className="page-nav-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
      </div>
    </Layout>
  );
}

export default ArchiveCases;
