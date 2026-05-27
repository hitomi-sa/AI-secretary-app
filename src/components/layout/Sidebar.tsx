'use client'

import { usePathname } from 'next/navigation'
import NavigationItem from './NavigationItem'
import UserMenu from './UserMenu'

// ─── Inline SVG icons (16×16) ──────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 1.5L1.5 7v7.5h4.75v-4.25h3.5V14.5H14.5V7L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M4.5 8l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="2" y="3.5" width="12" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 2v3M10.5 2v3M2 7.5h12" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M10.5 2.5l3 3L5 14H2v-3L10.5 2.5z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="5.5" y="1.5" width="5" height="7" rx="2.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M3 8.5a5 5 0 0 0 10 0M8 13.5v1.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M10.5 10.5l3 3" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  )
}

// ─── Nav items ──────────────────────────────────────────────────────────────

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: <HomeIcon /> },
  { href: '/dashboard/tasks', label: 'タスク管理', icon: <CheckIcon /> },
  { href: '/dashboard/calendar', label: 'カレンダー', icon: <CalendarIcon /> },
  { href: '/dashboard/documents/proofread', label: '文章校正', icon: <PenIcon /> },
  { href: '/dashboard/documents/minutes', label: '議事録', icon: <MicIcon /> },
  { href: '/dashboard/documents/research', label: 'リサーチ', icon: <SearchIcon /> },
] as const

// ─── Sidebar ────────────────────────────────────────────────────────────────

interface SidebarProps {
  className?: string
}

export default function Sidebar({ className = '' }: SidebarProps) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={`bg-surface-1 border-r border-border h-full flex flex-col w-60 ${className}`}
    >
      {/* App name / logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-border flex-shrink-0">
        {/* Simple SVG logo */}
        <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-primary flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="6" r="2.5" stroke="white" strokeWidth="1.5" />
            <path d="M3 14c0-2.761 2.239-5 5-5s5 2.239 5 5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight">AI Secretary</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 flex flex-col gap-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavigationItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={isActive(item.href)}
          />
        ))}
      </nav>

      {/* User menu */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-3 flex-shrink-0">
        <UserMenu />
        <span className="text-xs text-muted-foreground truncate">アカウント</span>
      </div>
    </aside>
  )
}
