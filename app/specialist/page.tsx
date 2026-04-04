'use client';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useState, useMemo } from 'react';
import Layout from '@/components/Layout';
import { useApp, type SpecialistMember } from '@/context/AppContext';
import styles from './style.module.css';

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
  const cx = (...names: Array<string | false | null | undefined>) =>
    names.filter(Boolean).map((name) => styles[name as string]).join(' ');

  const allSpecialists = useMemo(() => {
    const list: (SpecialistMember | any)[] = specialists.filter((s) => s.isAcceptingCases);
    if (userProfile.firstName) {
      const currentUser = {
        id: 'current-user',
        ...userProfile,
        status: userProfile.isAcceptingCases ? 'online' : 'away',
      };
      if (currentUser.isAcceptingCases) {
        list.unshift(currentUser);
      }
    }
    return list;
  }, [specialists, userProfile]);

  const activeSpecialties = useMemo(() => {
    const specialtiesWithActiveMembers = new Set<string>();
    allSpecialists.forEach((s) => {
      if (s.isAcceptingCases && s.specialty) specialtiesWithActiveMembers.add(s.specialty);
    });
    return ALL_SPECIALTIES.filter((spec) => specialtiesWithActiveMembers.has(spec));
  }, [allSpecialists]);

  const filteredSpecialists = useMemo(() => {
    return allSpecialists.filter((s) => {
      const matchesSearch =
        (s.firstName + ' ' + s.lastName).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.specialty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.hospital || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesSpecialty = selectedSpecialty === 'All Specialties' || s.specialty === selectedSpecialty;
      return matchesSearch && matchesSpecialty;
    });
  }, [allSpecialists, searchQuery, selectedSpecialty]);

  return (
    <Layout>
      <div className={styles['specialist-page-wrapper']}>
        <div className={styles['page-header']}>
          <h1>Specialist Directory</h1>
          <p className={styles['page-subtitle']}>Find and consult with interhospital specialists across the network</p>
        </div>

        <div className={styles['specialist-controls']}>
          <div className={styles['search-box-large']}>
            <Search size={18} className={styles['text-gray']} />
            <input
              type="text"
              placeholder="Search by name, specialty, or hospital"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className={styles['control-actions']}>
            <div className={styles['specialty-dropdown-wrap']}>
              <Filter size={16} className={styles['filter-icon']} />
              <select
                className={styles['specialty-select']}
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
              >
                <option>All Specialties</option>
                {activeSpecialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              <ChevronDown size={14} className={styles['dropdown-chevron']} />
            </div>
          </div>
        </div>

        <div className={styles['specialist-grid']}>
          {filteredSpecialists.map((s) => (
            <div key={s.id} className={styles['specialist-card']}>
              <div className={styles['sc-header']}>
                <div className={styles['sc-profile-badge']}>
                  {s.avatarUrl ? (
                    <img src={s.avatarUrl} alt={`${s.title} ${s.firstName} ${s.lastName}`} />
                  ) : (
                    <div className={styles['sc-initials']}>{s.firstName?.charAt(0)}{s.lastName?.charAt(0)}</div>
                  )}
                  <div className={`${styles['status-indicator']} ${styles[s.isAcceptingCases ? 'online' : 'away']}`}></div>
                </div>
                <div className={styles['sc-info']}>
                  <h3>{s.title} {s.firstName} {s.lastName}</h3>
                  <span className={styles['sc-specialty']}>{s.specialty}</span>
                </div>
                <div className={`${styles['availability-badge']} ${styles[s.isAcceptingCases ? 'available' : 'unavailable']}`}>
                  {s.isAcceptingCases ? 'AVAILABLE' : 'UNAVAILABLE'}
                </div>
              </div>

              <div className={styles['sc-details']}>
                <div className={styles['text-gray']}>
                  <span className={styles['mr-2']}>🏥</span> {s.hospital}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles['pagination-wrapper-center']}>
          <div className={`${styles['pagination-controls']} ${styles['center']}`}>
            <button className={styles['page-nav-btn']}><ChevronLeft size={16} /></button>
            <button className={`${styles['page-num-btn']} ${styles['active']}`}>1</button>
            <button className={styles['page-num-btn']}>2</button>
            <button className={styles['page-num-btn']}>3</button>
            <span className={styles['page-dots']}>...</span>
            <button className={styles['page-num-btn']}>12</button>
            <button className={styles['page-nav-btn']}><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Specialist;
