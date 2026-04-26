import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value)}
      aria-label={t('language', 'Language')}
      className="h-9 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-dark-900 px-3 text-xs text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary-500/30"
    >
      <option value="en">{t('english', 'English')}</option>
      <option value="hi">{t('hindi', 'Hindi')}</option>
      <option value="kn">{t('kannada', 'Kannada')}</option>
    </select>
  );
}
