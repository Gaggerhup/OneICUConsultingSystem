import { useState } from 'react';
import { 
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Inbox,
  Send
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import './style.css';

function Requests() {
  const { requests, approveRequest, declineRequest } = useApp();
  const [activeTab, setActiveTab] = useState<'incoming' | 'sent'>('incoming');

  // @ts-ignore
  const tg = window.Telegram?.WebApp;
  const currentUserId = tg?.initDataUnsafe?.user ? `user_${tg.initDataUnsafe.user.id}` : 'guest_user';

  const filteredRequests = requests.filter(r => {
    if (activeTab === 'sent') {
      return r.senderId === currentUserId;
    }
    // Everyone sees incoming cases the same (those not sent by self)
    // Or if you want a true shared queue, you might show all, but the user requested 
    // that sent is only for the person who sent.
    return r.senderId !== currentUserId;
  });

  const pendingCount = requests.filter(r => r.senderId !== currentUserId && r.status === 'Pending').length;

  return (
    <Layout>
      <div className="requests-page-wrapper">
        <div className="page-header">
          <h1>Requests</h1>
          <p>Manage and track inter-hospital patient transfers</p>
        </div>

        <div className="requests-card">
          <div className="card-tabs">
            <button 
              className={`tab-btn ${activeTab === 'incoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('incoming')}
            >
              <Inbox size={18} />
              Incoming Requests
              {pendingCount > 0 && <span className="count-badge">{pendingCount}</span>}
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
              onClick={() => setActiveTab('sent')}
            >
              <Send size={18} />
              Sent Requests
            </button>
          </div>

          <div className="table-container">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>CASE ID</th>
                  <th>PATIENT NAME</th>
                  <th>{activeTab === 'incoming' ? 'SOURCE HOSPITAL' : 'TARGET HOSPITAL'}</th>
                  <th>PRIORITY</th>
                  <th>STATUS</th>
                  <th className="text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td><span className="case-id-badge">#{req.id}</span></td>
                    <td>
                      <div className="patient-cell">
                        <div className="initials-avatar">
                          {req.patientName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="patient-name">{req.patientName}</span>
                      </div>
                    </td>
                    <td>{req.hospital}</td>
                    <td>
                      <span className={`priority-badge ${req.priority.toLowerCase()}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-dot ${req.status.toLowerCase()}`}></span>
                        <span className={`status-text ${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </div>
                    </td>
                    <td className="text-right">
                      {req.status === 'Pending' ? (
                        <div className="action-btns">
                          <button 
                            className="decline-btn"
                            onClick={() => declineRequest(req.id)}
                          >
                            Decline
                          </button>
                          <button 
                            className="approve-btn"
                            onClick={() => approveRequest(req.id)}
                          >
                            Approve
                          </button>
                        </div>
                      ) : (
                        <button className="more-btn">
                          <MoreVertical size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                      No {activeTab} requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="pagination-footer">
            <span className="results-count">Showing {filteredRequests.length} of {filteredRequests.length} {activeTab} requests</span>
            <div className="pagination-controls">
              <button className="page-nav-btn"><ChevronLeft size={16} /></button>
              <button className="page-num active">1</button>
              <button className="page-nav-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">TOTAL MONTHLY TRANSFERS</span>
            <div className="stat-value-container">
              <span className="stat-value">248</span>
              <span className="trend positive">
                <TrendingUp size={14} /> 12%
              </span>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-label">AVG. APPROVAL TIME</span>
            <div className="stat-value-container">
              <span className="stat-value">42m</span>
              <span className="trend negative">
                <TrendingDown size={14} /> 8m
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Requests;
