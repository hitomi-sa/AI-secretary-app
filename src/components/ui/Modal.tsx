'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
  footer?: React.ReactNode
  hideCloseButton?: boolean
}

const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm:   'w-80',
  md:   'w-[480px]',
  lg:   'w-[640px]',
  xl:   'w-[800px]',
  full: 'w-screen h-screen rounded-none',
}

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  hideCloseButton = false,
}: ModalProps) {
  const uid = React.useId()
  const titleId = `${uid}-modal-title`
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // ESC key handler
  React.useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // body scroll lock
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!mounted || !open) return null

  const isFull = size === 'full'

  return createPortal(
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 animate-fade-in"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        className={cn(
          'fixed z-50 animate-scale-in',
          'bg-card border border-border/50 shadow-xl',
          isFull
            ? 'inset-0 rounded-none'
            : 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl max-h-[90vh] flex flex-col',
          sizeMap[size],
        )}
      >
        {/* Header */}
        {(title || !hideCloseButton) && (
          <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2
                  id={titleId}
                  className="text-base font-semibold text-foreground leading-tight truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
              )}
            </div>
            {!hideCloseButton && (
              <button
                type="button"
                aria-label="閉じる"
                onClick={onClose}
                className={cn(
                  'ml-3 shrink-0 flex items-center justify-center',
                  'w-7 h-7 rounded-full bg-accent/60 text-muted-foreground',
                  'hover:bg-accent hover:text-foreground',
                  'transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <path
                    d="M1 1l10 10M11 1L1 11"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className={cn('overflow-y-auto px-6 pb-5', !isFull && 'flex-1')}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 pb-5 pt-3 border-t border-border/50 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </>,
    document.body,
  )
}
