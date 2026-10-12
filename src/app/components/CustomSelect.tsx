'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface CustomSelectOption {
  value: string;
  label: string;
  badge?: React.ReactNode;
  sublabel?: string;
}

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  ariaLabel?: string;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  variant?: 'pill' | 'rounded';
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  ariaLabel,
  placeholder = 'Select option...',
  className = '',
  buttonClassName = '',
  menuClassName = '',
  variant = 'rounded',
  size = 'md',
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const heightClass = size === 'sm' ? 'h-8 text-xs' : 'h-10 text-xs sm:text-sm';
  const radiusClass = variant === 'pill' ? 'rounded-full' : 'rounded-xl';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full ${heightClass} ${radiusClass} pl-3.5 pr-9 bg-blue-50/40 border border-blue-100 text-slate-700 font-semibold cursor-pointer transition-all flex items-center justify-between hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-left ${
          isOpen ? 'bg-white ring-2 ring-blue-500/20 border-blue-500 shadow-sm' : ''
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 truncate pr-2">
          {selectedOption?.badge}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-[11px] text-slate-400 font-normal truncate">
              {selectedOption.sublabel}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute top-full left-0 right-0 mt-1.5 z-50 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/10 p-1.5 animate-in fade-in zoom-in-95 duration-150 ${menuClassName}`}
        >
          <div className="max-h-60 overflow-y-auto space-y-0.5 custom-scrollbar">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl text-left flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-blue-50/60 hover:text-blue-600'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    {opt.badge}
                    <div className="truncate">
                      <span className="truncate block">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal block truncate">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
