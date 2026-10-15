import { apiClient } from './api';

const SESSION_STORAGE_RECORDS_KEY = 'app-session-records';
const SESSION_STORAGE_COLUMNS_KEY = 'app-session-columns';

export const recordsService = {
  /**
   * Check backend server health
   */
  async checkHealth() {
    try {
      const res = await apiClient.get('/health');
      return res?.status === 'ok';
    } catch {
      return false;
    }
  },

  /**
   * Load records from session cache
   */
  getSessionRecords() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_RECORDS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save records to session cache
   */
  saveSessionRecords(records) {
    try {
      sessionStorage.setItem(SESSION_STORAGE_RECORDS_KEY, JSON.stringify(records));
    } catch (e) {
      console.warn('[recordsService] Failed to save session records:', e);
    }
  },

  /**
   * Load custom columns from session cache
   */
  getSessionColumns() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_COLUMNS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Save custom columns to session cache
   */
  saveSessionColumns(columns) {
    try {
      sessionStorage.setItem(SESSION_STORAGE_COLUMNS_KEY, JSON.stringify(columns));
    } catch (e) {
      console.warn('[recordsService] Failed to save session columns:', e);
    }
  },

  /**
   * Export records array to a formatted CSV blob with UTF-8 BOM
   */
  generateCsvBlob(records, columns) {
    if (!records || records.length === 0) {
      throw new Error('NO_DATA');
    }

    const headers = columns.map((col) => `"${col.title.replace(/"/g, '""')}"`).join(',');
    const rows = records.map((record, index) => {
      return columns
        .map((col) => {
          let val = '';
          if (col.key === 'seq') {
            val = index + 1;
          } else {
            val = record[col.key] ?? record.customValues?.[col.key] ?? '';
          }
          const cleanVal = String(val).replace(/"/g, '""');
          return `"${cleanVal}"`;
        })
        .join(',');
    });

    // Add UTF-8 BOM (\uFEFF) to ensure Arabic text renders properly in Excel
    const csvContent = '\uFEFF' + [headers, ...rows].join('\r\n');
    return new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  },

  /**
   * Trigger browser file download
   */
  triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Safely read sample lines from a file without loading entire large file into RAM
   */
  async readSampleLines(file, maxLines = 5) {
    return new Promise((resolve, reject) => {
      const sliceSize = Math.min(file.size, 64 * 1024); // read only first 64KB
      const reader = new FileReader();
      const blob = file.slice(0, sliceSize);

      reader.onload = (e) => {
        try {
          const text = e.target.result;
          const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
          resolve(lines.slice(0, maxLines));
        } catch (err) {
          reject(err);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob, 'utf-8');
    });
  },
};

export default recordsService;
