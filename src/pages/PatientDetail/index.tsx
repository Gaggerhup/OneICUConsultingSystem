import React from 'react';

import { 
  Bell, 
  Search, 
  ArrowLeft,
  ChevronRight,
  Send,
  UploadCloud,
  Edit3,
  CheckCircle,
  Activity,
  Pill,
  ShieldAlert,
  ImageIcon,
  MoreHorizontal,
  ThumbsUp,
  CornerDownRight,
  Bold,
  Italic,
  List,
  AlignLeft,
  Link,
  MessageSquare,
  Info,
  Folder
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import './style.css';

function PatientDetail() {
  const navigate = useNavigate();
  const { selectedCase, closeCase } = useApp();
  const [activeTab, setActiveTab] = React.useState<string>('Vitals & Labs');
  const [activeLabTab, setActiveLabTab] = React.useState<string>('Historical Trends');

  const patientName = selectedCase?.patientName || 'Sarah Jenkins';

  const handleCloseCase = () => {
    if (selectedCase) {
      closeCase(selectedCase.id);
      navigate('/active-cases');
    }
  };

  const tabs = ['Vitals & Labs', 'Consultation Notes', 'Medications', 'Labs', 'Imaging (3)'];

  return (
    <div className="patient-detail-page">
      {/* Top Main Header */}
      <header className="main-header">
        <div className="header-left">
          <div className="header-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9" y="4" width="6" height="16" rx="2" fill="white" fillOpacity="0.9"/>
              <rect x="4" y="9" width="16" height="6" rx="2" fill="white" fillOpacity="0.9"/>
            </svg>
          </div>
          <div className="header-brand">Phitsanulok Med Consultation</div>
          
          <nav className="header-nav">
            <button className="nav-link" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-link active">Active Cases</button>
            <button className="nav-link">Requests</button>
            <button className="nav-link">Specialist</button>
            <button className="nav-link">Archive Cases</button>
          </nav>
        </div>

        <div className="header-right">
          <div className="header-search">
            <Search size={16} className="search-icon" />
            <input type="text" placeholder="Search cases or patients..." />
          </div>
          <button className="header-icon-btn">
            <Bell size={20} />
            <span className="notification-indicator"></span>
          </button>
          <div className="header-profile">
            <span className="avatar">S</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="detail-content-wrapper">
        
        {/* Navigation Breadcrumb */}
        <div className="detail-breadcrumb">
          <button className="back-btn" onClick={() => navigate('/message-specialist')}>
            <ArrowLeft size={16} /> Back to Previous
          </button>
          <div className="breadcrumb-path">
            <ChevronRight size={14} className="b-icon" /> Case #CD-88219
          </div>
        </div>

        {/* Top Overview Card */}
        <div className="patient-overview-card">
          <div className="overview-left">
            <div className="patient-large-avatar">
              <img src="https://ui-avatars.com/api/?name=John+Doe&background=3b82f6&color=fff" alt="John Doe" />
            </div>
            <div className="patient-core-info">
              <div className="name-row">
                <h1>{patientName}</h1>
                <span className="urgent-badge">! URGENT</span>
              </div>
              <p className="demographics-row">
                34 years old • Male • +1 (555) 012-3456
              </p>
              <div className="ids-row">
                <span>HN: 5822-01</span> • <span>AN: 2024-991</span> • <span>CID: 1-1200-0034-XX-X</span>
              </div>
            </div>
          </div>
          
          <div className="overview-actions">
            <button className="action-button primary" onClick={() => navigate('/message-specialist')}>
              <Send size={16} /> Send Message
            </button>
            <button className="action-button secondary-purple">
              <UploadCloud size={16} /> Upload Imaging
            </button>
            <button className="action-button default">
              <Edit3 size={16} /> Update Diagnosis
            </button>
            <button className="action-button dark" onClick={handleCloseCase}>
              <CheckCircle size={16} /> Close Case
            </button>
          </div>
        </div>

        {/* Detailed Layout Grid */}
        <div className="detail-grid">
          
          {/* Left Column (History & Status) */}
          <div className="detail-col-left">
            
            {/* Medical History */}
            <div className="info-card">
              <div className="card-header">
                 <Activity size={18} className="text-purple" />
                 <h2>MEDICAL HISTORY</h2>
              </div>
              <div className="card-body">
                <div className="info-block">
                  <span className="info-label">Pre-existing Conditions</span>
                  <p className="info-value">Type 2 Diabetes, Mild Hypertension</p>
                </div>
                <div className="info-block">
                  <span className="info-label">Allergies</span>
                  <p className="info-value text-red font-semibold">Penicillin, Latex</p>
                </div>
                <div className="info-block">
                  <span className="info-label">Current Symptoms</span>
                  <p className="info-value">Persistent sharp abdominal pain (lower right quadrant), low-grade fever (100.4°F), nausea for 24 hours.</p>
                </div>
                
                <div className="diagnosis-box">
                  <span className="diag-label">INITIAL DIAGNOSIS</span>
                  <p className="diag-value">Acute Appendicitis (Suspected)</p>
                </div>
              </div>
            </div>

            {/* Clinical Status */}
            <div className="info-card">
              <div className="card-header">
                 <Activity size={18} className="text-purple" />
                 <h2>CLINICAL STATUS</h2>
              </div>
              <div className="card-body status-list">
                
                <div className="status-row">
                  <span className="status-label">Neurological (GCS)</span>
                  <span className="status-value highlight">15/15 (E4V5M6)</span>
                </div>
                
                <div className="status-row block-row">
                  <div className="flex-between">
                    <span className="status-label">Respiratory/Airway</span>
                    <span className="stable-badge">STABLE</span>
                  </div>
                  <span className="status-sub">Room Air • SpO2 98% • ET Tube: N/A</span>
                </div>

                <div className="status-row block-row">
                  <div className="flex-between">
                    <span className="status-label">Cardiac (EKG)</span>
                    <span className="status-value">Sinus Rhythm</span>
                  </div>
                  <span className="status-sub">HR: 78 bpm, no ST changes</span>
                </div>

                <div className="status-row">
                  <span className="status-label">Urine Output (I/O)</span>
                  <span className="status-value highlight">0.8 mL/kg/hr</span>
                </div>

              </div>
            </div>

            {/* Consultation Team */}
            <div className="info-card">
              <div className="card-header">
                 <ShieldAlert size={18} className="text-purple" />
                 <h2>CONSULTATION TEAM</h2>
              </div>
              <div className="card-body team-list">
                <div className="team-member">
                  <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="Dr. Sarah Mitchell" />
                  <div className="team-details">
                     <h4>Dr. Sarah Mitchell</h4>
                     <p>General Surgeon • Metro General</p>
                  </div>
                  <div className="status-dot online"></div>
                </div>
                
                <div className="team-member">
                  <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="Dr. James Wilson" />
                  <div className="team-details">
                     <h4>Dr. James Wilson</h4>
                     <p>Radiologist • City Imaging Center</p>
                  </div>
                  <div className="status-dot offline"></div>
                </div>
              </div>
            </div>

          </div>

          {/* Right/Main Column (Tabs & Data) */}
          <div className="detail-col-main">
            
            {/* Tabs Header */}
            <div className="tabs-container">
              {tabs.map(tab => (
                <button 
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="tab-content-area">
              
              {activeTab === 'Vitals & Labs' && (
                <>
                  {/* Vitals Grid */}
                  <div className="vitals-section">
                <div className="section-header-split">
                  <h3 className="sub-section-title">CURRENT VITALS</h3>
                  <h3 className="sub-section-title">RECENT LAB RESULTS</h3>
                </div>
                
                <div className="vitals-grid-split">
                   {/* Vitals Cards */}
                   <div className="vitals-cards-grid">
                     <div className="vital-card">
                       <span className="vital-label">BP (MMHG)</span>
                       <div className="vital-value">118/76</div>
                     </div>
                     <div className="vital-card">
                       <span className="vital-label">HEART RATE</span>
                       <div className="vital-value">78 <span className="unit">bpm</span></div>
                     </div>
                     <div className="vital-card">
                       <span className="vital-label">TEMP (°F)</span>
                       <div className="vital-value text-red">100.4</div>
                     </div>
                     <div className="vital-card">
                       <span className="vital-label">RESPIRATION</span>
                       <div className="vital-value">18 <span className="unit">/min</span></div>
                     </div>
                   </div>

                   {/* Labs Table */}
                   <div className="labs-table-container">
                      <table className="labs-table">
                        <thead>
                          <tr>
                            <th>Test</th>
                            <th>Result</th>
                            <th>Ref</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>WBC Count</td>
                            <td className="text-red font-bold">14.2</td>
                            <td>4.5-11.0</td>
                          </tr>
                          <tr>
                            <td>Hemoglobin</td>
                            <td>13.8</td>
                            <td>13.5-17.5</td>
                          </tr>
                          <tr>
                            <td>Glucose (F)</td>
                            <td>105</td>
                            <td>70-100</td>
                          </tr>
                          <tr>
                            <td>Creatinine</td>
                            <td>0.9</td>
                            <td>0.7-1.3</td>
                          </tr>
                        </tbody>
                      </table>
                   </div>
                </div>
              </div>

              {/* Active Medications */}
              <div className="medications-section">
                <h3 className="sub-section-title">ACTIVE MEDICATIONS</h3>
                <div className="med-grid">
                  <div className="med-card">
                    <Pill size={16} className="text-purple" />
                    <div className="med-details">
                      <h4>Metformin</h4>
                      <p>500mg • BID • Oral</p>
                    </div>
                  </div>
                  <div className="med-card">
                    <Pill size={16} className="text-purple" />
                    <div className="med-details">
                      <h4>Lisinopril</h4>
                      <p>10mg • Daily • Oral</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imaging Previews */}
              <div className="imaging-section">
                <div className="imaging-grid">
                  
                  <div className="imaging-card">
                     <div className="imaging-img-placeholder">
                        <div className="mock-scan-ct"></div>
                     </div>
                     <div className="imaging-label">CT Abdomen_01</div>
                  </div>
                  
                  <div className="imaging-card">
                     <div className="imaging-img-placeholder">
                        <div className="mock-scan-mri"></div>
                     </div>
                     <div className="imaging-label">MRI Pelvis_Axial</div>
                  </div>
                  
                  <div className="imaging-card">
                     <div className="imaging-img-placeholder">
                        <div className="mock-scan-xray"></div>
                     </div>
                     <div className="imaging-label">Chest X-Ray_PA</div>
                  </div>

                  <div className="imaging-action-card">
                     <button className="view-all-studies">View All Studies</button>
                     <div className="add-media-drop">
                       <UploadCloud size={20} className="text-purple mb-1" />
                       <br/> ADD MEDIA
                     </div>
                  </div>
                </div>
              </div>
              </>
              )}

              {activeTab === 'Consultation Notes' && (
                <div className="consultation-notes-section">
                   {/* Add New Note */}
                   <div className="add-note-box">
                      <div className="add-note-header">
                         <MessageSquare size={16} className="text-purple" />
                         <h3>Add New Note</h3>
                      </div>
                      <div className="rich-text-toolbar">
                         <button><Bold size={14}/></button>
                         <button><Italic size={14}/></button>
                         <button><List size={14}/></button>
                         <button><AlignLeft size={14}/></button>
                         <div className="toolbar-divider"></div>
                         <button><Link size={14}/></button>
                         <button><ImageIcon size={14}/></button>
                      </div>
                      <textarea placeholder="Start typing your clinical consultation notes here..." />
                      <div className="add-note-footer">
                         <button className="save-draft-btn">Save Draft</button>
                         <button className="post-note-btn">Post Note</button>
                      </div>
                   </div>

                   {/* Existing Notes */}
                   <div className="notes-list">
                      
                      {/* Note 1 */}
                      <div className="note-card">
                         <div className="note-author-avatar">
                            <img src="https://ui-avatars.com/api/?name=Sarah+Mitchell&background=14b8a6&color=fff" alt="Dr. Sarah Mitchell" />
                         </div>
                         <div className="note-content-wrap">
                            <div className="note-header-info">
                               <div className="note-author-details">
                                  <h4>Dr. Sarah Mitchell</h4>
                                  <span className="author-role">CARDIOLOGY SPECIALIST</span>
                               </div>
                               <div className="note-time">2 hours ago • 14:30 PM</div>
                            </div>
                            <div className="note-body">
                               <p>Patient reports intermittent chest tightness over the past 48 hours. ECG shows slight ST-segment depression in V4-V6. Recommended immediate troponin levels and follow-up echo.</p>
                               <ul className="note-measurements">
                                  <li>Blood Pressure: 145/90 mmHg</li>
                                  <li>Heart Rate: 88 bpm (Regular)</li>
                                  <li>No peripheral edema noted</li>
                               </ul>
                            </div>
                            <div className="note-actions">
                               <button><CornerDownRight size={14} /> Reply</button>
                               <button><ThumbsUp size={14} /> Agree (3)</button>
                            </div>
                         </div>
                      </div>

                      {/* Note 2 */}
                      <div className="note-card">
                         <div className="note-author-avatar">
                            <img src="https://ui-avatars.com/api/?name=James+Wilson&background=0ea5e9&color=fff" alt="Dr. James Wilson" />
                         </div>
                         <div className="note-content-wrap">
                            <div className="note-header-info">
                               <div className="note-author-details">
                                  <h4>Dr. James Wilson</h4>
                                  <span className="author-role">NEUROLOGY RESIDENT</span>
                               </div>
                               <div className="note-time">5 hours ago • 11:15 AM</div>
                            </div>
                            <div className="note-body">
                               <p>Neurological assessment complete. Cranial nerves II-XII intact. Strength 5/5 in all extremities. No focal deficits. Chest pain appears unlikely to be of neurological origin at this time. Will monitor for syncopal episodes.</p>
                            </div>
                            <div className="note-actions">
                               <button><CornerDownRight size={14} /> Reply</button>
                               <button className="text-purple font-semibold"><ThumbsUp size={14} className="fill-purple" /> Agree (1)</button>
                            </div>
                         </div>
                      </div>

                   </div>
                </div>
              )}

              {activeTab === 'Medications' && (
                <div className="medications-tab-content">
                   <h3>Active Medications <span className="active-count-badge">5 Active</span></h3>
                   
                   <table className="meds-table">
                     <thead>
                       <tr>
                         <th>DRUG NAME</th>
                         <th>DOSAGE</th>
                         <th>FREQUENCY</th>
                         <th>ROUTE</th>
                         <th>START DATE</th>
                         <th>ACTIONS</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr>
                         <td className="font-bold text-dark">Atorvastatin</td>
                         <td>20 mg</td>
                         <td>Once daily (Night)</td>
                         <td>Oral</td>
                         <td>12 Oct 2023</td>
                         <td><button className="more-btn"><MoreHorizontal size={16}/></button></td>
                       </tr>
                       <tr>
                         <td className="font-bold text-dark">Lisinopril</td>
                         <td>10 mg</td>
                         <td>Once daily (Morning)</td>
                         <td>Oral</td>
                         <td>05 Nov 2023</td>
                         <td><button className="more-btn"><MoreHorizontal size={16}/></button></td>
                       </tr>
                       <tr>
                         <td className="font-bold text-dark">Metformin</td>
                         <td>500 mg</td>
                         <td>Twice daily (Mealtime)</td>
                         <td>Oral</td>
                         <td>15 Nov 2023</td>
                         <td><button className="more-btn"><MoreHorizontal size={16}/></button></td>
                       </tr>
                     </tbody>
                   </table>

                   <h3 className="section-title mt-8">Medication History</h3>
                   <div className="med-history-timeline">
                      
                      <div className="history-event">
                         <div className="event-dot dot-red"></div>
                         <div className="event-content">
                            <div className="event-header-row">
                               <div className="event-title">Ibuprofen 400mg <span className="badge-red">DISCONTINUED</span></div>
                               <div className="event-date">DATE DISCONTINUED<br/><b>20 Nov 2023</b></div>
                            </div>
                            <div className="event-details">
                               Frequency: PRN (Pain) | Duration: 7 Days
                            </div>
                            <div className="event-note">
                               "Patient reported gastrointestinal discomfort." - Dr. Sarah Jenkins
                            </div>
                         </div>
                      </div>

                      <div className="history-event">
                         <div className="event-dot dot-purple"></div>
                         <div className="event-content">
                            <div className="event-header-row">
                               <div className="event-title">Lisinopril 5mg → 10mg <span className="badge-blue">DOSE CHANGE</span></div>
                               <div className="event-date">DATE ADJUSTED<br/><b>05 Nov 2023</b></div>
                            </div>
                            <div className="event-details">
                               Titration due to persistent hypertension. BP maintained at 130/85 after change.
                            </div>
                         </div>
                      </div>

                      <div className="history-event">
                         <div className="event-dot dot-gray"></div>
                         <div className="event-content">
                            <div className="event-header-row">
                               <div className="event-title">Amoxicillin 500mg <span className="badge-gray">COMPLETED</span></div>
                               <div className="event-date">DATE ENDED<br/><b>12 Oct 2023</b></div>
                            </div>
                            <div className="event-details">
                               Course completed for mild bronchitis. Symptoms resolved.
                            </div>
                         </div>
                      </div>

                   </div>
                </div>
              )}

              {activeTab === 'Labs' && (
                <div className="labs-tab-content">
                  <div className="labs-header-area">
                    <h2>Lab Results</h2>
                    <p>Comprehensive metabolic and hematology panel (Last 24 hours)</p>
                  </div>

                  <div className="lab-sub-tabs">
                    <button 
                      className={`lab-sub-tab ${activeLabTab === 'Recent Labs' ? 'active' : ''}`}
                      onClick={() => setActiveLabTab('Recent Labs')}
                    >Recent Labs</button>
                    <button 
                      className={`lab-sub-tab ${activeLabTab === 'Historical Trends' ? 'active' : ''}`}
                      onClick={() => setActiveLabTab('Historical Trends')}
                    >Historical Trends</button>
                    <button 
                      className={`lab-sub-tab ${activeLabTab === 'Pathology Reports' ? 'active' : ''}`}
                      onClick={() => setActiveLabTab('Pathology Reports')}
                    >Pathology Reports</button>
                  </div>

                  <div className="lab-summary-cards">
                    <div className="lab-sum-card">
                      <span className="sc-label">STATUS</span>
                      <div className="sc-value text-red">● 3 Abnormal Values</div>
                      <p className="sc-desc">Critical review required for Hemoglobin and WBC</p>
                    </div>
                    <div className="lab-sum-card">
                      <span className="sc-label">PANEL TYPE</span>
                      <div className="sc-value flex-center-gap"><Activity size={18} className="text-purple"/> CBC + BMP <ChevronRight size={16} className="text-gray" style={{transform:"rotate(90deg)"}} /></div>
                      <p className="sc-desc">Collected: Today, 06:15 AM</p>
                    </div>
                    <div className="lab-sum-card">
                      <span className="sc-label">LAST UPDATE</span>
                      <div className="sc-value flex-center-gap"><Activity size={18} className="text-gray"/> 22 mins ago <ChevronRight size={16} className="text-gray" style={{transform:"rotate(90deg)"}} /></div>
                      <p className="sc-desc">Verified by Dr. Aris Thorne</p>
                    </div>
                  </div>

                  {activeLabTab === 'Historical Trends' && (
                    <div className="historical-trends-area">
                      <div className="chart-header">
                        <div>
                          <h3>WBC Historical Trends</h3>
                          <p>Unit: 10³/µL | Normal Range: 4.5 - 11.0</p>
                        </div>
                        <div className="time-filters">
                          <button>Last 24h</button>
                          <button className="active">Last 7 Days</button>
                          <button>Last 30 Days</button>
                        </div>
                      </div>

                      <div className="chart-container-mock">
                        <div className="y-axis">
                          <span>16.0</span>
                          <span>12.0</span>
                          <span>8.0</span>
                          <span>4.0</span>
                          <span>0.0</span>
                        </div>
                        <div className="chart-plot-area">
                          <div className="normal-range-band">
                            <span className="band-label">NORMAL RANGE (4.5 - 11.0)</span>
                          </div>
                          
                          <div className="bar-group">
                            <div className="bar safe" style={{height: '45%'}}></div>
                            <span className="x-label">OCT 24</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar safe" style={{height: '35%'}}></div>
                            <span className="x-label">OCT 25</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar safe" style={{height: '25%'}}></div>
                            <span className="x-label">OCT 26</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar safe" style={{height: '20%'}}></div>
                            <span className="x-label">OCT 27</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar safe" style={{height: '30%'}}></div>
                            <span className="x-label">OCT 28</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar danger" style={{height: '65%'}}></div>
                            <span className="x-label font-bold text-dark">OCT 29</span>
                          </div>
                          <div className="bar-group">
                            <div className="bar danger" style={{height: '75%'}}></div>
                            <span className="x-label font-bold text-dark">TODAY</span>
                          </div>

                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeLabTab === 'Recent Labs' && (
                    <div className="latest-panel-table-wrap">
                      <div className="table-top-bar">
                         <h3>Latest Lab Panel<br/>Summary</h3>
                         <span className="ref-info"><Info size={14}/> Reference ranges are lab-specific</span>
                      </div>
                      <table className="detailed-labs-table">
                        <thead>
                          <tr>
                            <th>COMPONENT</th>
                            <th>RESULT</th>
                            <th>REFERENCE RANGE</th>
                            <th>UNITS</th>
                            <th>STATUS</th>
                            <th>TREND</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="font-semibold text-dark">WBC</td>
                            <td className="text-red font-bold">14.2</td>
                            <td>4.5 - 11.0</td>
                            <td>x10³/µL</td>
                            <td><span className="badge-status danger">HIGH</span></td>
                            <td className="text-red">↗</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Hemoglobin</td>
                            <td className="text-red font-bold">11.4</td>
                            <td>13.5 - 17.5</td>
                            <td>g/dL</td>
                            <td><span className="badge-status danger">LOW</span></td>
                            <td className="text-red">↘</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Hematocrit</td>
                            <td className="font-bold">38.2</td>
                            <td>41.0 - 50.0</td>
                            <td>%</td>
                            <td><span className="badge-status normal">NORMAL</span></td>
                            <td className="text-gray">→</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Glucose</td>
                            <td className="text-orange font-bold">126</td>
                            <td>70 - 99</td>
                            <td>mg/dL</td>
                            <td><span className="badge-status warning">HIGH</span></td>
                            <td className="text-orange">↗</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Creatinine</td>
                            <td className="font-bold">0.9</td>
                            <td>0.7 - 1.3</td>
                            <td>mg/dL</td>
                            <td><span className="badge-status normal">NORMAL</span></td>
                            <td className="text-green">↘</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Sodium</td>
                            <td className="font-bold">138</td>
                            <td>135 - 145</td>
                            <td>mEq/L</td>
                            <td><span className="badge-status normal">NORMAL</span></td>
                            <td className="text-gray">→</td>
                          </tr>
                          <tr>
                            <td className="font-semibold text-dark">Potassium</td>
                            <td className="font-bold">4.1</td>
                            <td>3.5 - 5.1</td>
                            <td>mEq/L</td>
                            <td><span className="badge-status normal">NORMAL</span></td>
                            <td className="text-gray">→</td>
                          </tr>
                        </tbody>
                      </table>
                      <button className="view-all-components-btn">VIEW ALL COMPONENTS (24)</button>
                    </div>
                  )}

                </div>
              )}

              {activeTab === 'Imaging (3)' && (
                <div className="imaging-full-tab">
                  <div className="imaging-gallery-header">
                     <div className="igh-left">
                       <Folder size={20} className="text-purple" />
                       <h2>Diagnostic Imaging Gallery</h2>
                     </div>
                     <button className="view-all-studies-link">View All Studies <ChevronRight size={16}/></button>
                  </div>
                  
                  <div className="imaging-gallery-grid">
                    
                    {/* Imaging Card 1 */}
                    <div className="gallery-card">
                       <div className="gallery-img-box mock-scan-ct-large"></div>
                       <div className="gallery-info">
                         <h3>CT Abdomen_01</h3>
                         <p>Oct 24, 2023 • Dr. Aris Thorne</p>
                         <div className="gallery-tags">
                            <span className="g-tag purple">DICOM</span>
                            <span className="g-tag gray">CONTRAST</span>
                         </div>
                       </div>
                    </div>

                    {/* Imaging Card 2 */}
                    <div className="gallery-card">
                       <div className="gallery-img-box mock-scan-mri-large"></div>
                       <div className="gallery-info">
                         <h3>MRI Pelvis_Axial</h3>
                         <p>Oct 22, 2023 • Dr. Sarah Jenkins</p>
                         <div className="gallery-tags">
                            <span className="g-tag purple">MRI</span>
                            <span className="g-tag gray">HIGH RES</span>
                         </div>
                       </div>
                    </div>

                    {/* Imaging Card 3 */}
                    <div className="gallery-card">
                       <div className="gallery-img-box mock-scan-xray-full"></div>
                       <div className="gallery-info">
                         <h3>Chest X-Ray_PA</h3>
                         <p>Oct 20, 2023 • Radiology Dept.</p>
                         <div className="gallery-tags">
                            <span className="g-tag purple">X-RAY</span>
                            <span className="g-tag yellow">REVIEW REQ.</span>
                         </div>
                       </div>
                    </div>
                    
                    {/* Imaging Card 4 */}
                    <div className="gallery-card">
                       <div className="gallery-img-box mock-scan-pathology"></div>
                       <div className="gallery-info">
                         <h3>Histopathology_Sect3</h3>
                         <p>Oct 18, 2023 • Pathology Lab</p>
                         <div className="gallery-tags">
                            <span className="g-tag purple">PATHOLOGY</span>
                         </div>
                       </div>
                    </div>

                    {/* Upload Placeholder */}
                    <div className="gallery-upload-card">
                       <UploadCloud size={32} className="text-purple mb-2" />
                       <h3>Upload New Study</h3>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

      </main>

      <footer className="detail-footer">
        <div className="footer-copyright">
           <ShieldAlert size={14} className="mr-1" /> © 2024 CaseConnect Medical Systems. HIPAA-Compliant Data Encryption.
        </div>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">System Status</a>
          <a href="#">Help Center</a>
        </div>
      </footer>
    </div>
  );
}

export default PatientDetail;
