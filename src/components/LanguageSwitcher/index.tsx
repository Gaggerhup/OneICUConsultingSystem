'use client';

import { useLocale } from '@/context/LocaleContext';
import './style.css';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLocale();

  return (
    <div className="language-switcher" aria-label={t('language.switcherLabel')}>
      <button
        type="button"
        className={language === 'th' ? 'active' : ''}
        onClick={() => setLanguage('th')}
      >
        {t('common.thai')}
      </button>
      <button
        type="button"
        className={language === 'en' ? 'active' : ''}
        onClick={() => setLanguage('en')}
      >
        {t('common.english')}
      </button>
    </div>
  );
}
