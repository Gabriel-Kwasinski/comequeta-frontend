import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ToastContext } from './toast-context'
import type { Toast, ToastOptions } from './toast-context'
import { ToastViewport } from './ToastViewport'

let counter = 0
function nextId(): string {
  counter += 1
  return `ds-toast-${counter}`
}

export interface ToastProviderProps {
  children: ReactNode
  /** Max number of simultaneously visible toasts. Default 4. */
  max?: number
}

/**
 * Provides the global toast/snackbar feedback system.
 *
 * Wrap the app once (e.g. in `main.tsx`) and consume via {@link useToast}.
 */
export function ToastProvider({ children, max = 4 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = nextId()
      const toast: Toast = {
        id,
        message,
        title: options.title,
        variant: options.variant ?? 'info',
        duration: options.duration ?? 4000,
      }

      setToasts((prev) => {
        const next = [...prev, toast]
        return next.length > max ? next.slice(next.length - max) : next
      })

      if (toast.duration > 0) {
        const timer = setTimeout(() => dismiss(id), toast.duration)
        timers.current.set(id, timer)
      }
      return id
    },
    [dismiss, max],
  )

  const value = useMemo(
    () => ({
      show,
      success: (message: string, options?: ToastOptions) =>
        show(message, { ...options, variant: 'success' }),
      error: (message: string, options?: ToastOptions) =>
        show(message, { ...options, variant: 'error' }),
      info: (message: string, options?: ToastOptions) =>
        show(message, { ...options, variant: 'info' }),
      warning: (message: string, options?: ToastOptions) =>
        show(message, { ...options, variant: 'warning' }),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  )
}

export default ToastProvider
