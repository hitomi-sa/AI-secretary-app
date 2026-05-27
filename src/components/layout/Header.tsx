'use client'

import { usePathname } from 'next/navigation'
import UserMenu from './UserMenu'

// Map pathnames to page titles
const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'ダッシュボード',
  '/dashboard/tasks': 'タスク管理',
  '/dashboard/calendar': 'カレンダー',
  '/dashboard/documents/proofread': '文章校正',
  '/dashboard/documents/minutes': '議事録',
  '/dashboard/documents/research': 'リサーチ',
}

function resolveTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  // Fallback: find the closest prefix
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)
  for (const key of sorted) {
    if (pathname.startsWith(key)) return PAGE_TITLES[key]
  }
  return 'AI Secretary'
}

interface HeaderProps {
  onMenuOpen: () => void
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const pathname = usePathname()
  const title = resolveTitle(pathname)

  return (
    <header className="bg-surface-1/80 backdrop-blur-md border-b border-border sticky top-0 z-40 h-14 px-4 flex items-center justify-between">
      {/* Left: hamburger (mobile only) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuOpen}
          className="md:hidden w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-muted-foreground hover:bg-accent hover:text-foreground transition-smooth"
          aria-label="メニューを開く"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M2 4h12M2 8h12M2 12h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Page title */}
        <h1 className="text-sm font-semibold text-foreground">{title}</h1>
      </div>

      {/* Right: UserMenu (desktop — on mobile it's in the Sidebar/MobileMenu) */}
      <div className="hidden md:block">
        <UserMenu />
      </div>
    </header>
  )
}
