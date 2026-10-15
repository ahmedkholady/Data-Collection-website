import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import '../Input/Input.css';
import './Select.css';

/**
 * Reusable Select Component
 * 
 * @param {string} label - Select label displayed above
 * @param {string} error - Error message displayed below
 * @param {Array<{value: string, label: string}>} options - Array of options
 * @param {string} placeholder - First disabled option placeholder
 * @param {boolean} required - Displays required asterisk *
 * @param {boolean} fullWidth - Takes 100% width
 */
export const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'اختر من القائمة...',
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  id,
  className = '',
  value,
  onChange,
  children,
  ...props
}, ref) => {
  const selectId = id || (label ? `select-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`custom-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className={`input-container select-container input-size-${size} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          value={value}
          onChange={onChange}
          className="custom-select-field"
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
          {children}
        </select>

        <span className="select-arrow-icon">
          <ChevronDown size={18} />
        </span>
      </div>

      {error && (
        <div className="input-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
