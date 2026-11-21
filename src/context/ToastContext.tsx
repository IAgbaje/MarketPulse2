import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

export type ToastTone = 'default' | 'success' | 'warning' | 'danger';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  message: string;
  description?: string;
  tone: ToastTone;
  action?: ToastAction;
  durationMs: number;
}

export interface ShowToastOptions {
  message: string;
  description?: string;
  tone?: ToastTone;
  action?: ToastAction;
  durationMs?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  showToast: (options: ShowToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismissToast = useCallback((id: string) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, description, tone = 'default', action, durationMs }: ShowToastOptions): string => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const effectiveDuration = durationMs ?? (action ? 6000 : 3800);

      const newToast: ToastItem = {
        id,
        message,
        description,
        tone,
        action,
        durationMs: effectiveDuration,
      };

      setToasts((prev) => [...prev.slice(-2), newToast]);

      timersRef.current[id] = setTimeout(() => {
        dismissToast(id);
      }, effectiveDuration);

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
