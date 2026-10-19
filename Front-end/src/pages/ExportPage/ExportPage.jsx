import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useRecords } from '../../context/RecordsContext';
import { recordsService } from '../../services/recordsService';
import { Button } from '../../components';
import {
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Database,
  Filter,
  Layers,
  Plus,
  Info,
} from 'lucide-react';
import './ExportPage.css';

export const ExportPage = () => {
  const { t } = useLanguage();
  const { records, customColumns } = useRecords();

  // Export scope: 'all' | 'filtered'
  const [exportScope, setExportScope] = useState('all');

  // Standard available columns
  const standardColumns = useMemo(
    () => [
      { key: 'phone', title: t('phoneNumber') },
      { key: 'name', title: t('clientName') },
      { key: 'source', title: t('dataSource') },
      { key: 'city', title: t('city') },
      { key: 'activity', title: t('activityType') },
    ],
    [t]
  );

  // Selected column keys state
  const [selectedColumnKeys, setSelectedColumnKeys] = useState(() => {
    return [
      'phone',
      'name',
      'source',
      'city',
      'activity',
      ...customColumns.map((c) => c.id),
    ];
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMsg, setExportSuccessMsg] = useState('');

  // Toggle single column
  const toggleColumn = (key) => {
    setSelectedColumnKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Select all columns
  const handleSelectAll = () => {
    const all = [
      ...standardColumns.map((c) => c.key),
      ...customColumns.map((c) => c.id),
    ];
    setSelectedColumnKeys(all);
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectedColumnKeys([]);
  };

  // Columns to export definition
  const columnsToExport = useMemo(() => {
    const all = [
      ...standardColumns,
      ...customColumns.map((c) => ({ key: c.id, title: c.name })),
    ];
    return all.filter((col) => selectedColumnKeys.includes(col.key));
  }, [standardColumns, customColumns, selectedColumnKeys]);

  // Execute CSV Export
  const handleExport = async () => {
    if (records.length === 0) {
      alert(t('noDataToExport'));
      return;
    }

    if (columnsToExport.length === 0) {
      alert('يرجى اختيار عمود واحد على الأقل للتصدير!');
      return;
    }

    setIsExporting(true);
    setExportSuccessMsg('');

    try {
      await new Promise((res) => setTimeout(res, 400));
      const blob = recordsService.generateCsvBlob(records, [
        { key: 'seq', title: '#' },
        ...columnsToExport,
      ]);

      const dateStr = new Date().toISOString().slice(0, 10);
      const filename = `data_records_export_${dateStr}.csv`;
      recordsService.triggerDownload(blob, filename);

      setExportSuccessMsg(t('exportSuccess'));
      setTimeout(() => setExportSuccessMsg(''), 5000);
    } catch (err) {
      alert('فشل تصدير البيانات: ' + err.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="page-container export-page-container">
      {/* ── Page Header ── */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {t('exportTitle')}
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {t('exportSubtitle')}
        </p>
      </div>

      {/* ── Architecture Streaming Notice ── */}
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
        <span>{t('largeExportNotice')}</span>
      </div>

      {/* Success Notification */}
      {exportSuccessMsg && (
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
          <span>{exportSuccessMsg}</span>
        </div>
      )}

      {/* ── Zero Records Honest Warning ── */}
      {records.length === 0 ? (
        <div className="placeholder-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
          <Database size={42} style={{ margin: '0 auto 1rem', color: 'var(--text-muted)', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            {t('noDataToExport')}
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '480px', margin: '0 auto 1.5rem' }}>
            لا يمكن توليد ملف تصدير خالٍ من السجلات. يمكنك البدء بإضافة سجل يدوي أو استيراد ملف إلى النظام.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <Link to="/records">
              <Button variant="primary" icon={<Plus size={16} />}>
                {t('addRecord')}
              </Button>
            </Link>
            <Link to="/import">
              <Button variant="secondary" icon={<FileSpreadsheet size={16} />}>
                {t('import')}
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 1. Export Scope */}
          <div className="placeholder-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              {t('exportScope')}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: exportScope === 'all' ? 'var(--primary-light)' : 'var(--bg-main)',
                  border: `1px solid ${exportScope === 'all' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value="all"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    {t('exportScopeAll')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {records.length} {t('recordsCount')}
                  </span>
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: exportScope === 'filtered' ? 'var(--primary-light)' : 'var(--bg-main)',
                  border: `1px solid ${exportScope === 'filtered' ? 'var(--primary)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="radio"
                  name="scope"
                  value="filtered"
                  checked={exportScope === 'filtered'}
                  onChange={() => setExportScope('filtered')}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                    {t('exportScopeFiltered')}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {records.length} {t('recordsCount')} (مع الفلاتر الحالية)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 2. Format Selection */}
          <div className="placeholder-card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.85rem', color: 'var(--text-primary)' }}>
              {t('exportFormat')}
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--primary-light)',
                border: '1px solid var(--primary)',
              }}
            >
              <FileSpreadsheet size={22} style={{ color: 'var(--primary)' }} />
              <div>
                <span style={{ fontWeight: 700, color: 'var(--primary)', display: 'block' }}>
                  {t('exportFormatCsv')}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ترميز UTF-8 مع خاصية BOM لضمان قراءة الحروف العربية والأرقام بدقة تامة في برنامج Excel.
                </span>
              </div>
            </div>
          </div>

          {/* 3. Column Selection */}
          <div className="placeholder-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {t('selectColumns')}
              </h3>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={handleSelectAll}>
                  {t('selectAll')}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleDeselectAll}>
                  {t('deselectAll')}
                </Button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '0.75rem',
              }}
            >
              {standardColumns.map((col) => {
                const isChecked = selectedColumnKeys.includes(col.key);
                return (
                  <label
                    key={col.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'var(--bg-main)' : 'var(--bg-surface)',
                      border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.key)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span>{col.title}</span>
                  </label>
                );
              })}

              {/* Dynamic custom columns */}
              {customColumns.map((col) => {
                const isChecked = selectedColumnKeys.includes(col.id);
                return (
                  <label
                    key={col.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'var(--bg-main)' : 'var(--bg-surface)',
                      border: `1px solid ${isChecked ? 'var(--primary)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleColumn(col.id)}
                      style={{ accentColor: 'var(--primary)', width: '16px', height: '16px' }}
                    />
                    <span>{col.name} (مخصص)</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Export Action Summary & Trigger */}
          <div
            className="placeholder-card"
            style={{
              padding: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                الملخص: سيتم تصدير <strong>{records.length}</strong> سجل متضمناً <strong>{columnsToExport.length}</strong> حقل.
              </span>
            </div>

            <Button
              variant="primary"
              size="lg"
              icon={<Download size={18} />}
              onClick={handleExport}
              isLoading={isExporting}
              disabled={columnsToExport.length === 0}
            >
              {t('downloadCsvBtn')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportPage;
