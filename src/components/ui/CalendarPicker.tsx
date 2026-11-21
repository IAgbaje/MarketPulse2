import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { AdaptiveSheet } from './AdaptiveSheet';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_HEADERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatMarketDate(date: Date): string {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const dayNum = date.getDate();
  const mon = SHORT_MONTHS[date.getMonth()];

  if (isSameDay(date, today)) {
    return `Today, ${dayNum} ${mon}`;
  }
  if (isSameDay(date, yesterday)) {
    return `Yesterday, ${dayNum} ${mon}`;
  }
  return `${SHORT_DAYS[date.getDay()]}, ${dayNum} ${mon}`;
}

export function parseMarketDate(value: string): Date {
  const today = new Date();
  if (!value) return today;

  const lower = value.toLowerCase();
  if (lower.startsWith('today')) return today;
  if (lower.startsWith('yesterday')) {
    const y = new Date(today);
    y.setDate(today.getDate() - 1);
    return y;
  }

  // Try matching "14 Oct" or "Oct 14, 2023" or ISO
  const direct = new Date(value);
  if (!Number.isNaN(direct.getTime())) return direct;

  const match = value.match(/(\d{1,2})\s+([A-Za-z]{3})/);
  if (match) {
    const d = parseInt(match[1], 10);
    const mIdx = SHORT_MONTHS.findIndex((m) => m.toLowerCase() === match[2].toLowerCase());
    if (mIdx >= 0) {
      return new Date(today.getFullYear(), mIdx, d);
    }
  }

  return today;
}

interface CalendarPickerProps {
  value: string;
  onChange: (formattedDate: string, isoDate: string) => void;
  label?: string;
  compact?: boolean;
  id?: string;
}

export const CalendarPicker: React.FC<CalendarPickerProps> = ({
  value,
  onChange,
  label = 'Date',
  compact = false,
  id = 'market-date-picker-btn',
}) => {
  const [open, setOpen] = useState(false);
  const selectedDate = useMemo(() => parseMarketDate(value), [value]);
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open) {
      setViewYear(selectedDate.getFullYear());
      setViewMonth(selectedDate.getMonth());
    }
  }, [open, selectedDate]);

  // Close desktop popover on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (window.innerWidth >= 768) {
          setOpen(false);
        }
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [open]);

  const today = new Date();

  const handleSelectDate = (date: Date) => {
    const formatted = formatMarketDate(date);
    const iso = date.toISOString().slice(0, 10);
    onChange(formatted, iso);
    setOpen(false);
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(new Date(viewYear, viewMonth, day));
    }
    return cells;
  }, [viewYear, viewMonth]);

  const quickPresets = useMemo(() => {
    const t = new Date();
    const yest = new Date(t);
    yest.setDate(t.getDate() - 1);
    const twoDays = new Date(t);
    twoDays.setDate(t.getDate() - 2);
    // Most recent Saturday (classic Nigerian weekend market day!)
    const lastSat = new Date(t);
    const diffToSat = (t.getDay() + 1) % 7 || 7;
    lastSat.setDate(t.getDate() - diffToSat);

    return [
      { label: 'Today', date: t },
      { label: 'Yesterday', date: yest },
      { label: 'Last Saturday', date: lastSat },
    ];
  }, []);

  const renderCalendarBody = () => (
    <div className="space-y-4 select-none">
      {/* Quick Presets */}
      <div className="flex flex-wrap gap-1.5">
        {quickPresets.map((preset) => {
          const active = isSameDay(preset.date, selectedDate);
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectDate(preset.date)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                active
                  ? 'bg-[#00567c] text-white'
                  : 'bg-[#f2f2f7] text-[#1d1d1f] hover:bg-[#d4e8f7]/60 hover:text-[#00567c]'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Month & Year Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={goPrevMonth}
          aria-label="Previous month"
          className="w-9 h-9 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center text-[#00567c] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_left</span>
        </button>

        <div className="font-display font-bold text-sm text-[#1d1d1f] tracking-tight">
          {MONTHS[viewMonth]} {viewYear}
        </div>

        <button
          type="button"
          onClick={goNextMonth}
          aria-label="Next month"
          className="w-9 h-9 rounded-full hover:bg-[#f2f2f7] flex items-center justify-center text-[#00567c] transition-colors"
        >
          <span className="material-symbols-outlined text-[20px]">chevron_right</span>
        </button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAY_HEADERS.map((wd) => (
          <div key={wd} className="text-[11px] font-semibold text-[#86868b] py-1">
            {wd}
          </div>
        ))}

        {/* Days Grid */}
        {calendarCells.map((cellDate, idx) => {
          if (!cellDate) {
            return <div key={`empty-${idx}`} className="h-9" />;
          }
          const isSelected = isSameDay(cellDate, selectedDate);
          const isTodayCell = isSameDay(cellDate, today);

          return (
            <button
              key={cellDate.toISOString()}
              type="button"
              onClick={() => handleSelectDate(cellDate)}
              className={`relative h-9 w-9 mx-auto rounded-full text-[13px] font-medium font-mono-num flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-[#00567c] text-white font-bold shadow-xs scale-105'
                  : isTodayCell
                  ? 'bg-[#d4e8f7]/70 text-[#00567c] font-bold hover:bg-[#d4e8f7]'
                  : 'text-[#1d1d1f] hover:bg-[#f2f2f7]'
              }`}
            >
              {cellDate.getDate()}
              {isTodayCell && !isSelected && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#00567c]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="relative w-full min-w-0">
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={`w-full text-left transition-all flex items-center justify-between gap-2 ${
          compact
            ? 'px-3 py-2 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebf0] border border-black/[0.06]'
            : 'px-3.5 py-2.5 rounded-xl bg-[#f5f5f7] hover:bg-[#ebebf0] border border-black/[0.06] focus-visible:ring-2 focus-visible:ring-[#00567c]'
        }`}
      >
        <div className="min-w-0">
          {label && (
            <span className="text-[11px] font-semibold text-[#6e6e73] flex items-center gap-1 mb-0.5">
              <span className="material-symbols-outlined text-[14px] text-[#00567c]">
                calendar_month
              </span>
              <span>{label}</span>
            </span>
          )}
          <span className="block text-sm font-semibold text-[#1d1d1f] truncate">
            {value || formatMarketDate(today)}
          </span>
        </div>
        <span className="material-symbols-outlined text-[18px] text-[#86868b] shrink-0">
          unfold_more
        </span>
      </button>

      {/* Desktop Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 480, damping: 34 }}
            className="hidden md:block absolute left-0 top-full mt-2 w-[312px] bg-white/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl shadow-black/12 border border-black/[0.08] z-50"
          >
            {renderCalendarBody()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Native Bottom Sheet */}
      <div className="md:hidden">
        <AdaptiveSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Pick Market Day"
          subtitle="Choose when you went to the market"
        >
          <div className="pb-2">{renderCalendarBody()}</div>
        </AdaptiveSheet>
      </div>
    </div>
  );
};
