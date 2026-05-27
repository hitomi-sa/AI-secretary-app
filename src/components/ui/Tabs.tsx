'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ─── Context ─────────────────────────────────────────────────────────────────

interface TabsContextValue {
  activeValue: string
  setActiveValue: (value: string) => void
  /** uid scoped to this Tabs instance, used to generate stable IDs */
  uid: string
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('Tabs sub-components must be used inside <Tabs>')
  return ctx
}

// Stable helpers for generating matching IDs across trigger / panel
const tabTriggerId  = (uid: string, value: string) => `tab-trigger-${uid}-${value}`
const tabPanelId    = (uid: string, value: string) => `tab-panel-${uid}-${value}`

// ─── Tabs (root) ─────────────────────────────────────────────────────────────

interface TabsProps {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const uid = React.useId()
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const isControlled = value !== undefined
  const activeValue = isControlled ? (value as string) : internalValue

  const setActiveValue = React.useCallback(
    (v: string) => {
      if (!isControlled) setInternalValue(v)
      onValueChange?.(v)
    },
    [isControlled, onValueChange],
  )

  return (
    <TabsContext.Provider value={{ activeValue, setActiveValue, uid }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

// ─── TabsList ────────────────────────────────────────────────────────────────

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        'bg-surface-2 rounded p-1 flex gap-0.5 inline-flex',
        className,
      )}
    >
      {children}
    </div>
  )
}

// ─── TabsTrigger ─────────────────────────────────────────────────────────────

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
  icon?: React.ReactNode
  className?: string
}

function TabsTrigger({ value, children, disabled = false, icon, className }: TabsTriggerProps) {
  const { activeValue, setActiveValue, uid } = useTabsContext()
  const isActive = activeValue === value

  return (
    <button
      id={tabTriggerId(uid, value)}
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={tabPanelId(uid, value)}
      disabled={disabled}
      onClick={() => !disabled && setActiveValue(value)}
      className={cn(
        'px-3 py-1.5 text-sm rounded-sm transition-smooth',
        'flex items-center gap-1.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive
          ? 'bg-surface-4 text-foreground shadow-sm font-medium'
          : 'text-muted-foreground hover:text-foreground',
        disabled && 'opacity-40 cursor-not-allowed',
        !disabled && !isActive && 'cursor-pointer',
        className,
      )}
    >
      {icon && <span className="leading-none">{icon}</span>}
      {children}
    </button>
  )
}

// ─── TabsContent ─────────────────────────────────────────────────────────────

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeValue, uid } = useTabsContext()
  const isActive = activeValue === value

  if (!isActive) return null

  return (
    <div
      id={tabPanelId(uid, value)}
      role="tabpanel"
      aria-labelledby={tabTriggerId(uid, value)}
      tabIndex={0}
      className={cn('animate-fade-in focus-visible:outline-none', className)}
    >
      {children}
    </div>
  )
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export { Tabs, TabsList, TabsTrigger, TabsContent }
export type { TabsProps, TabsTriggerProps, TabsContentProps }
