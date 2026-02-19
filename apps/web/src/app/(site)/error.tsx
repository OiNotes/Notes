'use client';

/**
 * Error boundary for (site) route group.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="text-6xl font-bold text-neutral-300 dark:text-neutral-600">Ошибка</div>
        <h1 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-200">
          Что-то пошло не так
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
          {error.message || 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.'}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
