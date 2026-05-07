'use client';
import Image from 'next/image';
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
import { useLocale } from '@/context/LocaleContext';
import { SPECIALTY_OPTIONS } from '@/constants/specialties';
import { cx } from '@/lib/cx';
import {
  ALL_SPECIALTIES_VALUE,
  buildDirectorySpecialists,
  filterSpecialists,
  getActiveSpecialties,
} from '@/lib/specialist-directory';
import styles from './style.module.css';

function Specialist() {
  const { specialists, userProfile } = useApp();
  const { t } = useLocale();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(ALL_SPECIALTIES_VALUE);
  const allSpecialists = useMemo(() => {
    return buildDirectorySpecialists(specialists, userProfile);
  }, [specialists, userProfile]);

  const activeSpecialties = useMemo(() => {
    return getActiveSpecialties(allSpecialists, SPECIALTY_OPTIONS);
  }, [allSpecialists]);

  const filteredSpecialists = useMemo(() => {
    return filterSpecialists(allSpecialists, searchQuery, selectedSpecialty);
  }, [allSpecialists, searchQuery, selectedSpecialty]);

  return (
    <Layout>
      <div className={styles['specialist-page-wrapper']}>
        <div className={styles['page-header']}>
          <h1>{t('specialist.title')}</h1>
          <p className={styles['page-subtitle']}>{t('specialist.subtitle')}</p>
        </div>

        <div className={styles['specialist-controls']}>
          <div className={styles['search-box-large']}>
            <Search size={18} className={styles['text-gray']} />
            <input
              type="text"
              placeholder={t('specialist.searchPlaceholder')}
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
                <option value={ALL_SPECIALTIES_VALUE}>{t('common.allSpecialties')}</option>
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
                    <Image
                      src={s.avatarUrl}
                      alt={`${s.title} ${s.firstName} ${s.lastName}`}
                      fill
                      unoptimized
                      sizes="60px"
                      className={styles['sc-avatar-img']}
                    />
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
                  {s.isAcceptingCases ? t('common.available') : t('common.unavailable')}
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
