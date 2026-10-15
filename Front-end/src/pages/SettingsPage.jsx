import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components';
import { Settings, KeyRound, User, Lock, Save, CheckCircle, AlertCircle } from 'lucide-react';

export const SettingsPage = () => {
  const { t } = useLanguage();
  const { credentials, updateCredentials } = useAuth();

  // Change credentials state
  const [newUsername, setNewUsername] = useState(credentials.username);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success' | 'error', text: '' }
  const [isSaving, setIsSaving] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) {
      setStatusMessage({ type: 'error', text: 'اسم المستخدم مطلوب!' });
      return;
    }
    if (!newPassword.trim()) {
      setStatusMessage({ type: 'error', text: 'كلمة المرور الجديدة مطلوبة!' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: t('passwordsDoNotMatch') });
      return;
    }

    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 500));
    updateCredentials(newUsername, newPassword);
    setIsSaving(false);

    setStatusMessage({ type: 'success', text: t('credentialsUpdated') });
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* ── Page Header ── */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('settings')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          إدارة إعدادات النظام وحسابات تسجيل الدخول
        </p>
      </div>

      {/* ── Change Credentials Card (Jimmy's feature for client) ── */}
      <div className="placeholder-card" style={{ padding: '1.5rem', maxWidth: '600px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--primary)' }}>
          <KeyRound size={22} />
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            {t('changePassword')}
          </h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
          يمكنك من هنا تغيير اسم المستخدم أو كلمة المرور الخاصة بحساب الإدارة (admin).
        </p>

        {statusMessage && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1.25rem',
              backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              color: statusMessage.type === 'success' ? '#10b981' : '#ef4444',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <Input
            label={t('newUsername')}
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            icon={<User size={16} />}
            required
          />

          <Input
            label={t('newPassword')}
            type="password"
            placeholder="أدخل كلمة المرور الجديدة..."
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <Input
            label={t('confirmPassword')}
            type="password"
            placeholder="أعد إدخال كلمة المرور..."
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            icon={<Lock size={16} />}
            required
          />

          <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="primary"
              icon={<Save size={16} />}
              isLoading={isSaving}
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
