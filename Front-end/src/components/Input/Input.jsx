import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import './Input.css';

/**
 * Reusable Input Component
 * 
 * @param {string} label - Input label displayed above
 * @param {string} error - Error message displayed below (turns border red)
 * @param {string} helperText - Helpful hint displayed below
 * @param {React.ReactNode} icon - Icon displayed at the start of input
 * @param {React.ReactNode} iconRight - Icon displayed at the end of input
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - Takes 100% width of parent
 * @param {boolean} required - Displays required asterisk *
 */
export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon,
  iconRight,
  size = 'md',
  fullWidth = true,
  required = false,
  disabled = false,
  id,
  className = '',
  type = 'text',
  ...props
}, ref) => {
  const inputId = id || (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined);

  return (
    <div className={`custom-input-wrapper ${fullWidth ? 'full-width' : ''} ${className}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
          {required && <span className="required-star">*</span>}
        </label>
      )}

      <div className={`input-container input-size-${size} ${error ? 'has-error' : ''} ${disabled ? 'is-disabled' : ''}`}>
        {icon && <span className="input-icon-start">{icon}</span>}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          className="custom-input-field"
          {...props}
        />

        {iconRight && <span className="input-icon-end">{iconRight}</span>}
      </div>

      {error ? (
        <div className="input-error-msg">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      ) : helperText ? (
        <span className="input-helper-text">{helperText}</span>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
