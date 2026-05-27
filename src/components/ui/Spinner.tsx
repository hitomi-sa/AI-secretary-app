'use client'

import { cn } from '@/lib/utils'

export interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  color?: 'primary' | 'foreground' | 'muted'
  className?: string
}

const sizeMap: Record<NonNullable<SpinnerProps['size']>, number> = {
  xs: 12,
  sm: 16,
  md: 24,
  lg: 32,
}

const colorMap: Record<NonNullable<SpinnerProps['color']>, string> = {
  primary: 'text-primary',
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
}

export function Spinner({
  size = 'md',
  color = 'primary',
  className,
}: SpinnerProps) {
  const px = sizeMap[size]

  return (
    <svg
      role="status"
      aria-label="読み込み中"
      className={cn('animate-spin', colorMap[color], className)}
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="31.416"
        strokeDashoffset="23.562"
        opacity="0.25"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
