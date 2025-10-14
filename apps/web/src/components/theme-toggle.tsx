"use client";

import { useMemo } from "react";
import { useTheme } from "./theme-provider";

function SunIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <circle cx="12" cy="12" r="4.5" />
      <g strokeWidth="1.4" strokeLinecap="round">
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
        <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
        <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
        <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
      </g>
    </svg>
  );
}

function MoonIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden focusable="false" {...props}>
      <path d="M21 14.35A8.56 8.56 0 0 1 12.65 3 7.5 7.5 0 1 0 21 14.35Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const Icon = useMemo(() => (isDark ? MoonIcon : SunIcon), [isDark]);
  const label = isDark ? "Включить светлую тему" : "Включить тёмную тему";

  const handleClick = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      type="button"
      className={`theme-toggle theme-toggle--${isDark ? "dark" : "light"}`}
      onClick={handleClick}
      aria-label={label}
      title={label}
    >
      <span className="theme-toggle__indicator" aria-hidden />
      <span className="theme-toggle__icon" aria-hidden>
        <Icon />
      </span>
    </button>
  );
}
