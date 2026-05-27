'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.97]',
  secondary:
    'bg-secondary text-secondary-foreground hover:opacity-90 active:scale-[0.97]',
  outline:
    'border border-border text-foreground bg-transparent hover:bg-accent active:scale-[0.97]',
  ghost:
    'text-foreground bg-transparent hover:bg-accent active:scale-[0.97]',
  destructive:
    'bg-destructive text-destructive-foreground hover:opacity-90 active:scale-[0.97]',
}

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs rounded',
  md: 'h-10 px-4 text-sm rounded-[var(--radius)]',
  lg: 'h-12 px-6 text-base rounded-[var(--radius-lg)]',
}

const spinnerSizeMap: Record<NonNullable<ButtonProps['size']>, 'xs' | 'sm'> = {
  sm: 'xs',
  md: 'sm',
  lg: 'sm',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-all duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Spinner size={spinnerSizeMap[size]} color="foreground" />
      ) : (
        icon && <span className="shrink-0">{icon}</span>
      )}
      {children}
      {!loading && iconRight && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </button>
  )
}
