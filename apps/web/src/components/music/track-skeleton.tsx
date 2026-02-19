"use client";

import React from 'react';

const TrackSkeletonCard = () => (
  <div className="rounded-[1.5rem] bg-white/5 animate-pulse overflow-hidden">
    <div className="aspect-square bg-white/10" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-white/10 rounded w-3/4" />
      <div className="h-3 bg-white/10 rounded w-1/2" />
    </div>
  </div>
);

export const TrackSkeletonGrid = () => (
  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 auto-rows-[minmax(180px,1fr)] sm:auto-rows-[minmax(200px,1fr)] lg:auto-rows-[minmax(220px,1fr)]">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className={`col-span-1 row-span-1
          ${i === 0 ? 'md:col-span-2 md:row-span-2' : ''}
          ${i > 0 && i < 3 ? 'md:row-span-2' : ''}`}
      >
        <TrackSkeletonCard />
      </div>
    ))}
  </div>
);
