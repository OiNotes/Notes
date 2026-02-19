"use client";

import React from 'react';
import type { CategoryFilter } from '../../types/music';

export const CategoryTabs = ({
  active,
  onChange
}: {
  active: CategoryFilter;
  onChange: (cat: CategoryFilter) => void;
}) => {
  const tabs: { id: CategoryFilter; label: string }[] = [
    { id: 'visual', label: 'Визуализация' },
    { id: 'all', label: 'Ваши песни' },
    { id: 'yours', label: 'Мои песни' }
  ];

  const getIndicatorStyle = () => {
    const positions = { visual: 0, all: 33.33, yours: 66.66 };
    return {
      transform: `translateX(${positions[active]}%)`,
      width: 'calc(33.33% - 4px)'
    };
  };

  return (
    <div className="w-full max-w-[480px] mx-auto px-4 sm:px-0">
      {/* Apple Glass Container */}
      <div className="relative flex items-center p-1.5 rounded-2xl h-[44px]
        bg-white/[0.08] backdrop-blur-xl
        border border-white/[0.12]
        shadow-[0_4px_24px_-4px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.1)]
        overflow-hidden"
      >
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

        {/* Sliding Glass Indicator */}
        <div
          className="absolute top-1.5 bottom-1.5 left-1.5 rounded-xl
            bg-white/[0.15] backdrop-blur-sm
            border border-white/[0.15]
            shadow-[0_2px_8px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.2)]
            transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]"
          style={getIndicatorStyle()}
        />

        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 relative z-10 text-[13px] font-semibold text-center py-2
              transition-all duration-300 ease-out
              ${active === tab.id
                ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]'
                : 'text-white/50 hover:text-white/70 active:scale-95'}`}
          >
            <span className={`transition-transform duration-300 inline-block
              ${active === tab.id ? 'scale-105' : 'scale-100'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
