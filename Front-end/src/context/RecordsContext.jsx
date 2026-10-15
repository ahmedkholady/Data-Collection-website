import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { recordsService } from '../services/recordsService';

const RecordsContext = createContext();

export const RecordsProvider = ({ children }) => {
  // Records state with session persistence fallback
  const [records, setRecords] = useState(() => {
    return recordsService.getSessionRecords();
  });

  // Dynamic custom columns with session persistence fallback
  const [customColumns, setCustomColumns] = useState(() => {
    return recordsService.getSessionColumns();
  });

  // Backend connection status
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);
  const [isCheckingBackend, setIsCheckingBackend] = useState(true);

  // Sync state to session storage
  useEffect(() => {
    recordsService.saveSessionRecords(records);
  }, [records]);

  useEffect(() => {
    recordsService.saveSessionColumns(customColumns);
  }, [customColumns]);

  // Check backend health on mount
  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const ok = await recordsService.checkHealth();
        if (isMounted) setIsBackendHealthy(ok);
      } catch {
        if (isMounted) setIsBackendHealthy(false);
      } finally {
        if (isMounted) setIsCheckingBackend(false);
      }
    };
    check();
    return () => {
      isMounted = false;
    };
  }, []);

  // Actions
  const addRecord = (recordData) => {
    const newRecord = {
      id: Date.now(),
      phone: recordData.phone.trim(),
      name: recordData.name.trim(),
      source: recordData.source || 'إدخال يدوي',
      city: recordData.city || '—',
      activity: recordData.activity || '—',
      createdAt: new Date().toISOString(),
      ...recordData.customValues,
    };
    setRecords((prev) => [...prev, newRecord]);
    return newRecord;
  };

  const updateRecord = (id, updatedFields) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updatedFields } : r))
    );
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
  };

  const addCustomColumn = (name) => {
    const trimmed = name.trim();
    if (!trimmed) return false;
    const exists = customColumns.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) return false;

    const newCol = { id: `col_${Date.now()}`, name: trimmed };
    setCustomColumns((prev) => [...prev, newCol]);
    return true;
  };

  const removeCustomColumn = (id) => {
    setCustomColumns((prev) => prev.filter((c) => c.id !== id));
  };

  const importBatch = (newRecords) => {
    if (!Array.isArray(newRecords) || newRecords.length === 0) return 0;
    const formatted = newRecords.map((r, idx) => ({
      id: Date.now() + idx,
      phone: String(r.phone || '').trim(),
      name: String(r.name || 'بدون اسم').trim(),
      source: r.source || 'استيراد ملف',
      city: r.city || '—',
      activity: r.activity || '—',
      createdAt: new Date().toISOString(),
      ...r.customValues,
    }));
    setRecords((prev) => [...prev, ...formatted]);
    return formatted.length;
  };

  const clearAllRecords = () => {
    setRecords([]);
  };

  // Distinct sources
  const dataSources = useMemo(() => {
    const sourcesSet = new Set(records.map((r) => r.source).filter(Boolean));
    return Array.from(sourcesSet);
  }, [records]);

  return (
    <RecordsContext.Provider
      value={{
        records,
        customColumns,
        isBackendHealthy,
        isCheckingBackend,
        dataSources,
        addRecord,
        updateRecord,
        deleteRecord,
        addCustomColumn,
        removeCustomColumn,
        importBatch,
        clearAllRecords,
      }}
    >
      {children}
    </RecordsContext.Provider>
  );
};

export const useRecords = () => {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
};

export default RecordsContext;
