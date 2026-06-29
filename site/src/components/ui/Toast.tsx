import { Toast } from '@base-ui/react/toast';
import type { ToastManager } from '@base-ui/react/toast';

const toastManager: ToastManager = Toast.createToastManager();

if (typeof window !== 'undefined') {
  (window as any).__toastManager = toastManager;
}

const TOAST_ICONS: Record<string, string> = {
  success: '\u2713',
  error: '\u2717',
  info: 'i',
  warning: '!',
};

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <Toast.Root key={toast.id} toast={toast} className={`kb-toast kb-toast--${toast.type ?? 'info'}`}>
          <div className="kb-toast__content">
            <div className="kb-toast__icon">{TOAST_ICONS[toast.type ?? 'info'] ?? 'i'}</div>
            <div className="kb-toast__body">
              {toast.title && <Toast.Title className="kb-toast__title">{toast.title}</Toast.Title>}
              {toast.description && (
                <Toast.Description className="kb-toast__description">{toast.description}</Toast.Description>
              )}
            </div>
            <Toast.Close className="kb-toast__close" aria-label="Dismiss">
              {'\u00d7'}
            </Toast.Close>
          </div>
        </Toast.Root>
      ))}
    </>
  );
}

export function ToastRegion() {
  return (
    <Toast.Provider timeout={5000} limit={3} toastManager={toastManager}>
      <Toast.Portal>
        <Toast.Viewport className="kb-toast__list">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}

export type { ToastManager };
