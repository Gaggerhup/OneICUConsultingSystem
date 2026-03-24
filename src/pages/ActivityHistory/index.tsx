import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  AlertCircle, 
  ClipboardList, 
  Settings, 
  RefreshCcw,
  Search,
  Calendar,
  XCircle,
  Filter,
  Activity
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp } from '../../context/AppContext';
import type { ActivityLogItem } from '../../context/AppContext';
import './style.css';

const ActivityHistory: React.FC = () => {
  const navigate = useNavigate();
  const { activities } = useApp();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [dateRange, setDateRange] = React.useState('3d');

  const getDateLimit = (range: string) => {
    const now = Date.now();
    switch (range) {
      case '1d': return now - 24 * 60 * 60 * 1000;
      case '3d': return now - 3 * 24 * 60 * 60 * 1000;
      case '7d': return now - 7 * 24 * 60 * 60 * 1000;
      case '14d': return now - 14 * 24 * 60 * 60 * 1000;
      case '1m': return now - 30 * 24 * 60 * 60 * 1000;
      case '3m': return now - 90 * 24 * 60 * 60 * 1000;
      default: return 0;
    }
  };

  const filteredActivities = activities.filter(activity => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      activity.title.toLowerCase().includes(searchLower) ||
      activity.desc.toLowerCase().includes(searchLower) ||
      (activity.details && activity.details.toLowerCase().includes(searchLower));
    
    const dateLimit = getDateLimit(dateRange);
    const matchesDate = dateRange === 'all' || activity.timestamp >= dateLimit;

    return matchesSearch && matchesDate;
  });

  const getIcon = (type: ActivityLogItem['icon']) => {
    switch (type) {
      case 'alert': return <AlertCircle size={20} className="text-red" />;
      case 'note': return <ClipboardList size={20} className="text-blue" />;
      case 'system': return <Settings size={20} className="text-gray" />;
      case 'update': return <RefreshCcw size={20} className="text-green" />;
      default: return <RefreshCcw size={20} />;
    }
  };

  return (
    <Layout>
      <div className="activity-history-container">
        <header className="page-header premium">
          <div className="header-top">
            <div className="header-left">
              <button className="back-btn" onClick={() => navigate('/dashboard')}>
                <ArrowLeft size={18} />
              </button>
              <div className="title-area">
                <div className="title-with-icon">
                  <Activity size={22} className="title-icon" />
                  <h1 className="page-title">Full Activity History</h1>
                </div>
                <p className="page-subtitle">Detailed clinical activity and system logs</p>
              </div>
            </div>
            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-value">{filteredActivities.length}</span>
                <span className="stat-label">Activities Found</span>
              </div>
            </div>
          </div>

          <div className="header-bottom">
            <div className="filter-section">
              <div className="filter-label-group">
                <Filter size={14} />
                <span>Time Range:</span>
              </div>
              <div className="segmented-control">
                {[
                  { id: '1d', label: '1D' },
                  { id: '3d', label: '3D' },
                  { id: '7d', label: '7D' },
                  { id: '14d', label: '14D' },
                  { id: '1m', label: '1M' },
                  { id: '3m', label: '3M' },
                  { id: 'all', label: 'All' }
                ].map((range) => (
                  <button
                    key={range.id}
                    className={`segment-btn ${dateRange === range.id ? 'active' : ''}`}
                    onClick={() => setDateRange(range.id)}
                  >
                    {range.label}
                  </button>
                ))}
                <div className="segment-active-bg" style={{ 
                  left: `calc(${(['1d', '3d', '7d', '14d', '1m', '3m', 'all'].indexOf(dateRange) * 100) / 7}% + 2px)`,
                  width: `calc(100% / 7 - 4px)`
                }}></div>
              </div>
            </div>

            <div className="search-section">
              <div className="premium-search">
                <Search size={16} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={() => setSearchTerm('')}>
                    <XCircle size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="activity-board">
          <div className="activity-timeline">
            {filteredActivities.length > 0 ? (
              filteredActivities.map((activity, index) => (
                <div key={activity.id} className="history-item-wrapper fade-in-up" style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="timeline-connector">
                    <div className="timeline-dot"></div>
                    {index !== filteredActivities.length - 1 && <div className="timeline-line"></div>}
                  </div>
                  <div className="history-card">
                    <div className="history-card-header">
                      <div className="activity-type-icon">
                        {getIcon(activity.icon)}
                      </div>
                      <div className="activity-main-info">
                        <h3 className="activity-title">{activity.title}</h3>
                        <span className="activity-timestamp">
                          <Calendar size={12} />
                          {activity.time}
                        </span>
                      </div>
                    </div>
                    <div className="history-card-body">
                      <p className="activity-summary">{activity.desc}</p>
                      {activity.details && (
                        <div className="activity-details-box">
                          <h4 className="details-label">Details</h4>
                          <p className="details-text">{activity.details}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activities-found">
                <Search size={48} />
                <h3>No activities found</h3>
                <p>Try adjusting your search terms or date range to find what you're looking for.</p>
                <div className="no-results-actions">
                  {searchTerm && <button className="reset-search-btn" onClick={() => setSearchTerm('')}>Clear search</button>}
                  {dateRange !== 'all' && <button className="reset-search-btn secondary" onClick={() => setDateRange('all')}>Show all time</button>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ActivityHistory;
