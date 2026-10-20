import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useRecords } from '../../context/RecordsContext';
import { recordsService } from '../../services/recordsService';
import { Button, Input, SearchInput, Modal, Select, Table } from '../../components';
import {
  Plus,
  Download,
  Phone,
  User,
  SlidersHorizontal,
  Columns3,
  Save,
  MapPin,
  Edit2,
  Trash2,
  Database,
  Briefcase,
  Sparkles,
  AlertCircle,
  X,
  Info,
} from 'lucide-react';
import './RecordsPage.css';

const DATA_SOURCE_OPTIONS = [
  { value: 'إدخال يدوي', label: 'إدخال يدوي / Manual Entry' },
  { value: 'ملف Excel', label: 'ملف Excel / Imported File' },
  { value: 'فيسبوك', label: 'إعلانات فيسبوك / Facebook' },
  { value: 'واتساب', label: 'واتساب / WhatsApp Campaign' },
  { value: 'موقع إلكتروني', label: 'موقع إلكتروني / Website Form' },
  { value: 'أخرى', label: 'أخرى / Other' },
];

export const RecordsPage = () => {
  const { t, dir } = useLanguage();
  const {
    records,
    customColumns,
    dataSources,
    isBackendHealthy,
    addRecord,
    updateRecord,
    deleteRecord,
    addCustomColumn,
    removeCustomColumn,
  } = useRecords();

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Filter state
  const [sourceFilter, setSourceFilter] = useState('');

  // Dynamic custom columns state
  const [newColumnName, setNewColumnName] = useState('');

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    source: 'إدخال يدوي',
    city: '',
    activity: '',
    customValues: {},
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [exportMessage, setExportMessage] = useState('');

  // ── Handlers ──────────────────────────────────────────────

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 200);
  };

  // Add custom column
  const handleAddColumn = (e) => {
    e.preventDefault();
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    const success = addCustomColumn(trimmed);
    if (!success) {
      alert(t('columnExistsError'));
      return;
    }
    setNewColumnName('');
  };

  // Open modal for add
  const handleOpenAdd = () => {
    setEditingRecord(null);
    setFormData({
      phone: '',
      name: '',
      source: 'إدخال يدوي',
      city: '',
      activity: '',
      customValues: {},
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Open modal for edit
  const handleOpenEdit = (record) => {
    setEditingRecord(record);
    const customVals = {};
    customColumns.forEach((col) => {
      customVals[col.id] = record[col.id] || '';
    });
    setFormData({
      phone: record.phone || '',
      name: record.name || '',
      source: record.source || 'إدخال يدوي',
      city: record.city === '—' ? '' : record.city || '',
      activity: record.activity === '—' ? '' : record.activity || '',
      customValues: customVals,
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Delete record
  const handleDeleteRecord = (id) => {
    if (window.confirm(t('confirmDelete'))) {
      deleteRecord(id);
    }
  };

  // Form change
  const handleFormChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Custom field change
  const handleCustomFieldChange = (colKey) => (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      customValues: { ...prev.customValues, [colKey]: val },
    }));
  };

  // Form validation for phone numbers (kept as string)
  const validateForm = () => {
    const errors = {};
    const cleanPhone = formData.phone.trim().replace(/[\s-()]/g, '');
    if (!cleanPhone) {
      errors.phone = t('errorInputMsg');
    } else if (!/^(?:\+?[0-9]{8,15})$/.test(cleanPhone)) {
      errors.phone = t('errorInputMsg');
    }
    if (!formData.name.trim()) {
      errors.name = t('nameRequired');
    }
    return errors;
  };

  // Save record (Add or Edit)
  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 300));

    if (editingRecord) {
      updateRecord(editingRecord.id, {
        phone: formData.phone.trim(),
        name: formData.name.trim(),
        source: formData.source,
        city: formData.city.trim() || '—',
        activity: formData.activity.trim() || '—',
        ...formData.customValues,
      });
    } else {
      addRecord({
        phone: formData.phone.trim(),
        name: formData.name.trim(),
        source: formData.source,
        city: formData.city.trim() || '—',
        activity: formData.activity.trim() || '—',
        customValues: formData.customValues,
      });
    }

    setIsSaving(false);
    setIsAddModalOpen(false);
  };

  // Instant CSV export handler
  const handleExportCsv = () => {
    if (filteredRecords.length === 0) {
      alert(t('noDataToExport'));
      return;
    }

    try {
      const exportCols = [
        { key: 'seq', title: '#' },
        { key: 'phone', title: t('phoneNumber') },
        { key: 'name', title: t('clientName') },
        { key: 'source', title: t('dataSource') },
        { key: 'city', title: t('city') },
        { key: 'activity', title: t('activityType') },
        ...customColumns.map((col) => ({ key: col.id, title: col.name })),
      ];

      const blob = recordsService.generateCsvBlob(filteredRecords, exportCols);
      const filename = `records_export_${new Date().toISOString().slice(0, 10)}.csv`;
      recordsService.triggerDownload(blob, filename);

      setExportMessage(t('exportSuccess'));
      setTimeout(() => setExportMessage(''), 4000);
    } catch (e) {
      alert('Error during export: ' + e.message);
    }
  };

  // Filtered records by search term & source
  const filteredRecords = useMemo(() => {
    let result = records;

    if (sourceFilter) {
      result = result.filter((r) => r.source === sourceFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      result = result.filter((r) => {
        const matchPhone = String(r.phone || '').toLowerCase().includes(term);
        const matchName = String(r.name || '').toLowerCase().includes(term);
        const matchSource = String(r.source || '').toLowerCase().includes(term);
        const matchCity = String(r.city || '').toLowerCase().includes(term);
        const matchActivity = String(r.activity || '').toLowerCase().includes(term);
        const matchCustom = customColumns.some((col) =>
          String(r[col.id] || '').toLowerCase().includes(term)
        );
        return (
          matchPhone ||
          matchName ||
          matchSource ||
          matchCity ||
          matchActivity ||
          matchCustom
        );
      });
    }

    return result;
  }, [records, searchTerm, sourceFilter, customColumns]);

  // Table columns configuration
  const tableColumns = useMemo(() => {
    const base = [
      {
        key: 'seq',
        title: '#',
        sortable: false,
        render: (_val, _row, _idx, globalIndex) => (
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {globalIndex}
          </span>
        ),
      },
      {
        key: 'phone',
        title: t('phoneNumber'),
        sortable: true,
        render: (val) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              direction: 'ltr',
              fontWeight: 600,
              color: 'var(--primary)',
            }}
          >
            <Phone size={14} style={{ opacity: 0.7 }} />
            {val}
          </span>
        ),
      },
      {
        key: 'name',
        title: t('clientName'),
        sortable: true,
        render: (val) => <span style={{ fontWeight: 600 }}>{val}</span>,
      },
      {
        key: 'source',
        title: t('dataSource'),
        sortable: true,
        render: (val) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.65rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: 'var(--bg-main)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Database size={13} style={{ opacity: 0.6 }} />
            {val || '—'}
          </span>
        ),
      },
      {
        key: 'city',
        title: t('city'),
        sortable: true,
        render: (val) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--text-secondary)',
            }}
          >
            <MapPin size={14} style={{ opacity: 0.6 }} />
            {val || '—'}
          </span>
        ),
      },
      {
        key: 'activity',
        title: t('activityType'),
        sortable: true,
        render: (val) => (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 500,
            }}
          >
            <Briefcase size={14} style={{ opacity: 0.6, color: 'var(--primary)' }} />
            {val || '—'}
          </span>
        ),
      },
    ];

    // Dynamic custom columns
    customColumns.forEach((col) => {
      base.push({
        key: col.id,
        title: col.name,
        sortable: true,
        render: (val) => val || <span style={{ color: 'var(--text-muted)' }}>—</span>,
      });
    });

    // Actions column (Edit & Delete)
    base.push({
      key: 'actions',
      title: t('actions'),
      sortable: false,
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <Button
            variant="ghost"
            size="sm"
            icon={<Edit2 size={14} />}
            onClick={() => handleOpenEdit(row)}
            title={t('edit')}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={<Trash2 size={14} style={{ color: '#ef4444' }} />}
            onClick={() => handleDeleteRecord(row.id)}
            title={t('delete')}
          />
        </div>
      ),
    });

    return base;
  }, [t, customColumns]);

  return (
    <div
      className="page-container records-page-container"
    >
      {/* ── Status Banner (Storage notice) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          fontSize: '0.85rem',
          color: 'var(--text-primary)',
        }}
      >
        <Info size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>{t('clientSessionNotice')}</span>
      </div>

      {exportMessage && (
        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            fontSize: '0.875rem',
            fontWeight: 600,
          }}
        >
          ✓ {exportMessage}
        </div>
      )}

      {/* ── Page Header & Top Actions ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {t('records')}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {t('recordsSubtitle')}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Button
            variant="outline"
            icon={<Download size={18} />}
            onClick={handleExportCsv}
          >
            {t('exportExcel')}
          </Button>
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={handleOpenAdd}
          >
            {t('addRecord')}
          </Button>
        </div>
      </div>

      {/* ── Live Search & Filter Bar ── */}
      <div className="placeholder-card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: '1', minWidth: '260px' }}>
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              onClear={() => setSearchTerm('')}
              isLoading={isSearching}
              placeholder={t('searchPlaceholder')}
            />
          </div>

          {/* Source filter */}
          <div style={{ minWidth: '200px' }}>
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            >
              <option value="">{t('allSources')}</option>
              {DATA_SOURCE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(searchTerm || sourceFilter) && (
            <Button
              variant="ghost"
              size="sm"
              icon={<X size={16} />}
              onClick={() => {
                setSearchTerm('');
                setSourceFilter('');
              }}
            >
              {t('clearFilters')}
            </Button>
          )}
        </div>

        {searchTerm && (
          <p
            style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--primary)',
            }}
          >
            🔍 {t('searchingFor')} <strong>"{searchTerm}"</strong>{' '}
            {t('clearSearchHint')}
          </p>
        )}
      </div>

      {/* ── Dynamic Custom Columns Creator ── */}
      <div className="placeholder-card" style={{ padding: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            color: 'var(--primary)',
          }}
        >
          <Columns3 size={18} />
          <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
            {t('customColumnsTitle')}
          </h3>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: 'var(--primary-light)',
              padding: '0.15rem 0.5rem',
              borderRadius: '9999px',
              fontWeight: 600,
            }}
          >
            {t('customBadge')}
          </span>
        </div>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
            marginBottom: '0.85rem',
          }}
        >
          {t('customColumnsDesc')}
        </p>

        <form
          onSubmit={handleAddColumn}
          style={{
            display: 'flex',
            gap: '0.5rem',
            maxWidth: '480px',
            marginBottom: '0.85rem',
          }}
        >
          <Input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder={t('newColumnPlaceholder')}
            size="sm"
          />
          <Button type="submit" variant="primary" size="sm" icon={<Plus size={15} />}>
            {t('addColumnBtn')}
          </Button>
        </form>

        {customColumns.length > 0 && (
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '0.825rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {t('addedColumnsLabel')}
            </span>
            {customColumns.map((col) => (
              <span
                key={col.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  border: '1px solid var(--border-color)',
                }}
              >
                <Sparkles size={12} />
                {col.name}
                <button
                  type="button"
                  onClick={() => removeCustomColumn(col.id)}
                  style={{
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    marginInlineStart: '0.25rem',
                  }}
                  title={t('deleteColumnTitle')}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Interactive Records Data Table ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3
            style={{
              fontSize: '1.15rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
            }}
          >
            {t('recordsTable')} ({filteredRecords.length})
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('sortHint')}
          </span>
        </div>

        <Table
          columns={tableColumns}
          data={filteredRecords}
          emptyText={searchTerm || sourceFilter ? t('noRecordsFound') : t('noRecordsYet')}
          defaultPageSize={10}
        />
      </div>

      {/* ── Add / Edit Record Modal ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSaving && setIsAddModalOpen(false)}
        title={editingRecord ? t('editRecord') : t('addRecord')}
        subtitle={t('modalSubtitle')}
        size="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              icon={<Save size={16} />}
              isLoading={isSaving}
              onClick={handleSave}
            >
              {t('save')}
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* 1. Phone Number */}
          <Input
            label={t('phoneNumber')}
            required
            placeholder={t('phonePlaceholder')}
            icon={<Phone size={16} />}
            helperText={t('phoneHelper')}
            value={formData.phone}
            onChange={handleFormChange('phone')}
            error={formErrors.phone}
          />

          {/* 2. Client Name */}
          <Input
            label={t('clientName')}
            required
            placeholder={t('clientPlaceholder')}
            icon={<User size={16} />}
            value={formData.name}
            onChange={handleFormChange('name')}
            error={formErrors.name}
          />

          {/* 3. Data Source */}
          <Select
            label={t('dataSource')}
            options={DATA_SOURCE_OPTIONS}
            value={formData.source}
            onChange={handleFormChange('source')}
          />

          {/* 4. City */}
          <Input
            label={t('city')}
            placeholder={t('cityPlaceholder')}
            icon={<MapPin size={16} />}
            value={formData.city}
            onChange={handleFormChange('city')}
          />

          {/* 5. Activity Type */}
          <Input
            label={t('activityType')}
            placeholder={t('activityTypePlaceholder')}
            icon={<Briefcase size={16} />}
            value={formData.activity}
            onChange={handleFormChange('activity')}
          />

          {/* Dynamic Inputs for custom columns */}
          {customColumns.map((col) => (
            <Input
              key={col.id}
              label={col.name}
              placeholder={`أدخل ${col.name}...`}
              value={formData.customValues[col.id] || ''}
              onChange={handleCustomFieldChange(col.id)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default RecordsPage;
