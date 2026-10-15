import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useRecords } from '../context/RecordsContext';
import { recordsService } from '../services/recordsService';
import { Button, Modal, Input } from '../components';
import {
  ShieldCheck,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  FileArchive,
  RefreshCw,
  Info,
} from 'lucide-react';

export const BackupPage = () => {
  const { t, dir } = useLanguage();
  const { records, customColumns, importBatch, clearAllRecords } = useRecords();
  const restoreFileInputRef = useRef(null);

  // Backup creation state
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [backupSuccessMsg, setBackupSuccessMsg] = useState('');

  // Backup history list
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 'bk_demo_1',
      name: 'system_initial_snapshot.json',
      date: '2026-10-01 14:30',
      size: '24 KB',
      status: 'حفظ آمن / Verified',
    },
  ]);

  // Restore state
  const [selectedRestoreFile, setSelectedRestoreFile] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmationInput, setConfirmationInput] = useState('');
  const [restoreError, setRestoreError] = useState('');
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);

  // Create Backup
  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    setBackupSuccessMsg('');

    try {
      await new Promise((res) => setTimeout(res, 400));

      const backupData = {
        version: '0.1.0',
        timestamp: new Date().toISOString(),
        totalRecords: records.length,
        records: records,
        customColumns: customColumns,
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const filename = `data_backup_${new Date().toISOString().slice(0, 10)}.json`;

      recordsService.triggerDownload(blob, filename);

      // Add to history
      setBackupHistory((prev) => [
        {
          id: `bk_${Date.now()}`,
          name: filename,
          date: new Date().toLocaleString('ar-EG'),
          size: `${(blob.size / 1024).toFixed(1)} KB`,
          status: 'ناجح / Created',
        },
        ...prev,
      ]);

      setBackupSuccessMsg(t('backupCreatedSuccess'));
      setTimeout(() => setBackupSuccessMsg(''), 5000);
    } catch (err) {
      alert('فشل إنشاء النسخة الاحتياطية: ' + err.message);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  // Handle Restore file selection
  const handleSelectRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreError('');
    setRestoreSuccessMsg('');
    setSelectedRestoreFile(file);
    setConfirmationInput('');
    setIsConfirmModalOpen(true);
  };

  // Execute Confirmed Restore
  const handleExecuteRestore = async () => {
    const requiredWord = dir === 'rtl' ? 'استعادة' : 'RESTORE';
    if (confirmationInput.trim() !== requiredWord && confirmationInput.trim() !== 'RESTORE' && confirmationInput.trim() !== 'استعادة') {
      setRestoreError(`يرجى كتابة "${requiredWord}" بدقة لتأكيد الاستعادة.`);
      return;
    }

    setIsRestoring(true);
    setRestoreError('');

    try {
      const text = await selectedRestoreFile.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error('الملف المختار ليس بصيغة JSON صالحة لاستعادة البيانات.');
      }

      if (data && Array.isArray(data.records)) {
        clearAllRecords();
        importBatch(data.records);
      }

      setIsConfirmModalOpen(false);
      setSelectedRestoreFile(null);
      setRestoreSuccessMsg(t('restoreSuccess'));
      setTimeout(() => setRestoreSuccessMsg(''), 5000);
    } catch (err) {
      setRestoreError(err.message);
    } finally {
      setIsRestoring(false);
      if (restoreFileInputRef.current) restoreFileInputRef.current.value = '';
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* ── Page Header ── */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('backupTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('backupSubtitle')}
        </p>
      </div>

      {/* ── Architectural Notice ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
        }}
      >
        <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>{t('databaseBackupNotice')}</span>
      </div>

      {/* Success Notification */}
      {(backupSuccessMsg || restoreSuccessMsg) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.85rem 1.1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          <CheckCircle2 size={18} />
          <span>{backupSuccessMsg || restoreSuccessMsg}</span>
        </div>
      )}

      {/* ── Grid: Create Backup & Restore ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Create Backup Panel */}
        <div className="placeholder-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', color: 'var(--primary)' }}>
            <FileArchive size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>{t('createBackupSection')}</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            تتيح لك هذه الأداة إنشاء لقطة فورية متكاملة لجميع السجلات الحالية ({records.length} سجل) والأعمدة المخصصة وحفظها محلياً على جهازك.
          </p>

          <div style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>{t('backupScope')}</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>{t('fullBackup')}</span>
          </div>

          <Button
            variant="primary"
            icon={<Download size={18} />}
            onClick={handleCreateBackup}
            isLoading={isCreatingBackup}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {t('createBackupBtn')}
          </Button>
        </div>

        {/* Restore Panel */}
        <div className="placeholder-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem', color: '#ef4444' }}>
            <AlertTriangle size={22} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('restoreSection')}</h3>
          </div>

          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              marginBottom: '1.25rem',
            }}
          >
            <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ef4444', marginBottom: '0.3rem' }}>
              {t('restoreWarningTitle')}
            </h4>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              {t('restoreWarningDesc')}
            </p>
          </div>

          <input
            type="file"
            ref={restoreFileInputRef}
            onChange={handleSelectRestoreFile}
            accept=".json,.sql,.dump"
            style={{ display: 'none' }}
          />

          <Button
            variant="outline"
            icon={<Upload size={18} />}
            onClick={() => restoreFileInputRef.current?.click()}
            style={{ width: '100%', justifyContent: 'center', borderColor: '#ef4444', color: '#ef4444' }}
          >
            {t('selectRestoreFile')}
          </Button>
        </div>
      </div>

      {/* ── Backup History Table ── */}
      <div className="placeholder-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <Clock size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('backupHistory')}
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="custom-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>اسم الملف</th>
                <th style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{t('backupDate')}</th>
                <th style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{t('backupSize')}</th>
                <th style={{ textAlign: dir === 'rtl' ? 'right' : 'left' }}>{t('backupStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {backupHistory.map((item) => (
                <tr key={item.id} className="table-row">
                  <td className="table-cell" style={{ fontWeight: 600 }}>{item.name}</td>
                  <td className="table-cell" style={{ color: 'var(--text-secondary)' }}>{item.date}</td>
                  <td className="table-cell">{item.size}</td>
                  <td className="table-cell">
                    <span
                      style={{
                        padding: '0.2rem 0.55rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        color: '#10b981',
                      }}
                    >
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Destructive Restore Confirmation Modal ── */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => !isRestoring && setIsConfirmModalOpen(false)}
        title={t('confirmRestoreTitle')}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isRestoring}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }}
              onClick={handleExecuteRestore}
              isLoading={isRestoring}
            >
              {t('restoreBtn')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.88rem',
              lineHeight: 1.5,
            }}
          >
            {t('restoreWarningDesc')}
          </div>

          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            الملف المختار: <strong>{selectedRestoreFile?.name}</strong>
          </p>

          <Input
            label={t('confirmRestorePrompt')}
            placeholder={dir === 'rtl' ? 'اكتب "استعادة"...' : 'Type "RESTORE"...'}
            value={confirmationInput}
            onChange={(e) => setConfirmationInput(e.target.value)}
            error={restoreError}
          />
        </div>
      </Modal>
    </div>
  );
};

export default BackupPage;
