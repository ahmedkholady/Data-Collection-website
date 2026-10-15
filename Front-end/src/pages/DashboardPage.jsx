import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useRecords } from '../context/RecordsContext';
import { Button } from '../components';
import {
  LayoutDashboard,
  Database,
  Upload,
  Download,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Plus,
  Phone,
  User,
  MapPin,
  Clock,
} from 'lucide-react';

export const DashboardPage = () => {
  const { t, dir } = useLanguage();
  const { currentUser } = useAuth();
  const { records, customColumns, dataSources, isBackendHealthy } = useRecords();

  const ArrowIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  // Recent 4 records
  const recentRecords = records.slice(-4).reverse();

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Welcome Header ── */}
      <div
        className="placeholder-card"
        style={{
          padding: '1.75rem',
          background: 'linear-gradient(135deg, var(--bg-surface), var(--bg-main))',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div className="placeholder-badge">
              <CheckCircle2 size={16} />
              <span>{t('demoMode')}</span>
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
              {t('dashboardWelcome')} {currentUser?.username || 'admin'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', maxWidth: '700px', lineHeight: 1.5 }}>
              {t('dashboardSubtitle')}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/records">
              <Button variant="primary" icon={<Plus size={16} />}>
                {t('addRecord')}
              </Button>
            </Link>
            <Link to="/import">
              <Button variant="secondary" icon={<Upload size={16} />}>
                {t('import')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Metric Cards Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {/* Total Records */}
        <div className="placeholder-card" style={{ padding: '1.25rem', borderLeft: dir === 'ltr' ? '4px solid var(--primary)' : undefined, borderRight: dir === 'rtl' ? '4px solid var(--primary)' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('metricTotalRecords')}
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              <Database size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {records.length}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {records.length === 0 ? t('noRecordsYet') : `${records.length} ${t('recordsCount')}`}
          </span>
        </div>

        {/* Data Sources */}
        <div className="placeholder-card" style={{ padding: '1.25rem', borderLeft: dir === 'ltr' ? '4px solid #10b981' : undefined, borderRight: dir === 'rtl' ? '4px solid #10b981' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('metricDataSources')}
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <Layers size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {dataSources.length}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {dataSources.length > 0 ? dataSources.join(' • ') : '—'}
          </span>
        </div>

        {/* Custom Columns */}
        <div className="placeholder-card" style={{ padding: '1.25rem', borderLeft: dir === 'ltr' ? '4px solid #8b5cf6' : undefined, borderRight: dir === 'rtl' ? '4px solid #8b5cf6' : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('metricCustomFields')}
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
              <Layers size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {customColumns.length}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {customColumns.length > 0 ? customColumns.map((c) => c.name).join(' • ') : '0'}
          </span>
        </div>

        {/* API Backend Health */}
        <div className="placeholder-card" style={{ padding: '1.25rem', borderLeft: dir === 'ltr' ? `4px solid ${isBackendHealthy ? '#10b981' : '#f59e0b'}` : undefined, borderRight: dir === 'rtl' ? `4px solid ${isBackendHealthy ? '#10b981' : '#f59e0b'}` : undefined }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {t('metricSystemHealth')}
            </span>
            <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', backgroundColor: isBackendHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: isBackendHealthy ? '#10b981' : '#f59e0b' }}>
              <Server size={18} />
            </div>
          </div>
          <p style={{ fontSize: '1.35rem', fontWeight: 800, color: isBackendHealthy ? '#10b981' : '#f59e0b' }}>
            {isBackendHealthy ? t('backendConnected') : t('backendDisconnected')}
          </p>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Port 5000: {isBackendHealthy ? 'HTTP 200 OK' : 'Offline / Checking'}
          </span>
        </div>
      </div>

      {/* ── Quick Actions Grid ── */}
      <div>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
          {t('quickActions')}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1rem',
          }}
        >
          <Link to="/records" style={{ textDecoration: 'none' }}>
            <div className="placeholder-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <Database size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('records')}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('navToRecords')}</p>
                </div>
              </div>
              <ArrowIcon size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>

          <Link to="/import" style={{ textDecoration: 'none' }}>
            <div className="placeholder-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('import')}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('navToImport')}</p>
                </div>
              </div>
              <ArrowIcon size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>

          <Link to="/export" style={{ textDecoration: 'none' }}>
            <div className="placeholder-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                  <Download size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('export')}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('navToExport')}</p>
                </div>
              </div>
              <ArrowIcon size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>

          <Link to="/backup" style={{ textDecoration: 'none' }}>
            <div className="placeholder-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('backup')}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('navToBackup')}</p>
                </div>
              </div>
              <ArrowIcon size={18} style={{ color: 'var(--text-muted)' }} />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Recent Records Section & Architectural Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Recent Records */}
        <div className="placeholder-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} style={{ color: 'var(--primary)' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('recentRecordsTitle')}
              </h3>
            </div>
            {records.length > 0 && (
              <Link to="/records" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}>
                {t('viewAllRecords')}
              </Link>
            )}
          </div>

          {recentRecords.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Database size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>{t('noRecentRecords')}</p>
              <Link to="/records">
                <Button variant="outline" size="sm" icon={<Plus size={14} />}>
                  {t('addRecord')}
                </Button>
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentRecords.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <User size={16} />
                    </div>
                    <div>
                      <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.name}</h5>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', direction: 'ltr' }}>
                        <Phone size={12} /> {r.phone}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: dir === 'rtl' ? 'left' : 'right' }}>
                    <span style={{ fontSize: '0.75rem', padding: '0.15rem 0.5rem', borderRadius: '9999px', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontWeight: 500 }}>
                      {r.source || '—'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Technical Architecture & Integration Status */}
        <div className="placeholder-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Layers size={18} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {t('systemLayersTitle')}
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Layer 1: Frontend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>{t('layerFrontend')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SPA + Vite + React 18</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={14} /> {t('layerStatusReady')}
              </span>
            </div>

            {/* Layer 2: Express Backend */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>{t('layerBackend')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REST API /api/health</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isBackendHealthy ? '#10b981' : '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {isBackendHealthy ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {isBackendHealthy ? t('backendConnected') : t('backendDisconnected')}
              </span>
            </div>

            {/* Layer 3: PostgreSQL Database */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ fontSize: '0.88rem', fontWeight: 700, display: 'block' }}>{t('layerDatabase')}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Database/ (Ziad's Task)</span>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Clock size={14} /> {t('layerStatusPending')}
              </span>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '0.25rem' }}>
              {t('backendNoticeLocal')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
