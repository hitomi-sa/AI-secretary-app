'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function UserMenu() {
  const { user, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const initial = user?.email?.[0]?.toUpperCase() ?? 'U'

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    window.document.addEventListener('mousedown', handleClickOutside)
    return () => window.document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-semibold hover:bg-primary/30 transition-smooth"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute bottom-10 left-0 w-48 rounded-lg border border-border bg-surface-2 shadow-lg py-1 z-50">
          {user?.email && (
            <p className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border/50">
              {user.email}
            </p>
          )}
          <button
            type="button"
            onClick={() => { setOpen(false); signOut() }}
            className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-surface-3 transition-smooth"
          >
            サインアウト
          </button>
        </div>
      )}
    </div>
  )
}
