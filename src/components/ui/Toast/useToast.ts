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
