import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import './Input.css'

export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  /** Visible label rendered above the field. */
  label?: ReactNode
  /** Helper or error message rendered below the field. */
  helpText?: ReactNode
  /** Marks the field as invalid and styles the help text as an error. */
  invalid?: boolean
  /** Element rendered before the input (e.g. an icon). */
  leadingAdornment?: ReactNode
  /** Element rendered after the input (e.g. an icon or button). */
  trailingAdornment?: ReactNode
}

/**
 * Base text input primitive for the Comequita design system.
 *
 * Wires up label/help associations for accessibility automatically.
 *
 * @example
 * <Input label="Email" type="email" placeholder="voce@exemplo.com" />
 */
export function Input({
  label,
  helpText,
  invalid = false,
  leadingAdornment,
  trailingAdornment,
  disabled,
  className,
  id,
  ...rest
}: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const helpId = helpText ? `${inputId}-help` : undefined

  const wrapperClasses = [
    'ds-field',
    invalid ? 'ds-field--invalid' : '',
    disabled ? 'ds-field--disabled' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={wrapperClasses}>
      {label && (
        <label className="ds-field__label" htmlFor={inputId}>
          {label}
          {rest.required && <span className="ds-field__required">*</span>}
        </label>
      )}
      <div className="ds-field__control">
        {leadingAdornment && (
          <span className="ds-field__adornment">{leadingAdornment}</span>
        )}
        <input
          id={inputId}
          className="ds-field__input"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={helpId}
          {...rest}
        />
        {trailingAdornment && (
          <span className="ds-field__adornment">{trailingAdornment}</span>
        )}
      </div>
      {helpText && (
        <span id={helpId} className="ds-field__help">
          {helpText}
        </span>
      )}
    </div>
  )
}

export default Input
