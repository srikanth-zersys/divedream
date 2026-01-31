import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Undo2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'undo';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: boolean;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progressWidth, setProgressWidth] = useState(100);

  useEffect(() => {
    if (toast.duration !== 0) {
      const duration = toast.duration || 5000;
      const startTime = Date.now();

      // Progress bar animation
      if (toast.progress || toast.type === 'undo') {
        const progressInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
          setProgressWidth(remaining);
        }, 50);

        setTimeout(() => {
          clearInterval(progressInterval);
        }, duration);
      }

      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, toast.progress, toast.type, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const handleAction = () => {
    toast.action?.onClick();
    handleDismiss();
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
    undo: <Undo2 className="w-5 h-5 text-blue-500" />,
  };

  const backgrounds = {
    success: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
    undo: 'bg-gray-800 border-gray-700 dark:bg-gray-900 dark:border-gray-800',
  };

  const titleColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-amber-800 dark:text-amber-200',
    info: 'text-blue-800 dark:text-blue-200',
    undo: 'text-white',
  };

  const isUndo = toast.type === 'undo';

  return (
    <div
      className={`
        relative overflow-hidden rounded-lg border shadow-lg
        ${backgrounds[toast.type]}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}
      `}
    >
      <div className="flex items-start gap-3 p-4">
        {icons[toast.type]}
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${titleColors[toast.type]}`}>{toast.title}</p>
          {toast.message && (
            <p className={`mt-1 text-sm ${isUndo ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {toast.message}
            </p>
          )}
        </div>
        {toast.action && (
          <button
            onClick={handleAction}
            className={`flex-shrink-0 px-3 py-1 text-sm font-medium rounded transition-colors ${
              isUndo
                ? 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10'
                : 'text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30'
            }`}
          >
            {toast.action.label}
          </button>
        )}
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 p-1 rounded transition-colors ${
            isUndo
              ? 'hover:bg-white/10 text-gray-400'
              : 'hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* Progress bar for undo toasts */}
      {(toast.progress || isUndo) && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10">
          <div
            className={`h-full transition-all duration-100 ${
              isUndo ? 'bg-blue-500' : 'bg-current opacity-30'
            }`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
};

// Toast Hook
let toastId = 0;
let toastListeners: ((toasts: ToastMessage[]) => void)[] = [];
let currentToasts: ToastMessage[] = [];

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...currentToasts]));
};

export const toast = {
  success: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({ id, type: 'success', title, message, duration });
    notifyListeners();
    return id;
  },
  error: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({ id, type: 'error', title, message, duration });
    notifyListeners();
    return id;
  },
  warning: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({ id, type: 'warning', title, message, duration });
    notifyListeners();
    return id;
  },
  info: (title: string, message?: string, duration?: number) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({ id, type: 'info', title, message, duration });
    notifyListeners();
    return id;
  },
  /**
   * Show an undo toast with action button and progress bar
   * @param title - Toast title (e.g., "Booking cancelled")
   * @param onUndo - Callback when user clicks Undo
   * @param duration - Time before auto-dismiss (default 10 seconds)
   * @returns toast ID
   *
   * @example
   * const id = toast.undo('Booking cancelled', async () => {
   *   await restoreBooking(bookingId);
   * });
   */
  undo: (title: string, onUndo: () => void | Promise<void>, duration: number = 10000) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({
      id,
      type: 'undo',
      title,
      message: 'Click Undo to restore',
      duration,
      action: {
        label: 'Undo',
        onClick: onUndo,
      },
      progress: true,
    });
    notifyListeners();
    return id;
  },
  /**
   * Show a custom toast with action button
   */
  custom: (options: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${++toastId}`;
    currentToasts.push({ id, ...options });
    notifyListeners();
    return id;
  },
  dismiss: (id: string) => {
    currentToasts = currentToasts.filter((t) => t.id !== id);
    notifyListeners();
  },
  dismissAll: () => {
    currentToasts = [];
    notifyListeners();
  },
};

export const useToasts = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (newToasts: ToastMessage[]) => setToasts(newToasts);
    toastListeners.push(listener);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener);
    };
  }, []);

  return { toasts, dismiss: toast.dismiss };
};

export default Toast;
