'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

export function Input({
  label,
  error,
  hint,
  icon,
  iconRight,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `input-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-muted-foreground mb-1 block"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3 flex items-center pointer-events-none text-muted-foreground">
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(
            'w-full bg-input border border-border rounded-[var(--radius)] h-10 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
            'transition-all duration-150 ease-out',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon ? 'pl-9' : 'px-3',
            iconRight ? 'pr-9' : 'px-3',
            icon && iconRight ? 'pl-9 pr-9' : '',
            !icon && !iconRight && 'px-3',
            error && 'border-destructive focus:ring-destructive',
            className,
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error
              ? `${inputId}-error`
              : hint
              ? `${inputId}-hint`
              : undefined
          }
          {...props}
        />
        {iconRight && (
          <span className="absolute right-3 flex items-center text-muted-foreground">
            {iconRight}
          </span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="text-xs mt-1 text-destructive">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-xs mt-1 text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  )
}
