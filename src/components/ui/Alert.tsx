'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  variant?: AlertVariant
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

const variantStyles: Record<AlertVariant, string> = {
  info:    'bg-primary/10 border border-primary/20 text-primary',
  success: 'bg-success/10 border border-success/20 text-success',
  warning: 'bg-warning/10 border border-warning/20 text-warning',
  error:   'bg-destructive/10 border border-destructive/20 text-destructive',
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function SuccessIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function WarningIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <path
        d="M7.13 2.5L1.07 13a1 1 0 00.87 1.5h12.12a1 1 0 00.87-1.5L8.87 2.5a1 1 0 00-1.74 0z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0 mt-0.5">
      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const iconMap: Record<AlertVariant, React.ReactNode> = {
  info:    <InfoIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  error:   <ErrorIcon />,
}

export function Alert({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded flex gap-3 p-4',
        variantStyles[variant],
        className,
      )}
    >
      {/* Icon */}
      <span className="leading-none">{iconMap[variant]}</span>

      {/* Content */}
      <div className="flex-1 min-w-0 text-sm">
        {title && (
          <p className="font-semibold leading-snug mb-0.5">{title}</p>
        )}
        <div className={cn(!title && 'leading-snug')}>{children}</div>
      </div>

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          aria-label="閉じる"
          onClick={onClose}
          className={cn(
            'shrink-0 self-start flex items-center justify-center',
            'w-5 h-5 rounded opacity-70 hover:opacity-100',
            'transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path
              d="M1 1l8 8M9 1L1 9"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
