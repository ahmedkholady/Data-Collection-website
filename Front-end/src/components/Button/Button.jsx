import React from 'react';
import { Loader2 } from 'lucide-react';
import './Button.css';

/**
 * Reusable Button Component
 * 
 * @param {string} variant - 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'success'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} isLoading - Shows loading spinner and disables click
 * @param {boolean} disabled - Standard disabled state
 * @param {boolean} fullWidth - Takes 100% width of parent container
 * @param {React.ReactNode} icon - Optional icon element to show before children
 * @param {React.ReactNode} iconRight - Optional icon element to show after children
 * @param {string} type - 'button' | 'submit' | 'reset'
 * @param {Function} onClick - Click handler
 * @param {React.ReactNode} children - Button label / content
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  icon,
  iconRight,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const isButtonDisabled = disabled || isLoading;

  const buttonClasses = [
    'custom-btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full-width' : '',
    isLoading ? 'btn-loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isButtonDisabled}
      onClick={onClick}
      {...props}
    >
      {isLoading && (
        <Loader2 className="btn-spinner" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
      )}
      {!isLoading && icon && <span className="btn-icon">{icon}</span>}
      {children && <span className="btn-text">{children}</span>}
      {!isLoading && iconRight && <span className="btn-icon-right">{iconRight}</span>}
    </button>
  );
};

export default Button;
