import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './Button.css'

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'

export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. */
  variant?: ButtonVariant
  /** Size preset. */
  size?: ButtonSize
  /** Stretch to the full width of the container. */
  fullWidth?: boolean
  /** Render with a fully rounded pill shape (as on the auth screens). */
  pill?: boolean
  /** Optional leading element (e.g. an `<Icon />`). */
  leadingIcon?: ReactNode
  /** Optional trailing element (e.g. an `<Icon />`). */
  trailingIcon?: ReactNode
}

/**
 * Base button primitive for the Comequita design system.
 *
 * @example
 * <Button variant="primary" size="lg" fullWidth>Entrar</Button>
 */
export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  pill = false,
  leadingIcon,
  trailingIcon,
  className,
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  const classes = [
    'ds-button',
    `ds-button--${variant}`,
    `ds-button--${size}`,
    fullWidth ? 'ds-button--full' : '',
    pill ? 'ds-button--pill' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {leadingIcon}
      {children}
      {trailingIcon}
    </button>
  )
}

export default Button
