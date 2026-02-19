export default function MusicLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        {/* Album art skeleton */}
        <div className="h-64 w-64 animate-pulse rounded-2xl bg-white/5" />
        {/* Track title skeleton */}
        <div className="h-5 w-40 animate-pulse rounded bg-white/10" />
        {/* Artist skeleton */}
        <div className="h-4 w-28 animate-pulse rounded bg-white/5" />
        {/* Progress bar skeleton */}
        <div className="mt-4 h-1 w-72 animate-pulse rounded-full bg-white/10" />
        {/* Controls skeleton */}
        <div className="mt-2 flex gap-8">
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
          <div className="h-12 w-12 animate-pulse rounded-full bg-white/10" />
          <div className="h-10 w-10 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
