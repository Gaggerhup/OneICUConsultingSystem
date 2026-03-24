import { 
  Search,
  Filter,
  AlertCircle,
  Clock,
  Star,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Layout from '../../components/Layout';
import { useApp, type SpecialistMember } from '../../context/AppContext';
import './style.css';

function Specialist() {
  const { specialists, userProfile } = useApp();

  // Create a combined list including the user if they are accepting cases
  const allSpecialists: (SpecialistMember | any)[] = [...specialists];
  
  if (userProfile.isAcceptingCases) {
    allSpecialists.unshift({
      id: 'current-user',
      ...userProfile,
      status: 'online',
      availability: 'AVAILABLE',
      rating: 5.0,
      consultations: 0,
      nextAppt: 'Now'
    });
  }

  return (
    <Layout>
      <div className="specialist-page-wrapper">
          <div className="page-header">
            <h1>Specialist Directory</h1>
            <p className="page-subtitle">Find and consult with interhospital specialists across the network</p>
          </div>

          <div className="specialist-controls">
            <div className="search-box-large">
               <Search size={18} className="text-gray" />
               <input type="text" placeholder="Search by name, specialty, or hospital" />
            </div>
            <div className="control-actions">
               <button className="filter-outline-btn">
                  <Filter size={16} /> Filters
               </button>
               <button className="urgent-request-btn">
                  <AlertCircle size={16} fill="white" className="text-purple stroke-white" />
                  Urgent Request
               </button>
            </div>
          </div>

          <div className="specialty-pills">
            <button className="s-pill active">All Specialties</button>
            <button className="s-pill">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
               Cardiology
            </button>
            <button className="s-pill">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
               Neurology
            </button>
            <button className="s-pill">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
               Oncology
            </button>
            <button className="s-pill">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
               Pediatrics
            </button>
            <button className="s-pill">
               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
               Radiology
            </button>
          </div>

          <div className="specialist-grid">
            {allSpecialists.map((s) => (
              <div key={s.id} className="specialist-card">
                <div className="sc-header">
                    <div className="sc-profile-badge">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt={`${s.title} ${s.firstName} ${s.lastName}`} />
                        ) : (
                          <div className="sc-initials">{s.firstName.charAt(0)}{s.lastName.charAt(0)}</div>
                        )}
                        <div className={`status-indicator ${s.status}`}></div>
                    </div>
                    <div className="sc-info">
                        <h3>{s.title} {s.firstName} {s.lastName}</h3>
                        <span className="sc-specialty">{s.specialty}</span>
                    </div>
                    <div className={`availability-badge ${s.availability.toLowerCase().replace(' ', '-')}`}>
                      {s.availability}
                    </div>
                </div>
                
                <div className="sc-details">
                    <div className="sc-row text-gray">
                        <span className="mr-2">🏥</span> {s.hospital}
                    </div>
                    <div className="sc-row text-gray">
                        <Clock size={14} className="mr-2" /> Next appt: {s.nextAppt}
                    </div>
                    <div className="sc-row sc-rating">
                        <Star size={14} className="fill-yellow text-yellow mr-2" /> 
                        <span className="font-bold text-dark mr-1">{s.rating.toFixed(1)}</span>
                        <span className="text-gray">({s.consultations} consultations)</span>
                    </div>
                </div>

                <div className="sc-actions">
                    <button className="btn-primary-full">New Request</button>
                    <button className="btn-secondary-full">View Profile</button>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination-wrapper-center">
            <div className="pagination-controls center">
              <button className="page-nav-btn"><ChevronLeft size={16} /></button>
              <button className="page-num-btn active">1</button>
              <button className="page-num-btn">2</button>
              <button className="page-num-btn">3</button>
              <span className="page-dots">...</span>
              <button className="page-num-btn">12</button>
              <button className="page-nav-btn"><ChevronRight size={16} /></button>
            </div>
          </div>
      </div>
    </Layout>
  );
}

export default Specialist;
