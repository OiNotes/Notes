'use client';

import { useEffect } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';

/**
 * ConfirmModal — styled replacement for native confirm().
 */
export function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  isOpen,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
}: {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
}) {
  const trapRef = useFocusTrap(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation dialog"
    >
      <div
        ref={trapRef}
        className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-5 shadow-2xl"
      >
        <p className="text-white text-base leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg font-medium bg-white/10 text-white hover:bg-white/20 border border-white/10 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 rounded-lg font-medium bg-amber-500 text-black hover:bg-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
