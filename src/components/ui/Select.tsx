'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
      className={cn('transition-transform duration-200 shrink-0', open && 'rotate-180')}
    >
      <path
        d="M2.5 5l4.5 4.5L11.5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Select({
  options,
  value,
  onChange,
  placeholder = '選択してください',
  label,
  error,
  disabled = false,
  className,
}: SelectProps) {
  const [open, setOpen] = React.useState(false)
  const [focusedIndex, setFocusedIndex] = React.useState(-1)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLUListElement>(null)
  const uid = React.useId()

  const selectedOption = options.find((o) => o.value === value)

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Reset focused index when closing
  React.useEffect(() => {
    if (!open) setFocusedIndex(-1)
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return

    if (!open) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setOpen(true)
        const idx = options.findIndex((o) => o.value === value && !o.disabled)
        setFocusedIndex(idx >= 0 ? idx : 0)
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        setOpen(false)
        break
      case 'ArrowDown': {
        e.preventDefault()
        const nextBase = focusedIndex + 1
        const next = options.findIndex((o, i) => !o.disabled && i >= nextBase)
        if (next >= 0) setFocusedIndex(next)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        const prevBase = focusedIndex <= 0 ? options.length : focusedIndex
        let prev = -1
        for (let i = prevBase - 1; i >= 0; i--) {
          if (!options[i].disabled) { prev = i; break }
        }
        if (prev >= 0) setFocusedIndex(prev)
        break
      }
      case 'Enter':
      case ' ': {
        e.preventDefault()
        if (focusedIndex >= 0 && !options[focusedIndex]?.disabled) {
          onChange?.(options[focusedIndex].value)
          setOpen(false)
        }
        break
      }
    }
  }

  // Scroll focused option into view
  React.useEffect(() => {
    if (open && listRef.current && focusedIndex >= 0) {
      const item = listRef.current.children[focusedIndex] as HTMLElement | undefined
      item?.scrollIntoView({ block: 'nearest' })
    }
  }, [open, focusedIndex])

  const labelId  = `${uid}-label`
  const listboxId = `${uid}-listbox`

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      {label && (
        <label
          id={labelId}
          className="block text-sm font-medium text-foreground mb-1.5"
        >
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-labelledby={label ? labelId : undefined}
        aria-disabled={disabled}
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        onKeyDown={handleKeyDown}
        className={cn(
          'bg-input border border-border rounded h-10 px-3 text-sm text-foreground w-full',
          'flex items-center justify-between gap-2',
          'transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          error && 'border-destructive focus-visible:ring-destructive',
          disabled && 'opacity-40 cursor-not-allowed',
          !disabled && 'cursor-pointer hover:border-border/80',
        )}
      >
        <span className={cn(!selectedOption && 'text-muted-foreground')}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-muted-foreground">
          <ChevronIcon open={open} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <ul
          ref={listRef}
          id={listboxId}
          role="listbox"
          aria-label={label}
          className={cn(
            'absolute w-full mt-1 py-1 z-50',
            'bg-popover border border-border rounded-lg shadow-lg',
            'animate-slide-down',
            'max-h-60 overflow-y-auto',
          )}
        >
          {options.length === 0 ? (
            <li className="px-3 py-2 text-sm text-muted-foreground">
              選択肢がありません
            </li>
          ) : (
            options.map((option, idx) => {
              const isSelected = option.value === value
              const isFocused  = idx === focusedIndex
              return (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled}
                  onMouseEnter={() => !option.disabled && setFocusedIndex(idx)}
                  onClick={() => {
                    if (option.disabled) return
                    onChange?.(option.value)
                    setOpen(false)
                  }}
                  className={cn(
                    'px-3 py-2 text-sm transition-smooth',
                    option.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : 'cursor-pointer',
                    !option.disabled && isFocused && 'bg-accent',
                    isSelected
                      ? 'text-primary font-medium'
                      : 'text-foreground',
                  )}
                >
                  {option.label}
                </li>
              )
            })
          )}
        </ul>
      )}

      {error && (
        <p className="mt-1.5 text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}

export type { SelectOption, SelectProps }
