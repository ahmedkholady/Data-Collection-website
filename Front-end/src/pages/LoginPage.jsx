import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components';
import {
  Database,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Sun,
  Moon,
  Globe,
  AlertCircle,
} from 'lucide-react';

export const LoginPage = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Submit login
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMessage(t('invalidCredentials'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    const res = await login(username, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/records');
    } else {
      setErrorMessage(t('invalidCredentials'));
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-main)',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      {/* Top Floating Controls (Theme & Language) */}
      <div
        style={{
          position: 'absolute',
          top: '1.5rem',
          insetInlineEnd: '1.5rem',
          display: 'flex',
          gap: '0.75rem',
          zIndex: 10,
        }}
      >
        <button
          onClick={toggleLanguage}
          className="header-icon-btn"
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
          }}
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
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
          }}
          title={theme === 'light' ? t('darkMode') : t('lightMode')}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div
        className="placeholder-card"
        style={{
          width: '100%',
          maxWidth: '430px',
          boxShadow: 'var(--shadow-lg)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Header / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              margin: '0 auto 1.25rem',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
            }}
          >
            <Database size={28} />
          </div>

          <h1
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '0.4rem',
            }}
          >
            {t('loginPlaceholderTitle')}
          </h1>
          <p
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.9rem',
              lineHeight: 1.5,
            }}
          >
            {t('loginPlaceholderDesc')}
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Clean, Secure Login Form */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
        >
          {/* Username */}
          <Input
            label={t('usernameLabel')}
            placeholder={t('usernamePlaceholder')}
            icon={<User size={18} />}
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (errorMessage) setErrorMessage('');
            }}
            required
            autoComplete="username"
          />

          {/* Password with Show/Hide toggle */}
          <div style={{ position: 'relative' }}>
            <Input
              label={t('passwordLabel')}
              placeholder={t('passwordPlaceholder')}
              type={showPassword ? 'text' : 'password'}
              icon={<Lock size={18} />}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage('');
              }}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                insetInlineEnd: '0.75rem',
                top: '2.4rem',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.2rem',
              }}
              title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<LogIn size={18} />}
            isLoading={isLoading}
            style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
          >
            {t('loginBtn')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
