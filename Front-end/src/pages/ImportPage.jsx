import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Upload, Info } from 'lucide-react';

export const ImportPage = () => {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="placeholder-card">
        <div className="placeholder-badge">
          <Upload size={16} />
          <span>{t('import')}</span>
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          {t('importPlaceholderTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('importPlaceholderDesc')}
        </p>
        <div
          style={{
            marginTop: '1.5rem',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-main)',
            border: '1px dashed var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            color: 'var(--text-muted)',
          }}
        >
          <Info size={20} />
          <span>(Structural shell ready for CSV/XLSX/TXT file processing feature)</span>
        </div>
      </div>
    </div>
  );
};
