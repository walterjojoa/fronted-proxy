import { useCallback, useRef, useState } from 'react';
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

const TOAST_DURATION_MS = 5000;

const ICONS = {
  success: CircleCheck,
  error: TriangleAlert,
  info: Info,
};

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = 'info', title, message }) => {
      nextId.current += 1;
      const id = nextId.current;
      setToasts((current) => {
        // Avoid stacking the same message again and again (e.g. while the backend is down)
        if (current.some((toast) => toast.title === title && toast.message === message)) {
          return current;
        }
        return [...current, { id, type, title, message }];
      });
      setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast],
  );

  return { toasts, pushToast, dismissToast };
}

export function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] ?? Info;
        return (
          <div key={toast.id} className={`toast toast--${toast.type}`}>
            <Icon size={18} />
            <div className="toast-text">
              <strong>{toast.title}</strong>
              {toast.message && <p>{toast.message}</p>}
            </div>
            <button type="button" className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss">
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
