import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Button, Input, SearchInput, Modal, Select, Table } from '../components';
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
} from 'lucide-react';

// Common sources for data collection
const DATA_SOURCE_OPTIONS = [
  { value: 'إدخال يدوي', label: 'إدخال يدوي / Manual Entry' },
  { value: 'ملف Excel', label: 'ملف Excel / Imported File' },
  { value: 'فيسبوك', label: 'إعلانات فيسبوك / Facebook' },
  { value: 'واتساب', label: 'واتساب / WhatsApp Campaign' },
  { value: 'موقع إلكتروني', label: 'موقع إلكتروني / Website Form' },
  { value: 'أخرى', label: 'أخرى / Other' },
];

// Initial empty records - awaiting client Excel import or manual entry
const INITIAL_RECORDS = [];

export const RecordsPage = () => {
  const { t } = useLanguage();

  // Records state
  const [records, setRecords] = useState(INITIAL_RECORDS);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Dynamic custom columns state (Jimmy's feature)
  const [newColumnName, setNewColumnName] = useState('');
  const [customColumns, setCustomColumns] = useState([]);

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

  // ── Handlers ──────────────────────────────────────────────

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 250);
  };

  // Add custom column
  const handleAddColumn = (e) => {
    e.preventDefault();
    const trimmed = newColumnName.trim();
    if (!trimmed) return;
    if (customColumns.some((col) => col.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(t('columnExistsError'));
      return;
    }
    const newColKey = `col_${Date.now()}`;
    setCustomColumns([...customColumns, { id: newColKey, name: trimmed }]);
    setNewColumnName('');
  };

  // Remove custom column
  const handleRemoveColumn = (idToRemove) => {
    setCustomColumns(customColumns.filter((col) => col.id !== idToRemove));
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
    setFormData({
      phone: record.phone || '',
      name: record.name || '',
      source: record.source || 'إدخال يدوي',
      city: record.city || '',
      activity: record.activity || '',
      customValues: { ...record },
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  // Delete record
  const handleDeleteRecord = (id) => {
    if (window.confirm(t('confirmDelete'))) {
      setRecords((prev) => prev.filter((r) => r.id !== id));
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

  // Form validation for Saudi mobile numbers (+9665xxxxxxxx, 009665xxxxxxxx, 05xxxxxxxx)
  const validateForm = () => {
    const errors = {};
    const cleanPhone = formData.phone.trim().replace(/[\s-()]/g, '');
    if (!cleanPhone) {
      errors.phone = t('errorInputMsg');
    } else if (!/^(?:\+966|00966|966|0)?5[0-9]{8}$/.test(cleanPhone)) {
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
    await new Promise((res) => setTimeout(res, 500));

    if (editingRecord) {
      // Update existing
      setRecords((prev) =>
        prev.map((r) =>
          r.id === editingRecord.id
            ? {
                ...r,
                phone: formData.phone,
                name: formData.name,
                source: formData.source,
                city: formData.city,
                activity: formData.activity,
                ...formData.customValues,
              }
            : r
        )
      );
    } else {
      // Add to the VERY END of the list as requested!
      const newRec = {
        id: Date.now(),
        phone: formData.phone,
        name: formData.name,
        source: formData.source,
        city: formData.city || '—',
        activity: formData.activity || '—',
        ...formData.customValues,
      };
      setRecords((prev) => [...prev, newRec]);
    }

    setIsSaving(false);
    setIsAddModalOpen(false);
  };

  // Filtered records by search term
  const filteredRecords = useMemo(() => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase().trim();
    return records.filter((r) => {
      const matchPhone = r.phone?.toLowerCase().includes(term);
      const matchName = r.name?.toLowerCase().includes(term);
      const matchSource = r.source?.toLowerCase().includes(term);
      const matchCity = r.city?.toLowerCase().includes(term);
      const matchActivity = r.activity?.toLowerCase().includes(term);
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
  }, [records, searchTerm, customColumns]);

  // Exact columns configuration requested by Jimmy
  const tableColumns = useMemo(() => {
    const base = [
      {
        key: 'seq',
        title: '#',
        sortable: false,
        // Sequential numbering 1, 2, 3... across all pages!
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

    // Append dynamic custom columns added by client
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
      className="page-container"
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
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
            onClick={() =>
              alert(`سيتم تصدير ${filteredRecords.length} سجل كملف Excel`)
            }
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
          <div style={{ flex: '1', minWidth: '280px' }}>
            <SearchInput
              value={searchTerm}
              onChange={handleSearchChange}
              onClear={() => setSearchTerm('')}
              isLoading={isSearching}
              placeholder={t('searchPlaceholder')}
            />
          </div>
          <Button variant="secondary" icon={<SlidersHorizontal size={18} />}>
            {t('filterBtn')}
          </Button>
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

      {/* ── Dynamic Custom Columns Creator (Jimmy's Feature) ── */}
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
                  onClick={() => handleRemoveColumn(col.id)}
                  style={{
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '1rem',
                    lineHeight: 1,
                    display: 'flex',
                    alignItems: 'center',
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
          emptyText={searchTerm ? t('noRecordsFound') : t('noRecordsYet')}
          defaultPageSize={5}
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

          {/* Dynamic Inputs for custom columns if any exist */}
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
