import { useState } from 'react';
import { 
  MoreVertical,
  Activity,
  History,
  AlertCircle,
  ClipboardList,
  UserCheck,
  RefreshCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import './style.css';

function Dashboard() {
  const navigate = useNavigate();
  const { activeCases, requests, specialists, activities, refreshActivities } = useApp();
  const [showActivityMenu, setShowActivityMenu] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshFeed = () => {
    setIsRefreshing(true);
    // Simulate a network delay
    setTimeout(() => {
      refreshActivities();
      setIsRefreshing(false);
      setShowActivityMenu(false);
    }, 800);
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length;
  const onlineSpecialists = specialists.filter(s => s.status === 'online' && s.role === 'Specialist').length;
  const onlineConsultants = specialists.filter(s => s.status === 'online' && s.role === 'Consultant').length;
  const totalOnline = onlineSpecialists + onlineConsultants;

  return (
    <Layout>
      <div className="dashboard-content-wrapper">
        <div className="dashboard-header">
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back, Dr. Smith. Here is what's happening today.</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid fade-in-float" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">ACTIVE CONSULTATIONS</span>
              <div className="stat-icon blue">
                <Activity size={18} />
              </div>
            </div>
            <div className="stat-body">
              <div className="stat-value">
                {totalOnline.toString().padStart(2, '0')} <span className="stat-trend positive">ONLINE</span>
              </div>
              <div className="stat-desc">Specialists + Consultants</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">PENDING REQUESTS</span>
              <div className="stat-icon yellow">
                <History size={18} />
              </div>
            </div>
            <div className="stat-body">
              <div className="stat-value">
                {pendingRequestsCount.toString().padStart(2, '0')} <span className="stat-trend negative">-5%</span>
              </div>
              <div className="stat-desc">Requires immediate attention</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-header">
              <span className="stat-title">ONLINE SPECIALIST/CONSULTANT</span>
              <div className="stat-icon green">
                <UserCheck size={18} />
              </div>
            </div>
            <div className="stat-body">
              <div className="stat-value">
                {totalOnline.toString().padStart(2, '0')} <span className="stat-trend positive">LIVE</span>
              </div>
              <div className="stat-desc">{onlineSpecialists} Specialists, {onlineConsultants} Consultants</div>
            </div>
          </div>

        </div>

        {/* Main Grid Content */}
        <div className="content-grid fade-in-float" style={{ animationDelay: '0.3s' }}>
          {/* Active Consultations Table */}
          <div className="card consultations-card">
            <div className="card-header">
              <h2 className="card-title">Active Consultations</h2>
              <button className="view-all-btn" onClick={() => navigate('/active-cases')}>View All</button>
            </div>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>PATIENT NAME</th>
                    <th>PRIMARY HOSPITAL</th>
                    <th>PRIORITY</th>
                    <th>LAST ACTIVITY</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCases.map((caseItem) => (
                    <tr key={caseItem.id} onClick={() => navigate('/consultation-status')} style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="patient-name">{caseItem.patientName}</div>
                        <div className="patient-meta">ID: {caseItem.id}</div>
                      </td>
                      <td>{caseItem.hospital}</td>
                      <td>
                        <span className={`priority-badge ${caseItem.priority.toLowerCase()}`}>
                          {caseItem.priority}
                        </span>
                      </td>
                      <td>
                        <div className="last-action-cell">
                          <span className="action-text">{caseItem.lastAction || 'Wait for review'}</span>
                          <span className="action-time">{caseItem.lastActiveTime || 'Just now'}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {activeCases.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                        No active consultations found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed and Status */}
          <div className="right-panel">
            <div className="card activity-card">
              <div className="card-header">
                <h2 className="card-title">Activity Feed</h2>
                <div className="menu-container">
                  <button className="icon-btn" onClick={() => setShowActivityMenu(!showActivityMenu)}>
                    <MoreVertical size={20} />
                  </button>
                  {showActivityMenu && (
                    <div className="dropdown-menu">
                      <button 
                        className="menu-item" 
                        onClick={handleRefreshFeed}
                        disabled={isRefreshing}
                      >
                        <RefreshCcw size={14} className={isRefreshing ? 'spinning' : ''} /> 
                        {isRefreshing ? 'Refreshing...' : 'Refresh Feed'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="activity-list">
                {activities.slice(0, 2).map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-icon bg-${item.icon === 'alert' ? 'red' : item.icon === 'note' ? 'blue' : 'gray'}-light text-${item.icon === 'alert' ? 'red' : item.icon === 'note' ? 'blue' : 'gray'}`}>
                      {item.icon === 'alert' ? <AlertCircle size={16} /> : <ClipboardList size={16} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-desc">{item.desc}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="view-full-history" onClick={() => navigate('/activity-history')}>View Full History</button>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;
