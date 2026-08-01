import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

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
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.95 }}
              className={`flex items-center gap-3 rounded-lg border p-3 shadow-lg ${colors[toast.type]}`}
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
