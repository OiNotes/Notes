"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Edit3 } from 'lucide-react';

export const PinModal = ({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState(false);
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  useEffect(() => {
    inputRefs[0].current?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError(false);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    if (index === 3 && value) {
      const fullPin = [...newPin].join('');
      fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: fullPin }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            onSuccess();
          } else {
            setError(true);
            setTimeout(() => {
              setPin(['', '', '', '']);
              setError(false);
              inputRefs[0].current?.focus();
            }, 800);
          }
        })
        .catch(() => {
          setError(true);
          setTimeout(() => {
            setPin(['', '', '', '']);
            setError(false);
            inputRefs[0].current?.focus();
          }, 800);
        });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm">
      <div className="relative bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] animate-fade-zoom">
        <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
            <Edit3 className="text-amber-500" size={28} />
          </div>
          <h2 className="text-2xl font-lyrics italic text-white mb-2">Доступ в студию</h2>
          <p className="text-white/50 text-sm">Введите 4-значный PIN</p>
        </div>

        <div className="flex gap-4 justify-center mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-14 h-16 text-center text-2xl font-bold bg-white/5 border-2 rounded-xl outline-none transition-all ${error
                ? 'border-red-500 bg-red-500/10 animate-shake'
                : digit
                  ? 'border-amber-500 bg-amber-500/5'
                  : 'border-white/20 focus:border-amber-500/50'
                } text-white`}
            />
          ))}
        </div>

        {error && (
          <p className="text-red-500 text-center text-sm animate-in fade-in duration-200">
            Invalid PIN. Try again.
          </p>
        )}

        <style jsx>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }
        `}</style>
      </div>
    </div>
  );
};
