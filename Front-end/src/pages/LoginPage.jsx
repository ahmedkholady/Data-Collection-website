import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { Layers, LogIn, ArrowLeft, ArrowRight, Sun, Moon, Globe } from 'lucide-react';

export const LoginPage = () => {
  const { t, language, toggleLanguage, dir } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const ArrowIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '1.5rem',
      }}
    >
      {/* Top right floating controls */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          insetInlineEnd: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
        }}
      >
        <button
          onClick={toggleLanguage}
          className="header-icon-btn"
          style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
          title={t('language')}
        >
          <Globe size={18} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            {language === 'ar' ? 'EN' : 'عربي'}
          </span>
        </button>

        <button
          onClick={toggleTheme}
          className="header-icon-btn"
          style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      <div
        className="placeholder-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          textAlign: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            margin: '0 auto 1rem',
          }}
        >
          <Layers size={28} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          {t('loginPlaceholderTitle')}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {t('loginPlaceholderDesc')}
        </p>

        <div
          style={{
            padding: '1.25rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-main)',
            border: '1px dashed var(--border-color)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
          }}
        >
          (Authentication logic & forms will be integrated here in later tasks)
        </div>

        <Link
          to="/dashboard"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--primary)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '0.95rem',
            transition: 'background-color 0.2s',
          }}
        >
          <span>{t('backToDashboard')}</span>
          <ArrowIcon size={18} />
        </Link>
      </div>
    </div>
  );
};
