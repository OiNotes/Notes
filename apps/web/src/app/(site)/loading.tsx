/**
 * Loading skeleton for (site) route group.
 */
export default function SiteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" aria-busy="true" aria-label="Loading">
      <div className="space-y-6 w-full max-w-2xl px-6">
        {/* Hero skeleton */}
        <div className="h-64 rounded-2xl bg-neutral-800/50 animate-pulse" />
        {/* Title skeleton */}
        <div className="h-8 w-2/3 rounded-lg bg-neutral-800/50 animate-pulse" />
        {/* Body skeleton lines */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-neutral-800/40 animate-pulse" />
          <div className="h-4 w-5/6 rounded bg-neutral-800/40 animate-pulse" />
          <div className="h-4 w-4/6 rounded bg-neutral-800/40 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
