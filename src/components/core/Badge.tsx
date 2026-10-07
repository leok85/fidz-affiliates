import type { ReactNode } from 'react';
import type { Tone } from '../../types';
import { cx } from '../../utils/cx';
import styles from './Badge.module.css';

type Size = 'sm' | 'md' | 'lg';

export function Badge({
  children,
  tone = 'neutral',
  size = 'md',
  className
}: {
  children: ReactNode;
  tone?: Tone;
  size?: Size;
  className?: string;
}) {
  return <span className={cx(styles.badge, styles[`badge_${size}`], styles[`badge_${tone}`], className)}>{children}</span>;
}
