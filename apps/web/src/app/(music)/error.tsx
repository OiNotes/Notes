'use client';

import { useEffect } from 'react';

export default function MusicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Music section error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#050505] text-white">
      <h2 className="mb-4 text-2xl font-semibold">Something went wrong</h2>
      <p className="mb-6 max-w-md text-center text-sm text-neutral-400">
        An error occurred while loading the music player. Please try again.
      </p>
      <button
        onClick={reset}
        className="rounded-lg bg-white/10 px-6 py-2.5 text-sm font-medium transition-colors hover:bg-white/20"
      >
        Try again
      </button>
    </div>
  );
}
