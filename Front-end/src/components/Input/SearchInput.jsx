import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from './Input';
import './Input.css';

/**
 * Reusable SearchInput Component
 * Built specifically for searching records, phone numbers, and names.
 * 
 * @param {string} value - Controlled search value
 * @param {Function} onChange - Change handler (e) => void
 * @param {Function} onClear - Optional callback when clear button is clicked
 * @param {Function} onSearch - Optional callback when Enter is pressed
 * @param {boolean} isLoading - Shows search loader
 * @param {string} placeholder - Search placeholder text
 */
export const SearchInput = ({
  value = '',
  onChange,
  onClear,
  onSearch,
  isLoading = false,
  placeholder = 'ابحث بالاسم، رقم الهاتف، أو أي حقل...',
  size = 'md',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  const clearIcon = value ? (
    <button
      type="button"
      onClick={handleClear}
      className="search-clear-btn"
      title="مسح البحث"
      aria-label="Clear search"
    >
      <X size={16} />
    </button>
  ) : null;

  const startIcon = isLoading ? (
    <Loader2 size={18} className="search-loading-spinner" />
  ) : (
    <Search size={18} className="search-icon" />
  );

  return (
    <div className={`search-input-wrapper ${className}`}>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        icon={startIcon}
        iconRight={clearIcon}
        size={size}
        fullWidth={fullWidth}
        {...props}
      />
    </div>
  );
};

export default SearchInput;
