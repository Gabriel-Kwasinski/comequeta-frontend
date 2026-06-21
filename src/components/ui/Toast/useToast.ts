import { useContext } from 'react'
import { ToastContext } from './toast-context'
import type { ToastContextValue } from './toast-context'

/**
 * Access the global toast/snackbar API for consistent success/error feedback.
 *
 * Must be used within a {@link ToastProvider}.
 *
 * @example
 * const toast = useToast()
 * toast.success('Perfil salvo com sucesso!')
 * toast.error('Não foi possível salvar. Tente novamente.')
 */
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>')
  }
  return ctx
}

/**
 * Like {@link useToast}, but returns `null` instead of throwing when no
 * {@link ToastProvider} is present.
 *
 * Useful for screens that surface toast feedback as an enhancement on top of
 * their own inline messaging: they keep working (without toasts) when rendered
 * outside a provider, e.g. in isolated tests.
 *
 * @example
 * const toast = useOptionalToast()
 * toast?.success('Perfil salvo com sucesso!')
 */
export function useOptionalToast(): ToastContextValue | null {
  return useContext(ToastContext)
}
