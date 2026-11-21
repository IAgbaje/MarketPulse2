import React from 'react';

export function formatNairaInput(val: number | '' | null | undefined): string {
  if (val === '' || val === null || val === undefined || Number.isNaN(val)) return '';
  if (val === 0) return '0';
  return Math.round(val).toLocaleString('en-NG');
}

export function parseNairaInput(raw: string): number | '' {
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits) return '';
  const parsed = parseInt(digits, 10);
  return Number.isNaN(parsed) ? '' : parsed;
}

interface NairaInputProps {
  id?: string;
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'right';
  ariaLabel?: string;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Reusable Naira currency input with live accounting thousand-separator formatting (e.g. 200,000).
 */
export const NairaInput: React.FC<NairaInputProps> = ({
  id,
  value,
  onChange,
  placeholder = '0',
  size = 'md',
  align = 'left',
  ariaLabel = 'Amount in Naira',
  className = '',
  autoFocus = false,
  onKeyDown,
}) => {
  const displayValue = formatNairaInput(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = parseNairaInput(e.target.value);
    onChange(next);
  };

  const sizeStyles =
    size === 'lg'
      ? {
          symbol: 'pl-4 text-2xl font-bold text-[#86868b]',
          input: 'pl-11 pr-4 py-3.5 text-3xl font-display font-extrabold rounded-2xl',
        }
      : size === 'sm'
      ? {
          symbol: 'pl-2.5 text-xs font-bold text-[#86868b]',
          input: 'pl-6 pr-2.5 py-2 text-sm font-bold rounded-xl',
        }
      : {
          symbol: 'pl-3.5 text-sm font-bold text-[#86868b]',
          input: 'pl-8 pr-3.5 py-2.5 text-sm font-bold rounded-xl',
        };

  return (
    <div className={`relative w-full ${className}`}>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 flex items-center select-none ${sizeStyles.symbol}`}
      >
        ₦
      </span>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        aria-label={ariaLabel}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={`block w-full font-mono-num tabular-nums border border-black/[0.09] bg-[#f5f5f7] text-[#1d1d1f] placeholder-[#94a3b8] focus:bg-white focus:border-[#00567c] focus:ring-2 focus:ring-[#00567c]/20 outline-none transition-all ${
          sizeStyles.input
        } ${align === 'right' ? 'text-right' : 'text-left'}`}
      />
    </div>
  );
};
