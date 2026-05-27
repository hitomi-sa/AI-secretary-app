'use client'

import React, { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
  maxLength?: number
  autoResize?: boolean
}

export function Textarea({
  label,
  error,
  hint,
  maxLength,
  autoResize = false,
  className,
  id,
  value,
  defaultValue,
  onChange,
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const textareaId = id ?? (label ? `textarea-${label.replace(/\s+/g, '-').toLowerCase()}` : undefined)

  const [charCount, setCharCount] = React.useState<number>(() => {
    if (typeof value === 'string') return value.length
    if (typeof defaultValue === 'string') return defaultValue.length
    return 0
  })

  const adjustHeight = () => {
    const el = textareaRef.current
    if (!el || !autoResize) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    adjustHeight()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, autoResize])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    if (autoResize) adjustHeight()
    onChange?.(e)
  }

  const isNearLimit = maxLength != null && charCount >= Math.floor(maxLength * 0.9)

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-medium text-muted-foreground mb-1 block"
        >
          {label}
        </label>
      )}
      <textarea
        ref={textareaRef}
        id={textareaId}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={cn(
          'w-full bg-input border border-border rounded-[var(--radius)] px-3 py-2 text-sm text-foreground',
          'placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          'transition-all duration-150 ease-out',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          autoResize ? 'resize-none overflow-hidden' : 'resize-none',
          error && 'border-destructive focus:ring-destructive',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          error
            ? `${textareaId}-error`
            : hint
            ? `${textareaId}-hint`
            : undefined
        }
        {...props}
      />
      <div className="flex items-start justify-between mt-1">
        <div className="flex-1">
          {error && (
            <p id={`${textareaId}-error`} className="text-xs text-destructive">
              {error}
            </p>
          )}
          {!error && hint && (
            <p id={`${textareaId}-hint`} className="text-xs text-muted-foreground">
              {hint}
            </p>
          )}
        </div>
        {maxLength != null && (
          <p
            className={cn(
              'text-xs ml-2 shrink-0',
              isNearLimit ? 'text-warning' : 'text-muted-foreground',
            )}
          >
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
