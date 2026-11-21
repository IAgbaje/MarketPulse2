import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useToast, ToastTone } from '../../context/ToastContext';

const TONE_STYLES: Record<ToastTone, { icon: string; iconColor: string; ring: string }> = {
  default: {
    icon: 'info',
    iconColor: 'text-[#d4e8f7]',
    ring: 'border-white/10',
  },
  success: {
    icon: 'check_circle',
    iconColor: 'text-[#4ade80]',
    ring: 'border-[#4ade80]/25',
  },
  warning: {
    icon: 'warning',
    iconColor: 'text-[#fbbf24]',
    ring: 'border-[#fbbf24]/25',
  },
  danger: {
    icon: 'error',
    iconColor: 'text-[#f87171]',
    ring: 'border-[#f87171]/25',
  },
};

export const ToastViewport: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 lg:bottom-6 z-[90] flex flex-col items-center sm:items-end gap-2 pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = TONE_STYLES[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 460, damping: 34 }}
              className={`pointer-events-auto w-full max-w-sm bg-[#111827] text-white rounded-2xl shadow-xl border ${style.ring} px-4 py-3 flex items-center justify-between gap-3`}
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 filled ${style.iconColor}`}>
                  {style.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-snug text-white">{toast.message}</p>
                  {toast.description && (
                    <p className="text-xs text-slate-300 leading-snug mt-0.5 truncate">
                      {toast.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {toast.action && (
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      dismissToast(toast.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#d4e8f7] text-[#003852] hover:bg-white text-xs font-bold transition-colors whitespace-nowrap active:scale-95"
                  >
                    {toast.action.label}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
