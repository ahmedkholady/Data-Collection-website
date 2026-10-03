import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LayoutDashboard, CheckCircle2, Info, Activity, Database } from 'lucide-react';

export const DashboardPage = () => {
  const { t } = useLanguage();

  return (
    <div className="page-container">
      <div className="placeholder-card">
        <div className="placeholder-badge">
          <CheckCircle2 size={16} />
          <span>{t('demoMode')}</span>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          {t('welcomeTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {t('welcomeDesc')}
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Activity size={18} />
              <span style={{ fontWeight: 600 }}>{t('systemStatus')}</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('statusOk')}</p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Database size={18} />
              <span style={{ fontWeight: 600 }}>{t('quickStats')}</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>{t('totalRecords')}: --</p>
          </div>

          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
              <Info size={18} />
              <span style={{ fontWeight: 600 }}>{t('systemVersion')}</span>
            </div>
            <p style={{ fontSize: '1.1rem', fontWeight: 700 }}>v0.1.0 Shell</p>
          </div>
        </div>
      </div>
    </div>
  );
};
