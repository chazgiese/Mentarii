import { useEffect } from 'react';
import { X } from 'stera-icons';
import type { Toast } from '../types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemoveToast: (id: string) => void;
}

function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemoveToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  useEffect(() => {
    // Show toast after a brief delay
    const showTimer = setTimeout(() => {
      const toastEl = document.querySelector(`[data-toast-id="${toast.id}"]`);
      if (toastEl) {
        toastEl.classList.add('show');
      }
    }, 10);

    // Auto-dismiss non-critical toasts after 3 seconds
    let dismissTimer: number | undefined;
    if (toast.type !== 'critical') {
      dismissTimer = window.setTimeout(() => {
        const toastEl = document.querySelector(`[data-toast-id="${toast.id}"]`);
        if (toastEl) {
          toastEl.classList.remove('show');
          setTimeout(() => {
            onRemove(toast.id);
          }, 400); // Wait for animation
        }
      }, 3000);
    }

    return () => {
      clearTimeout(showTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [toast.id, toast.type, onRemove]);

  const toastClass = `toast toast-${toast.type}`;

  return (
    <div className={toastClass} data-toast-id={toast.id}>
      <div className="toast-message">{toast.message}</div>
      {toast.type === 'critical' && (
        <button className="toast-close-btn" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
          <X size={16} />
        </button>
      )}
    </div>
  );
}

export default ToastContainer;
