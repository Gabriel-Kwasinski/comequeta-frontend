import type { SVGProps } from 'react'
import './Icon.css'

/** Names available in the design-system base icon set (`public/ds-icons.svg`). */
export type IconName =
  | 'check'
  | 'check-circle'
  | 'alert-circle'
  | 'alert-triangle'
  | 'info'
  | 'close'
  | 'search'
  | 'user'
  | 'mail'
  | 'lock'

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  /** Icon identifier from the base icon set. */
  name: IconName
  /** Pixel size applied to both width and height. Defaults to 20. */
  size?: number
  /** Accessible label. When omitted, the icon is hidden from assistive tech. */
  title?: string
}

/**
 * Renders an icon from the design-system SVG sprite.
 *
 * Icons inherit `currentColor`, so colour them via the parent's `color`.
 *
 * @example
 * <Icon name="check-circle" title="Sucesso" />
 */
export function Icon({
  name,
  size = 20,
  title,
  className,
  ...rest
}: IconProps) {
  const classes = ['ds-icon', className ?? ''].filter(Boolean).join(' ')
  return (
    <svg
      className={classes}
      width={size}
      height={size}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      {...rest}
    >
      {title && <title>{title}</title>}
      <use href={`/ds-icons.svg#ds-${name}`} />
    </svg>
  )
}

export default Icon
