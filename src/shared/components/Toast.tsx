import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

import { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const TOAST_DISMISS_MS = 4000;

let toastId = 0;
let listeners: ((toast: Toast) => void)[] = [];

export const showToast = (message: string, type: ToastType = 'info') => {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((l) => l(toast));
};

/** Convenience helpers for common toast patterns */
export const showSuccess = (message: string) => showToast(message, 'success');
export const showError = (message: string) => showToast(message, 'error');
export const showInfo = (message: string) => showToast(message, 'info');

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success:
    'border-success/30 bg-success/10 text-success dark:border-success/40 dark:bg-success/15 dark:text-success',
  error:
    'border-error/30 bg-error/10 text-error dark:border-error/40 dark:bg-error/15 dark:text-error',
  info: 'border-primary/30 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15 dark:text-primary',
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const timeouts = new Map<number, ReturnType<typeof setTimeout>>();

    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast]);
      timeouts.set(
        toast.id,
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== toast.id));
          timeouts.delete(toast.id);
        }, TOAST_DISMISS_MS)
      );
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
      timeouts.forEach((t) => clearTimeout(t));
      timeouts.clear();
    };
  }, []);

  const dismiss = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div
      className="fixed top-4 right-4 z-[200] space-y-2 max-w-sm"
      aria-live="polite"
      aria-atomic="false"
      role="status"
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <motion.div
              key={toast.id}
              initial={prefersReduced ? false : { opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={prefersReduced ? undefined : { opacity: 0, x: 50, scale: 0.95 }}
              transition={{ duration: prefersReduced ? 0 : undefined }}
              className={`flex items-center gap-3 rounded-[var(--radius-card)] border p-3 shadow-lg ${colors[toast.type]}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium flex-1">{toast.message}</span>
              <button
                onClick={() => dismiss(toast.id)}
                className="shrink-0 opacity-60 hover:opacity-100"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
