'use client'

import { cn } from '@/lib/utils'
import type { DocumentType } from '@/types/document'

interface Option {
  value: DocumentType
  label: string
  icon:  string
}

const OPTIONS: Option[] = [
  { value: 'email',    label: 'メール',   icon: '✉️' },
  { value: 'report',   label: '報告書',   icon: '📄' },
  { value: 'proposal', label: '提案書',   icon: '💡' },
  { value: 'general',  label: '一般文書', icon: '📝' },
]

interface Props {
  value:    DocumentType
  onChange: (v: DocumentType) => void
}

export function DocumentTypeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all',
            value === opt.value
              ? 'bg-primary/20 border-primary/50 text-primary'
              : 'bg-surface-2 border-border text-muted-foreground hover:text-foreground hover:border-border/80',
          )}
        >
          <span>{opt.icon}</span>
          <span>{opt.label}</span>
        </button>
      ))}
    </div>
  )
}
