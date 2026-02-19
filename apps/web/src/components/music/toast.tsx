'use client';

import { useEffect } from 'react';

export function Toast({
  message,
  type = 'error',
  onDismiss,
  duration = 5000,
  action,
}: {
  message: string;
  type?: 'error' | 'info' | 'success';
  onDismiss: () => void;
  duration?: number;
  action?: { label: string; onClick: () => void };
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  const colorMap = {
    error: 'bg-red-500/20 text-red-200 border border-red-500/30',
    success: 'bg-green-500/20 text-green-200 border border-green-500/30',
    info: 'bg-white/10 text-white/90 border border-white/20',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[80] px-4 py-3 rounded-2xl backdrop-blur-xl shadow-2xl text-sm font-medium transition-all ${colorMap[type]}`}
      style={{ animation: 'toast-in 0.3s ease-out forwards' }}
    >
      <div className="flex items-center gap-3">
        <span>{message}</span>
        {action && (
          <button
            onClick={action.onClick}
            className="underline underline-offset-2 font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
          >
            {action.label}
          </button>
        )}
      </div>
      <style jsx>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translate(-50%, 16px); }
          100% { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
