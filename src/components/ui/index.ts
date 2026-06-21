/**
 * Comequita Design System — public entry point (SCRUM-26).
 *
 * Import base primitives and the global feedback system from here:
 *
 * @example
 * import { Button, Input, Icon, ToastProvider, useToast } from '@/components/ui'
 */

export { Button } from './Button/Button'
export type { ButtonProps, ButtonVariant, ButtonSize } from './Button/Button'

export { Input } from './Input/Input'
export type { InputProps } from './Input/Input'

export { Icon } from './Icon/Icon'
export type { IconProps, IconName } from './Icon/Icon'

export { ToastProvider } from './Toast/ToastProvider'
export type { ToastProviderProps } from './Toast/ToastProvider'
export { useToast } from './Toast/useToast'
export type {
  ToastOptions,
  ToastVariant,
  ToastContextValue,
} from './Toast/toast-context'
