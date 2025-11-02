/**
 * Toast Component
 * Non-intrusive notification system
 */

import { useEffect, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  type: ToastType;
  message: string;
  actionText?: string;
  actionUrl?: string;
  duration?: number; // milliseconds, 0 = no auto-close
  onClose: () => void;
}

export default function Toast({
  type,
  message,
  actionText,
  actionUrl,
  duration = 5000,
  onClose
}: ToastProps) {
  const timerRef = useRef<number | null>(null);
  const latestOnCloseRef = useRef(onClose);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    latestOnCloseRef.current = onClose;
  }, [onClose]);

  const clearExistingTimer = () => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (timeout: number) => {
    if (timeout <= 0) {
      latestOnCloseRef.current();
      return;
    }

    timerRef.current = window.setTimeout(() => {
      latestOnCloseRef.current();
    }, timeout);
  };

  useEffect(() => {
    if (duration > 0) {
      if (!isHoveredRef.current) {
        startTimer(duration);
      }
      return () => {
        clearExistingTimer();
      };
    } else {
      // Infinite: ensure no timers are left running
      clearExistingTimer();
    }
  }, [duration]);

  const handleAction = () => {
    if (actionUrl) {
      chrome.tabs.create({ url: actionUrl });
    }
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />,
    error: <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />,
    info: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
  };

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const handleMouseEnter = () => {
    if (duration <= 0) {
      return;
    }

    clearExistingTimer();
    isHoveredRef.current = true;
  };

  const handleMouseLeave = () => {
    if (duration <= 0) {
      return;
    }

    clearExistingTimer();
    isHoveredRef.current = false;
    startTimer(duration);
  };

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 border rounded-lg shadow-lg p-4 ${bgColors[type]} z-50 animate-slide-up`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-start gap-3">
        {icons[type]}

        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">{message}</p>
          
          {actionText && actionUrl && (
            <button
              onClick={handleAction}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium underline"
            >
              {actionText}
            </button>
          )}
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
