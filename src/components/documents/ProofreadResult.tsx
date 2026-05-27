'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { ProofreadResult, Suggestion } from '@/types/document'

const TYPE_CONFIG: Record<Suggestion['type'], { label: string; variant: 'destructive' | 'warning' | 'primary' | 'default' }> = {
  spelling:  { label: '誤字・脱字', variant: 'destructive' },
  grammar:   { label: '文法',       variant: 'warning' },
  style:     { label: '文体',       variant: 'primary' },
  structure: { label: '構成',       variant: 'default' },
}

interface Props {
  result:   ProofreadResult
  original: string
  onApply:  (corrected: string) => void
}

export function ProofreadResultView({ result, original, onApply }: Props) {
  const [tab, setTab] = useState<'diff' | 'corrected' | 'suggestions'>('diff')

  const hasSuggestions = result.suggestions && result.suggestions.length > 0

  return (
    <div className="flex flex-col gap-4">
      {/* サマリー */}
      {result.summary && (
        <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3 text-sm text-foreground">
          {result.summary}
        </div>
      )}

      {/* タブ */}
      <div className="flex gap-1 border-b border-border">
        {[
          { key: 'diff' as const,        label: '変更箇所' },
          { key: 'corrected' as const,   label: '校正後全文' },
          { key: 'suggestions' as const, label: `提案 (${result.suggestions?.length ?? 0})` },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      {tab === 'diff' && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-2 border border-border p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">校正前</p>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {original}
            </pre>
          </div>
          <div className="rounded-lg bg-surface-2 border border-primary/30 p-3">
            <p className="text-xs font-medium text-primary mb-2">校正後</p>
            <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
              {result.corrected}
            </pre>
          </div>
        </div>
      )}

      {tab === 'corrected' && (
        <div className="rounded-lg bg-surface-2 border border-border p-4">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {result.corrected}
          </pre>
        </div>
      )}

      {tab === 'suggestions' && (
        <div className="flex flex-col gap-2">
          {!hasSuggestions && (
            <p className="text-sm text-muted-foreground">指摘事項はありませんでした。</p>
          )}
          {result.suggestions?.map((s) => {
            const cfg = TYPE_CONFIG[s.type] ?? TYPE_CONFIG.style
            return (
              <div key={s.id} className="rounded-lg bg-surface-2 border border-border p-3 flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
                  <span className="text-xs text-muted-foreground">{s.explanation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="line-through text-destructive/80 bg-destructive/10 px-1.5 py-0.5 rounded">
                    {s.original}
                  </span>
                  <span className="text-muted-foreground">→</span>
                  <span className="text-success bg-success/10 px-1.5 py-0.5 rounded">
                    {s.suggested}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 校正文を適用ボタン */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => onApply(result.corrected)}
          className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          校正後の文章を使用
        </button>
      </div>
    </div>
  )
}
