'use client'

import { useState } from 'react'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import { DocumentTypeSelector } from '@/components/documents/DocumentTypeSelector'
import { ProofreadResultView } from '@/components/documents/ProofreadResult'
import { ProofreadHistory } from '@/components/documents/ProofreadHistory'
import { useProofread } from '@/hooks/documents/useProofread'
import { useProofreadHistory } from '@/hooks/documents/useProofreadHistory'
import type { DocumentType, ProofreadDocument } from '@/types/document'

const MAX_CHARS = 10000

export default function ProofreadPage() {
  const [text, setText]               = useState('')
  const [docType, setDocType]         = useState<DocumentType>('general')
  const [showHistory, setShowHistory] = useState(false)

  const { result, isLoading, error, proofread, reset } = useProofread()
  const { history, isLoading: histLoading, refetch }   = useProofreadHistory()

  async function handleSubmit() {
    await proofread(text, docType)
    void refetch()
  }

  function handleSelectHistory(doc: ProofreadDocument) {
    setText(doc.original_content)
    setDocType((doc.metadata?.documentType as DocumentType) ?? 'general')
    reset()
    setShowHistory(false)
  }

  function handleApply(corrected: string) {
    setText(corrected)
    reset()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto flex flex-col gap-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">文章校正</h1>
          <p className="text-muted-foreground mt-1 text-sm">AIによる文章の校正・改善</p>
        </div>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          {showHistory ? '← 入力に戻る' : '履歴を見る'}
        </button>
      </div>

      {/* 履歴パネル */}
      {showHistory && (
        <div className="rounded-xl bg-surface-1 border border-border p-4">
          <h2 className="text-sm font-medium text-foreground mb-3">校正履歴</h2>
          <ProofreadHistory
            history={history}
            isLoading={histLoading}
            onSelect={handleSelectHistory}
          />
        </div>
      )}

      {/* 入力エリア */}
      {!showHistory && (
        <>
          <div className="rounded-xl bg-surface-1 border border-border p-4 flex flex-col gap-3">
            {/* 文書タイプ */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-xs font-medium text-muted-foreground">文書タイプ</span>
              <DocumentTypeSelector value={docType} onChange={setDocType} />
            </div>

            {/* テキスト入力 */}
            <div className="relative">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="校正したい文章をここに入力してください..."
                maxLength={MAX_CHARS}
                rows={12}
                className="w-full resize-none rounded-lg bg-surface-2 border border-border px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 leading-relaxed"
              />
              <span className="absolute bottom-2 right-3 text-xs text-muted-foreground">
                {text.length.toLocaleString()} / {MAX_CHARS.toLocaleString()}
              </span>
            </div>

            {/* エラー表示 */}
            {error && <Alert variant="error">{error}</Alert>}

            {/* 実行ボタン */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || text.trim().length === 0}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading && <Spinner size="sm" className="text-white" />}
                {isLoading ? '校正中...' : '校正する'}
              </button>
            </div>
          </div>

          {/* 校正結果 */}
          {result && (
            <div className="rounded-xl bg-surface-1 border border-border p-4">
              <h2 className="text-sm font-medium text-foreground mb-4">校正結果</h2>
              <ProofreadResultView
                result={result}
                original={text}
                onApply={handleApply}
              />
            </div>
          )}
        </>
      )}
    </div>
  )
}
