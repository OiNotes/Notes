"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type TextReaderProps = {
  content: ReactNode;
  title?: string;
};

type FontFamily = "serif" | "sans" | "mono";
type ColorMode = "light" | "dark" | "sepia";

export function TextReader({ content, title = "Читалка" }: TextReaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState<FontFamily>("serif");
  const [colorMode, setColorMode] = useState<ColorMode>("dark");

  // Lock scroll when reader is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const cycleColorMode = () => {
    setColorMode((prev) => {
      if (prev === "dark") return "sepia";
      return "dark";
    });
  };

  const getColorModeLabel = () => {
    if (colorMode === "dark") return "Темный";
    return "Sepia";
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        className="text-reader__trigger"
        onClick={() => setIsOpen(true)}
        aria-label="Читать полностью"
      >
        <BookIcon />
        <span>Читать полностью</span>
      </button>

      {/* Reader Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="text-reader__backdrop"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="text-reader__modal" role="dialog" aria-label={title}>
            {/* Toolbar */}
            <div className="text-reader__toolbar">
              <h2 className="text-reader__title">{title}</h2>

              <div className="text-reader__controls">
                {/* Color Mode Toggle */}
                <button
                  type="button"
                  className="text-reader__btn text-reader__btn--theme"
                  onClick={cycleColorMode}
                  aria-label={`Тема: ${getColorModeLabel()}`}
                  title={`Тема: ${getColorModeLabel()}`}
                >
                  {colorMode === "dark" && <MoonIcon />}
                  {colorMode === "sepia" && <SepiaIcon />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  className="text-reader__close"
                  onClick={() => setIsOpen(false)}
                  aria-label="Закрыть читалку"
                  title="Закрыть"
                >
                  <CloseIcon />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className={`text-reader__content text-reader__content--${colorMode} text-reader__content--${fontFamily}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {content}
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Icons
function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 5v14m-7-7h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5 12h14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SepiaIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 2v2m0 16v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M2 12h2m16 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}
