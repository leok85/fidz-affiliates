import type { MouseEventHandler, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Button.module.css';

type Variant = 'primary' | 'outline' | 'neutral' | 'reward' | 'danger' | 'onPurple' | 'ghostOnPurple';
type Size = 'sm' | 'md' | 'lg';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  full = false,
  disabled = false,
  onClick,
  className
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  full?: boolean;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={cx(
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        full && styles.button_full,
        disabled && (variant === 'primary' ? styles.button_primaryDisabled : styles.button_disabled),
        className
      )}
    >
      {children}
    </button>
  );
}
