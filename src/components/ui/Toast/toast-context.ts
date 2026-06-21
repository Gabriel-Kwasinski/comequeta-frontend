import { createContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastOptions {
  /** Visual variant. Defaults to 'info'. */
  variant?: ToastVariant
  /** Optional bold title rendered above the message. */
  title?: string
  /** Auto-dismiss delay in ms. Pass 0 to disable auto-dismiss. Default 4000. */
  duration?: number
}

export interface Toast extends Required<Omit<ToastOptions, 'title'>> {
  id: string
  message: string
  title?: string
}

export interface ToastContextValue {
  /** Show a toast and return its id. */
  show: (message: string, options?: ToastOptions) => string
  /** Convenience helper for success feedback. */
  success: (message: string, options?: ToastOptions) => string
  /** Convenience helper for error feedback. */
  error: (message: string, options?: ToastOptions) => string
  /** Convenience helper for info feedback. */
  info: (message: string, options?: ToastOptions) => string
  /** Convenience helper for warning feedback. */
  warning: (message: string, options?: ToastOptions) => string
  /** Dismiss a toast by id. */
  dismiss: (id: string) => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)
