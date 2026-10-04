import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

/**
 * Reusable Modal Component
 * 
 * @param {boolean} isOpen - Controls visibility of the modal
 * @param {Function} onClose - Callback when modal is requested to close (backdrop, X, or Esc)
 * @param {string} title - Header title
 * @param {string} subtitle - Optional header subtitle / description
 * @param {React.ReactNode} footer - Optional footer actions (e.g. Save and Cancel buttons)
 * @param {string} size - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} closeOnOverlayClick - Closes modal when user clicks backdrop (default true)
 * @param {React.ReactNode} children - Modal body contents
 */
export const Modal = ({
  isOpen = false,
  onClose,
  title,
  subtitle,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  children,
  className = '',
}) => {
  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Prevent background page scroll
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick && onClose) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">
      <div className={`modal-container modal-size-${size} ${className}`}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrapper">
            {title && <h3 className="modal-title">{title}</h3>}
            {subtitle && <p className="modal-subtitle">{subtitle}</p>}
          </div>

          {onClose && (
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close modal"
              title="إغلاق"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
