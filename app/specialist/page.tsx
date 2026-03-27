'use client';
import { 
  Search,
  Filter,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useApp, type SpecialistMember } from '@/context/AppContext';
import './style.css';

const ALL_SPECIALTIES = [
  "Anatomical Pathology", "Anesthesiology", "Cardiology", "Child and Adolescent Psychiatry",
  "Clinical Pathology", "Colon and Rectal Surgery", "Diagnostic Radiology", "Emergency Medicine",
  "Endocrinology and Metabolism", "Family Medicine", "Forensic Medicine", "Gastroenterology",
  "General Practitioner (GP)", "Geriatric Medicine", "Hematology", "Infectious Diseases",
  "Internal Medicine", "Medical Oncology", "Neonatal and Perinatal Medicine", "Nephrology",
  "Neurology", "Neurosurgery", "Nuclear Medicine", "Obstetrics and Gynecology",
  "Ophthalmology", "Orthopedic Surgery", "Otolaryngology", "Pathology",
  "Pediatric Cardiology", "Pediatric Endocrinology", "Pediatric Hematology and Oncology",
  "Pediatric Infectious Diseases", "Pediatric Nephrology", "Pediatric Neurology",
  "Pediatric Pulmonology", "Pediatric Surgery", "Pediatrics", "Plastic Surgery",
  "Preventive Medicine", "Psychiatry", "Pulmonary Medicine and Critical Care",
  "Radiation Oncology", "Radiology", "Rehabilitation Medicine", "Rheumatology",
  "Surgery", "Thoracic Surgery", "Urology", "Vascular Surgery"
];

function Specialist() {
  const { specialists, userProfile } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');

  // Create a combined list including the user if they are accepting cases
  const allSpecialists = useMemo(() => {
    const list: (SpecialistMember | any)[] = [...specialists];
    
    // Add current user to the list for demonstration if they have a specialty
    if (userProfile.firstName) {
      list.unshift({
        id: 'current-user',
        ...userProfile,
        status: userProfile.isAcceptingCases ? 'online' : 'away',
        availability: userProfile.isAcceptingCases ? 'AVAILABLE' : 'UNAVAILABLE',
        rating: 5.0,
        consultations: 0,
        nextAppt: 'Now'
      });
    }
    return list;
  }, [specialists, userProfile]);

  // Filter 1: Determine which specialties have at least one person "Accepting New Cases"
  const activeSpecialties = useMemo(() => {
    const specialtiesWithActiveMembers = new Set<string>();
    allSpecialists.forEach(s => {
      if (s.isAcceptingCases) {
        specialtiesWithActiveMembers.add(s.specialty);
      }
    });
    
    return ALL_SPECIALTIES.filter(spec => specialtiesWithActiveMembers.has(spec));
  }, [allSpecialists]);

  // Filter 2: Apply filters to the specialist list
  const filteredSpecialists = useMemo(() => {
    return allSpecialists.filter(s => {
      // Logic requirement: only show specialists who are accepting cases in the directory?
      // Or show all but status differs? Rule 5 says status available depends on accepting cases.
      // Rule 1 says specialty display in dropdown depends on existence of accepting specialist.
      // I will show ALL specialists in that specialty, but their badge reflects reality.
      
      const matchesSearch = 
        (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSpecialty = selectedSpecialty === 'All Specialties' || s.specialty === selectedSpecialty;
      
      return matchesSearch && matchesSpecialty;
    });
  }, [allSpecialists, searchQuery, selectedSpecialty]);

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
               <input 
                 type="text" 
                 placeholder="Search by name, specialty, or hospital" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
            <div className="control-actions">
               <div className="specialty-dropdown-wrap">
                 <Filter size={16} className="filter-icon" />
                 <select 
                   className="specialty-select"
                   value={selectedSpecialty}
                   onChange={(e) => setSelectedSpecialty(e.target.value)}
                 >
                   <option>All Specialties</option>
                   {activeSpecialties.map(spec => (
                     <option key={spec} value={spec}>{spec}</option>
                   ))}
                 </select>
                 <ChevronDown size={14} className="dropdown-chevron" />
               </div>
            </div>
          </div>


          <div className="specialist-grid">
            {filteredSpecialists.map((s) => (
              <div key={s.id} className="specialist-card">
                <div className="sc-header">
                    <div className="sc-profile-badge">
                        {s.avatarUrl ? (
                          <img src={s.avatarUrl} alt={`${s.title} ${s.firstName} ${s.lastName}`} />
                        ) : (
                          <div className="sc-initials">{s.firstName?.charAt(0)}{s.lastName?.charAt(0)}</div>
                        )}
                        <div className={`status-indicator ${s.isAcceptingCases ? 'online' : 'away'}`}></div>
                    </div>
                    <div className="sc-info">
                        <h3>{s.title} {s.firstName} {s.lastName}</h3>
                        <span className="sc-specialty">{s.specialty}</span>
                    </div>
                    <div className={`availability-badge ${s.isAcceptingCases ? 'available' : 'unavailable'}`}>
                      {s.isAcceptingCases ? 'AVAILABLE' : 'UNAVAILABLE'}
                    </div>
                </div>
                
                <div className="sc-details">
                    <div className="sc-row text-gray">
                        <span className="mr-2">🏥</span> {s.hospital}
                    </div>
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
