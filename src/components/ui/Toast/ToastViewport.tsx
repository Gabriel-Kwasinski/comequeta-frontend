import { Icon } from '../Icon/Icon'
import type { IconName } from '../Icon/Icon'
import type { Toast, ToastVariant } from './toast-context'
import './Toast.css'

const VARIANT_ICON: Record<ToastVariant, IconName> = {
  success: 'check-circle',
  error: 'alert-circle',
  warning: 'alert-triangle',
  info: 'info',
}

export interface ToastViewportProps {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

/**
 * Renders the stack of active toasts in a fixed, screen-reader-friendly region.
 * Internal to the toast system — consumers use {@link useToast}.
 */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) return null

  return (
    <div className="ds-toast-viewport" role="region" aria-label="Notificações">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`ds-toast ds-toast--${toast.variant}`}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
        >
          <span className="ds-toast__icon">
            <Icon name={VARIANT_ICON[toast.variant]} size={20} />
          </span>
          <div className="ds-toast__body">
            {toast.title && (
              <strong className="ds-toast__title">{toast.title}</strong>
            )}
            <span className="ds-toast__message">{toast.message}</span>
          </div>
          <button
            type="button"
            className="ds-toast__close"
            aria-label="Fechar notificação"
            onClick={() => onDismiss(toast.id)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default ToastViewport
