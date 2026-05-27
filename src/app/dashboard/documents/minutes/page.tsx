'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { AudioUploader } from '@/components/documents/AudioUploader'
import { TranscriptionProgress } from '@/components/documents/TranscriptionProgress'
import { MinutesList } from '@/components/documents/MinutesList'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { useMinutes } from '@/hooks/documents/useMinutes'
import { useTranscription } from '@/hooks/documents/useTranscription'
import type { MinutesStatus } from '@/types/minutes'

type RightPanelView = 'new' | 'progress'

export default function MinutesPage() {
  const router = useRouter()
  const { minutes, fetchList, remove } = useMinutes()
  const { status, progress, error: transcriptionError, startTranscription, stop, reset: resetTranscription } = useTranscription()
  const [rightView, setRightView] = useState<RightPanelView>('new')
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    fetchList()
    return () => {
      stop()
    }
  // fetchList は useCallback で安定しているため依存配列に含める
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUploadComplete = useCallback((documentId: string) => {
    setUploadError(null)
    setRightView('progress')
    startTranscription(documentId)
  }, [startTranscription])

  const handleUploadError = useCallback((message: string) => {
    setUploadError(message)
  }, [])

  const handleTranscriptionCompleted = useCallback(() => {
    // 一覧をリフレッシュして最新の議事録IDを取得し詳細ページへ
    fetchList().then(list => {
      if (list.length > 0) {
        router.push(`/dashboard/documents/minutes/${list[0].id}`)
      }
    })
  }, [fetchList, router])

  // completed になったら詳細ページへ遷移
  useEffect(() => {
    if (status === 'completed') {
      handleTranscriptionCompleted()
    }
  }, [status, handleTranscriptionCompleted])

  const handleDelete = useCallback(async (id: string) => {
    try {
      await remove(id)
      setDeleteError(null)
    } catch {
      setDeleteError('削除に失敗しました')
    }
  }, [remove])

  const handleNewMinutes = () => {
    resetTranscription()
    setUploadError(null)
    setRightView('new')
  }

  const currentStatus: MinutesStatus = status ?? 'uploading'

  return (
    <div className="flex flex-col h-full">
      {/* ページヘッダー */}
      <div className="px-6 py-5 border-b border-border/50 shrink-0">
        <h1 className="text-xl font-semibold text-foreground">議事録</h1>
        <p className="text-sm text-muted-foreground mt-0.5">会議の音声から議事録を自動生成</p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 左パネル: 過去の議事録一覧 */}
        <aside className="w-72 shrink-0 border-r border-border/50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">過去の議事録</span>
            <Button variant="ghost" size="sm" onClick={handleNewMinutes}>
              + 新規作成
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {deleteError && (
              <Alert variant="error" onClose={() => setDeleteError(null)} className="mb-3 text-xs">
                {deleteError}
              </Alert>
            )}
            <MinutesList
              minutes={minutes}
              onDelete={handleDelete}
            />
          </div>
        </aside>

        {/* 右パネル: 新規作成フロー */}
        <main className="flex-1 overflow-y-auto p-6">
          {rightView === 'new' && (
            <div className="max-w-xl mx-auto">
              <div className="mb-5">
                <h2 className="text-base font-semibold text-foreground">新規議事録を作成</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  会議の録音ファイルをアップロードすると、自動で文字起こしと議事録生成を行います
                </p>
              </div>

              {uploadError && (
                <Alert variant="error" onClose={() => setUploadError(null)} className="mb-4">
                  {uploadError}
                </Alert>
              )}

              <AudioUploader
                onUploadComplete={handleUploadComplete}
                onError={handleUploadError}
              />
            </div>
          )}

          {rightView === 'progress' && (
            <div className="max-w-xl mx-auto">
              <div className="mb-5 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-foreground">処理中</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    議事録を生成しています。このまましばらくお待ちください
                  </p>
                </div>
                {currentStatus === 'failed' && (
                  <Button variant="outline" size="sm" onClick={handleNewMinutes}>
                    やり直す
                  </Button>
                )}
              </div>

              <div className="rounded-xl border border-border/50 bg-surface-1 p-5">
                <TranscriptionProgress
                  status={currentStatus}
                  progress={progress}
                  errorMessage={transcriptionError ?? undefined}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
