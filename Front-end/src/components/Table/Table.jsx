import React, { useState, useMemo } from 'react';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import './Table.css';

/**
 * Reusable Table Component
 *
 * @param {Array<{key: string, title: string, render?: (val: any, row: any) => React.ReactNode, sortable?: boolean}>} columns
 * @param {Array<Object>} data - Array of record objects
 * @param {boolean} isLoading - Shows loading overlay/state
 * @param {string} emptyText - Text to show when no data
 * @param {number} defaultPageSize - Default rows per page (default 5)
 * @param {boolean} showPagination - Whether to display pagination controls
 */
export const Table = ({
  columns = [],
  data = [],
  isLoading = false,
  emptyText,
  defaultPageSize = 5,
  showPagination = true,
  className = '',
}) => {
  const { dir, t } = useLanguage();

  // Sorting state
  const [sortKey, setSortKey] = useState(null);
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // Sorting logic
  const handleSort = (key, sortable = true) => {
    if (!sortable) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey] ?? '';
      const valB = b[sortKey] ?? '';
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB), 'ar')
        : String(valB).localeCompare(String(valA), 'ar');
    });
  }, [data, sortKey, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    if (!showPagination) return sortedData;
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, showPagination]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Adjust page if data length shrank
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  // RTL chevron icons
  const PrevIcon = dir === 'rtl' ? ChevronRight : ChevronLeft;
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <div className={`custom-table-wrapper ${className}`}>
      {/* Table Container */}
      <div className="table-responsive-container">
        <table className="custom-table">
          <thead>
            <tr>
              {columns.map((col) => {
                const isSorted = sortKey === col.key;
                const canSort = col.sortable !== false;
                return (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key, canSort)}
                    className={canSort ? 'sortable-header' : ''}
                    title={canSort ? t('clickToSort') : undefined}
                  >
                    <div className="th-content">
                      <span>{col.title}</span>
                      {canSort && (
                        <span className="sort-icon-box">
                          {isSorted ? (
                            sortOrder === 'asc' ? (
                              <ArrowUp size={14} className="active-sort" />
                            ) : (
                              <ArrowDown size={14} className="active-sort" />
                            )
                          ) : (
                            <ArrowUpDown size={14} className="idle-sort" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="table-loading-cell">
                  <div className="loading-state">
                    <Loader2 size={24} className="table-spinner" />
                    <span>{t('loadingData')}</span>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-empty-cell">
                  <div className="empty-state">
                    <Inbox size={38} className="empty-icon" />
                    <p>{emptyText || t('noRecordsFound')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr key={row.id || index} className="table-row">
                  {columns.map((col) => (
                    <td key={col.key} className="table-cell">
                      {col.render
                        ? col.render(row[col.key], row, index, (currentPage - 1) * pageSize + index + 1)
                        : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {showPagination && !isLoading && data.length > 0 && (
        <div className="table-pagination">
          <div className="pagination-info">
            <span>
              {t('showingRows')} {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} {t('to')}{' '}
              {Math.min(currentPage * pageSize, sortedData.length)} {t('of')}{' '}
              <strong>{sortedData.length}</strong> {t('recordsCount')}
            </span>
          </div>

          <div className="pagination-controls">
            <div className="page-size-selector">
              <span>{t('perPage')}</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="page-size-select"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="pagination-buttons">
              <button
                type="button"
                className="pagination-btn"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                title={t('prevPage')}
              >
                <PrevIcon size={16} />
              </button>

              <span className="current-page-badge">
                {currentPage} / {totalPages}
              </span>

              <button
                type="button"
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                title={t('nextPage')}
              >
                <NextIcon size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
