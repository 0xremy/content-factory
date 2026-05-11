import React, { useEffect } from 'react';
import { AlertTriangle, Info, X } from 'lucide-react';

/**
 * ConfirmModal – A custom, styled replacement for window.confirm / window.alert.
 *
 * Props:
 *   isOpen        {boolean}
 *   title         {string}
 *   message       {string}
 *   confirmLabel  {string}   – default "Confirm"
 *   cancelLabel   {string}   – default "Cancel"
 *   variant       {string}   – "danger" | "info"  (controls confirm-button colour)
 *   onConfirm     {() => void}
 *   onCancel      {() => void}  – if omitted, modal has no Cancel button (alert-only)
 */
const ConfirmModal = ({
  isOpen,
  title = 'Confirm',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) => {
  // Trap keyboard: Escape → cancel, Enter → confirm
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape' && onCancel) onCancel();
      if (e.key === 'Enter') onConfirm?.();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onConfirm, onCancel]);

  if (!isOpen) return null;

  const confirmBtnClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : 'bg-blue-600 hover:bg-blue-500 text-white';

  const Icon = variant === 'danger' ? AlertTriangle : Info;
  const iconColor = variant === 'danger' ? 'text-red-400' : 'text-blue-400';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-sm mx-4 bg-dark-900 border border-dark-700/60 rounded-2xl shadow-2xl p-6 animate-slide-up space-y-4">
        {/* Close */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1 text-dark-500 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        )}

        {/* Icon + Title */}
        <div className="flex items-center gap-3">
          <div className={`${iconColor} shrink-0`}>
            <Icon size={22} />
          </div>
          <h3 className="text-white font-bold text-base">{title}</h3>
        </div>

        {/* Message */}
        {message && (
          <p className="text-dark-300 text-sm leading-relaxed">{message}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-dark-300 hover:text-white bg-dark-800 hover:bg-dark-700 rounded-xl transition-all"
            >
              {cancelLabel}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
