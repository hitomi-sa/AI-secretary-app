'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import type { MinutesDocument } from '@/types/minutes'

interface MinutesListProps {
  minutes: MinutesDocument[]
  onDelete: (id: string) => Promise<void>
  selectedId?: string
  onSelect?: (id: string) => void
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function StatusBadge({ status }: { status: MinutesDocument['metadata']['status'] }) {
  if (status === 'completed') return null
  const map: Record<string, { label: string; variant: 'warning' | 'destructive' | 'primary' }> = {
    uploading:    { label: 'アップロード中', variant: 'primary' },
    transcribing: { label: '文字起こし中', variant: 'primary' },
    generating:   { label: '生成中', variant: 'primary' },
    failed:       { label: 'エラー', variant: 'destructive' },
  }
  const info = map[status]
  if (!info) return null
  return <Badge variant={info.variant} size="sm">{info.label}</Badge>
}

export function MinutesList({ minutes, onDelete, selectedId, onSelect }: MinutesListProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<MinutesDocument | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleCardClick = (doc: MinutesDocument) => {
    if (onSelect) {
      onSelect(doc.id)
    } else {
      router.push(`/dashboard/documents/minutes/${doc.id}`)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent, doc: MinutesDocument) => {
    e.stopPropagation()
    setDeleteTarget(doc)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await onDelete(deleteTarget.id)
    } finally {
      setIsDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (minutes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center mb-3">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-muted-foreground">
            <path d="M9 12h6M9 16h4M7 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5H7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M15 3v4a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-medium text-foreground">議事録がありません</p>
        <p className="text-xs text-muted-foreground mt-1">音声ファイルをアップロードして作成してください</p>
      </div>
    )
  }

  return (
    <>
      <ul className="flex flex-col gap-2" role="list">
        {minutes.map(doc => {
          const actionCount = doc.metadata.nextActions.length
          const isSelected = selectedId === doc.id

          return (
            <li key={doc.id}>
              <Card
                hoverable
                clickable
                padding="sm"
                onClick={() => handleCardClick(doc)}
                className={cn(
                  'group transition-smooth',
                  isSelected && 'border-primary/60 bg-primary/5',
                )}
                aria-current={isSelected ? 'page' : undefined}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.title || '無題の議事録'}
                      </p>
                      <StatusBadge status={doc.metadata.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDate(doc.created_at)}</p>
                    {actionCount > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        アクション {actionCount}件
                      </p>
                    )}
                  </div>

                  {/* 削除ボタン */}
                  <button
                    type="button"
                    onClick={e => handleDeleteClick(e, doc)}
                    aria-label={`「${doc.title || '無題の議事録'}」を削除`}
                    className={cn(
                      'shrink-0 w-7 h-7 rounded flex items-center justify-center',
                      'text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                      'opacity-0 group-hover:opacity-100 transition-smooth',
                      'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
                    )}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                      <path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5v7a1 1 0 001 1h3a1 1 0 001-1v-7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </Card>
            </li>
          )
        })}
      </ul>

      {/* 削除確認モーダル */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="議事録を削除"
        size="sm"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              キャンセル
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              loading={isDeleting}
            >
              削除する
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">
          「<span className="text-foreground font-medium">{deleteTarget?.title || '無題の議事録'}</span>」を削除しますか？この操作は取り消せません。
        </p>
      </Modal>
    </>
  )
}
