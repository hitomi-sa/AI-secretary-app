'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { MinutesDisplay } from '@/components/documents/MinutesDisplay'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useMinutes } from '@/hooks/documents/useMinutes'
import { exportAsTxt, exportAsMarkdown, exportAsPdf } from '@/lib/export/minutesExport'
import type { MinutesDocument, ActionItem } from '@/types/minutes'

interface UpdateData {
  title?: string
  discussedTopics?: string[]
  decisions?: string[]
  nextActions?: ActionItem[]
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function MinutesDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''

  const { fetchOne, update } = useMinutes()
  const [document, setDocument] = useState<MinutesDocument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!id) return
    setIsLoading(true)
    fetchOne(id)
      .then(doc => {
        setDocument(doc)
        setIsLoading(false)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : '議事録の取得に失敗しました')
        setIsLoading(false)
      })
  // fetchOne は useCallback で安定
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // エクスポートメニューの外クリックで閉じる
  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    if (exportMenuOpen) {
      window.document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => window.document.removeEventListener('mousedown', handleOutsideClick)
  }, [exportMenuOpen])

  const handleUpdate = useCallback(async (data: UpdateData) => {
    if (!document) return
    setUpdateError(null)
    try {
      const updated = await update(document.id, data)
      setDocument(updated)
    } catch (err) {
      const msg = err instanceof Error ? err.message : '更新に失敗しました'
      setUpdateError(msg)
      throw err
    }
  }, [document, update])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Alert variant="error" title="読み込みエラー">
          {error ?? '議事録が見つかりませんでした'}
        </Alert>
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/documents/minutes')}>
            一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const hasTranscript = document.original_content && document.original_content.trim().length > 0

  return (
    <div className="flex flex-col h-full">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-border/50 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Link
              href="/dashboard/documents/minutes"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-smooth mb-2"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M8 10L4 6l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              一覧に戻る
            </Link>
            <h1 className="text-lg font-semibold text-foreground truncate">
              {document.title || '無題の議事録'}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              作成日: {formatDate(document.created_at)}
            </p>
          </div>

          {/* エクスポートメニュー */}
          <div className="relative shrink-0" ref={exportMenuRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportMenuOpen(prev => !prev)}
              aria-haspopup="menu"
              aria-expanded={exportMenuOpen}
            >
              エクスポート
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" className="ml-1.5">
                <path d="M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Button>

            {exportMenuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-surface-2 shadow-lg py-1 z-10"
              >
                {[
                  { label: 'テキスト (.txt)', action: () => exportAsTxt(document) },
                  { label: 'Markdown (.md)',  action: () => exportAsMarkdown(document) },
                  { label: 'PDF (印刷)',       action: () => exportAsPdf(document) },
                ].map(({ label, action }) => (
                  <button
                    key={label}
                    role="menuitem"
                    type="button"
                    onClick={() => { action(); setExportMenuOpen(false) }}
                    className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-surface-3 transition-smooth"
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-6">
          {/* 更新エラー */}
          {updateError && (
            <Alert variant="error" onClose={() => setUpdateError(null)}>
              {updateError}
            </Alert>
          )}

          {/* 議事録表示・編集 */}
          <section className="rounded-xl border border-border/50 bg-surface-1 p-5">
            <MinutesDisplay
              document={document}
              onUpdate={handleUpdate}
            />
          </section>

          {/* 文字起こし全文（折りたたみ） */}
          {hasTranscript && (
            <section className="rounded-xl border border-border/50 bg-surface-1 overflow-hidden">
              <button
                type="button"
                onClick={() => setIsTranscriptExpanded(prev => !prev)}
                className="w-full flex items-center justify-between px-5 py-4 text-sm font-medium text-foreground hover:bg-surface-2 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                aria-expanded={isTranscriptExpanded}
              >
                <span>文字起こし全文</span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className={cn('text-muted-foreground transition-transform duration-200', isTranscriptExpanded && 'rotate-180')}
                >
                  <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              {isTranscriptExpanded && (
                <div className="px-5 pb-5 border-t border-border/50">
                  <pre className="mt-4 text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed font-sans">
                    {document.original_content}
                  </pre>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

// cn が必要なため import する（SVGのクラス切り替え用）
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}
