import { useEffect } from 'react';
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
        <button className="toast-close-btn" onClick={() => onRemove(toast.id)}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.8535 12.1462C12.9 12.1927 12.9368 12.2478 12.962 12.3085C12.9871 12.3692 13.0001 12.4343 13.0001 12.5C13.0001 12.5657 12.9871 12.6307 12.962 12.6914C12.9368 12.7521 12.9 12.8073 12.8535 12.8537C12.8071 12.9002 12.7519 12.937 12.6912 12.9622C12.6305 12.9873 12.5655 13.0003 12.4998 13.0003C12.4341 13.0003 12.369 12.9873 12.3083 12.9622C12.2476 12.937 12.1925 12.9002 12.146 12.8537L7.99979 8.70685L3.85354 12.8537C3.75972 12.9475 3.63247 13.0003 3.49979 13.0003C3.36711 13.0003 3.23986 12.9475 3.14604 12.8537C3.05222 12.7599 2.99951 12.6327 2.99951 12.5C2.99951 12.3673 3.05222 12.24 3.14604 12.1462L7.29291 7.99997L3.14604 3.85372C3.05222 3.7599 2.99951 3.63265 2.99951 3.49997C2.99951 3.36729 3.05222 3.24004 3.14604 3.14622C3.23986 3.0524 3.36711 2.99969 3.49979 2.99969C3.63247 2.99969 3.75972 3.0524 3.85354 3.14622L7.99979 7.2931L12.146 3.14622C12.2399 3.0524 12.3671 2.99969 12.4998 2.99969C12.6325 2.99969 12.7597 3.0524 12.8535 3.14622C12.9474 3.24004 13.0001 3.36729 13.0001 3.49997C13.0001 3.63265 12.9474 3.7599 12.8535 3.85372L8.70666 7.99997L12.8535 12.1462Z"
              fill="inherit"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

export default ToastContainer;
