'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'

const EXAMPLES = [
  '生成AIの最新トレンド2025',
  '日本のスタートアップ市場動向',
  'リモートワーク生産性向上の方法',
  'ChatGPTとClaudeの違い',
]

interface ResearchInputProps {
  onSubmit: (query: string) => void
  isLoading: boolean
}

export function ResearchInput({ onSubmit, isLoading }: ResearchInputProps) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q || isLoading) return
    onSubmit(q)
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-base font-semibold text-foreground">新規リサーチ</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          調べたいテーマを入力すると、Webから最新情報を収集して要約します
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="例: 生成AIの最新トレンドについて調べてください"
          rows={3}
          disabled={isLoading}
          className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-surface-2 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 transition-smooth"
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmit(e)
          }}
        />
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">⌘+Enter で実行</p>
          <Button type="submit" size="sm" loading={isLoading} disabled={!query.trim()}>
            {isLoading ? 'リサーチ中...' : 'リサーチ開始'}
          </Button>
        </div>
      </form>

      {/* 例 */}
      <div>
        <p className="text-xs text-muted-foreground mb-2">例:</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map(ex => (
            <button
              key={ex}
              type="button"
              onClick={() => setQuery(ex)}
              disabled={isLoading}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface-3 transition-smooth disabled:opacity-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
