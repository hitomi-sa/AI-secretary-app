'use client'

import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import type { ProofreadDocument } from '@/types/document'

interface Props {
  history:   ProofreadDocument[]
  isLoading: boolean
  onSelect:  (doc: ProofreadDocument) => void
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ja-JP', {
    month: 'numeric',
    day:   'numeric',
    hour:  '2-digit',
    minute: '2-digit',
  })
}

export function ProofreadHistory({ history, isLoading, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        校正履歴はまだありません
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {history.map((doc) => {
        const suggestionCount = doc.metadata?.suggestions?.length ?? 0
        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => onSelect(doc)}
            className={cn(
              'w-full text-left rounded-lg bg-surface-2 border border-border px-4 py-3',
              'hover:border-primary/40 transition-colors group',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                {doc.title}
              </p>
              <span className="text-xs text-muted-foreground shrink-0">
                {formatDate(doc.created_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              指摘 {suggestionCount}件 · {doc.metadata?.documentType ?? '一般文書'}
            </p>
          </button>
        )
      })}
    </div>
  )
}
