'use client'

import React from 'react'
import type { ResearchMetadata } from '@/types/research'

interface HistoryItem {
  id: string
  title: string
  metadata: ResearchMetadata
  created_at: string
}

interface ResearchHistoryProps {
  history: HistoryItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDelete: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ResearchHistory({ history, selectedId, onSelect, onDelete }: ResearchHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-muted-foreground/40 mb-3" aria-hidden="true">
          <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
          <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <p className="text-sm text-muted-foreground">リサーチ履歴がありません</p>
        <p className="text-xs text-muted-foreground mt-0.5">右のパネルからリサーチを開始</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-2">
      {history.map(item => (
        <div
          key={item.id}
          className={`group relative rounded-lg px-3 py-2.5 cursor-pointer transition-smooth ${
            selectedId === item.id
              ? 'bg-primary/10 border border-primary/20'
              : 'hover:bg-surface-2 border border-transparent'
          }`}
          onClick={() => onSelect(item.id)}
        >
          <p className="text-sm font-medium text-foreground line-clamp-2 pr-6 leading-snug">
            {item.title}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDate(item.created_at)}
          </p>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onDelete(item.id) }}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-smooth p-1"
            aria-label="削除"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
