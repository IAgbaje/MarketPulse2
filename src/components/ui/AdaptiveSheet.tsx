import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';

interface AdaptiveSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export const AdaptiveSheet: React.FC<AdaptiveSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  maxWidthClass = 'md:max-w-lg',
  children,
}) => {
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title || 'Dialog'}
          className="fixed inset-0 z-[80] flex items-end md:items-center justify-center md:p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-[3px]"
          />

          {/* Sheet / Dialog Surface */}
          <motion.div
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 460, damping: 36 }}
            className={`relative z-10 w-full ${maxWidthClass} bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-slate-900/10 max-h-[88dvh] flex flex-col overflow-hidden pb-safe md:pb-0`}
          >
            {/* Mobile drag handle */}
            <div className="pt-3 pb-1 flex justify-center md:hidden shrink-0">
              <div className="w-10 h-1.5 rounded-full bg-slate-300" />
            </div>

            {(title || subtitle) && (
              <div className="flex items-start justify-between gap-3 px-5 pt-3 pb-3.5 md:pt-5 border-b border-slate-900/8 shrink-0">
                <div className="min-w-0">
                  {title && (
                    <h3 className="font-display font-bold text-lg text-[#111827] leading-snug">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#64748b] mt-0.5 leading-relaxed">{subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="min-w-[40px] min-h-[40px] -mr-2 -mt-1 rounded-full flex items-center justify-center text-[#64748b] hover:text-[#111827] hover:bg-[#eef2f6] transition-colors shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
