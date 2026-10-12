'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

export interface CustomDatePickerProps {
  value: string; // 'YYYY-MM-DD'
  onChange: (val: string) => void;
  title?: string;
  placeholder?: string;
  align?: 'left' | 'right';
  variant?: 'pill' | 'form';
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  required?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  title = 'Date',
  placeholder = 'dd/mm/yyyy',
  align = 'left',
  variant = 'form',
  className = '',
  buttonClassName = '',
  disabled = false,
  required = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial view year and month from value if available, else today
  const initialDate = useMemo(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        if (!isNaN(d.getTime())) return d;
      }
    }
    return new Date();
  }, [value]);

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth()); // 0-11
  const [yearPageStart, setYearPageStart] = useState(Math.floor(initialDate.getFullYear() / 12) * 12);

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        const y = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m);
          setYearPageStart(Math.floor(y / 12) * 12);
        }
      }
    }
  }, [value]);

  // Outside click to close popover
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setViewMode('day');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen) {
      setViewMode('day');
      if (value) {
        const parts = value.split('-');
        if (parts.length === 3) {
          const y = Number(parts[0]);
          const m = Number(parts[1]) - 1;
          if (!isNaN(y) && !isNaN(m)) {
            setViewYear(y);
            setViewMonth(m);
            setYearPageStart(Math.floor(y / 12) * 12);
          }
        }
      }
    }
    setIsOpen(!isOpen);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'day') {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    } else if (viewMode === 'month') {
      setViewYear(prev => prev - 1);
    } else if (viewMode === 'year') {
      setYearPageStart(prev => prev - 12);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (viewMode === 'day') {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    } else if (viewMode === 'month') {
      setViewYear(prev => prev + 1);
    } else if (viewMode === 'year') {
      setYearPageStart(prev => prev + 12);
    }
  };

  const handleSelectDate = (y: number, m: number, d: number) => {
    const formatted = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    onChange(formatted);
    setIsOpen(false);
    setViewMode('day');
  };

  const handleSelectToday = (e: React.MouseEvent) => {
    e.stopPropagation();
    const today = new Date();
    handleSelectDate(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
    setViewMode('day');
  };

  const formatDisplay = (val: string) => {
    if (!val) return '';
    const parts = val.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  const MONTH_NAMES = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

  // Calculate calendar grid days (Monday = 0)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const startDayOffset = (firstDayOfMonth + 6) % 7;
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const todayStr = useMemo(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
  }, []);

  const isPill = variant === 'pill';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input for form validation if required */}
      {required && (
        <input 
          type="text" 
          value={value} 
          required 
          readOnly 
          tabIndex={-1} 
          className="sr-only"
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={toggleOpen}
        title={value ? `${title}: ${formatDisplay(value)} (Click to change)` : `Select ${title}`}
        className={`w-full flex items-center justify-between cursor-pointer transition-all text-left group ${
          isPill
            ? `h-10 px-3.5 bg-blue-50/40 hover:bg-white border rounded-full ${
                isOpen
                  ? 'bg-white ring-2 ring-blue-500/20 border-blue-500 shadow-xs'
                  : 'border-blue-100 hover:border-blue-200'
              }`
            : `px-3.5 py-2.5 bg-white hover:bg-blue-50/30 border rounded-xl text-xs font-semibold text-slate-800 ${
                isOpen
                  ? 'bg-white ring-2 ring-blue-500/20 border-blue-500 shadow-xs'
                  : 'border-blue-100 hover:border-blue-200'
              }`
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${buttonClassName}`}
      >
        <div className="flex items-center gap-2 min-w-0 pr-1 truncate">
          <Calendar 
            className={`w-4 h-4 shrink-0 transition-colors ${
              value ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-500'
            }`} 
          />
          {value ? (
            <span className="text-xs sm:text-[13px] font-bold text-slate-800 tracking-tight truncate">
              {formatDisplay(value)}
            </span>
          ) : (
            <span className="text-xs sm:text-[13px] text-slate-400 font-medium truncate">
              {placeholder}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {value && !disabled ? (
            <span
              role="button"
              onClick={handleClear}
              title="Xoá ngày"
              className="p-1 hover:bg-blue-100 text-slate-400 hover:text-slate-700 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          ) : (
            <ChevronDown 
              className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-blue-600' : ''
              }`} 
            />
          )}
        </div>
      </button>

      {/* Popover Calendar Modal */}
      {isOpen && (
        <div 
          className={`absolute top-full ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 z-50 bg-white rounded-2xl border border-blue-100 shadow-xl shadow-blue-500/10 p-3.5 w-[296px] animate-in fade-in zoom-in-95 duration-150 select-none`}
        >
          {/* Calendar Header: Prev / Month Year / Next */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-blue-50">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title={viewMode === 'day' ? 'Tháng trước' : viewMode === 'month' ? 'Năm trước' : '12 năm trước'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Header Title: Day View */}
            {viewMode === 'day' && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('month');
                  }}
                  className="px-2 py-1 rounded-xl hover:bg-blue-50 text-slate-800 hover:text-blue-600 font-extrabold text-sm transition-all flex items-center gap-1 cursor-pointer group/m"
                  title="Thu nhỏ để xem các tháng"
                >
                  <span>{MONTH_NAMES[viewMonth]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover/m:text-blue-600 transition-colors" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearPageStart(Math.floor(viewYear / 12) * 12);
                    setViewMode('year');
                  }}
                  className="px-2 py-1 rounded-xl hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-extrabold text-sm transition-all flex items-center gap-1 cursor-pointer group/y"
                  title="Xem các năm"
                >
                  <span>{viewYear}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400 group-hover/y:text-blue-600 transition-colors" />
                </button>
              </div>
            )}

            {/* Header Title: Month View */}
            {viewMode === 'month' && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewMode('day');
                  }}
                  className="px-2.5 py-1 rounded-xl bg-blue-100 text-blue-700 font-extrabold text-sm flex items-center gap-1 cursor-pointer hover:bg-blue-200 transition-colors"
                  title="Bấm để quay lại xem ngày"
                >
                  <span>{MONTH_NAMES[viewMonth]}</span>
                  <ChevronDown className="w-3.5 h-3.5 rotate-180 transition-transform text-blue-600" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setYearPageStart(Math.floor(viewYear / 12) * 12);
                    setViewMode('year');
                  }}
                  className="px-2 py-1 rounded-xl hover:bg-blue-50 text-blue-600 font-extrabold text-sm flex items-center gap-1 cursor-pointer transition-colors group/my"
                  title="Chọn năm"
                >
                  <span>{viewYear}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400 group-hover/my:text-blue-600 transition-colors" />
                </button>
              </div>
            )}

            {/* Header Title: Year View */}
            {viewMode === 'year' && (
              <div className="flex items-center gap-1">
                <span className="px-2.5 py-1 rounded-xl bg-blue-50 text-blue-800 font-extrabold text-sm">
                  {yearPageStart} - {yearPageStart + 11}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-xl hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
              title={viewMode === 'day' ? 'Tháng sau' : viewMode === 'month' ? 'Năm sau' : '12 năm sau'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day View */}
          {viewMode === 'day' && (
            <>
              {/* Weekday Labels */}
              <div className="grid grid-cols-7 gap-1 mb-1 text-center">
                {WEEKDAYS.map((wd, i) => (
                  <span 
                    key={wd} 
                    className={`text-[11px] font-bold py-1 ${i >= 5 ? 'text-blue-600' : 'text-slate-400'}`}
                  >
                    {wd}
                  </span>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {/* Previous Month trailing days */}
                {Array.from({ length: startDayOffset }).map((_, i) => {
                  const dayNum = daysInPrevMonth - startDayOffset + i + 1;
                  const prevM = viewMonth === 0 ? 11 : viewMonth - 1;
                  const prevY = viewMonth === 0 ? viewYear - 1 : viewYear;
                  return (
                    <button
                      key={`prev-${i}`}
                      type="button"
                      onClick={() => handleSelectDate(prevY, prevM, dayNum)}
                      className="h-8.5 w-8.5 mx-auto text-[13px] font-medium text-slate-300 hover:bg-blue-50/50 hover:text-slate-500 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {dayNum}
                    </button>
                  );
                })}

                {/* Current Month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const currentFormatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                  const isSelected = value === currentFormatted;
                  const isToday = todayStr === currentFormatted;

                  return (
                    <button
                      key={`day-${dayNum}`}
                      type="button"
                      onClick={() => handleSelectDate(viewYear, viewMonth, dayNum)}
                      className={`h-8.5 w-8.5 mx-auto text-[13px] font-semibold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-extrabold shadow-sm shadow-blue-500/30'
                          : isToday
                          ? 'border border-blue-400 text-blue-600 font-bold hover:bg-blue-50'
                          : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {MONTH_NAMES.map((mName, idx) => {
                const isCurrentViewMonth = viewMonth === idx;
                const now = new Date();
                const isThisMonth = now.getMonth() === idx && now.getFullYear() === viewYear;
                return (
                  <button
                    key={mName}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewMonth(idx);
                      setViewMode('day');
                    }}
                    className={`h-11 px-2 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isCurrentViewMonth
                        ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/30'
                        : isThisMonth
                        ? 'border border-blue-400 text-blue-600 font-bold hover:bg-blue-50'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          )}

          {/* Year View */}
          {viewMode === 'year' && (
            <div className="grid grid-cols-3 gap-2 py-1">
              {Array.from({ length: 12 }).map((_, i) => {
                const y = yearPageStart + i;
                const isCurrentYear = viewYear === y;
                const now = new Date();
                const isThisYear = now.getFullYear() === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setViewYear(y);
                      setViewMode('month');
                    }}
                    className={`h-11 px-2 text-xs font-bold rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                      isCurrentYear
                        ? 'bg-blue-600 text-white font-black shadow-sm shadow-blue-500/30'
                        : isThisYear
                        ? 'border border-blue-400 text-blue-600 font-bold hover:bg-blue-50'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Quick Actions */}
          <div className="mt-3 pt-2.5 border-t border-blue-50 flex items-center justify-between text-[13px]">
            <button
              type="button"
              onClick={handleSelectToday}
              className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Hôm nay
            </button>
            {viewMode !== 'day' ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('day');
                }}
                className="text-slate-500 hover:text-blue-600 font-semibold px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer text-xs flex items-center gap-1"
              >
                <span>Xem ngày</span>
                <span>→</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-400 hover:text-rose-600 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer text-xs"
              >
                Xóa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
