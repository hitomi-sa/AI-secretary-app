'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { ResearchInput } from '@/components/research/ResearchInput'
import { ResearchResult } from '@/components/research/ResearchResult'
import { ResearchHistory } from '@/components/research/ResearchHistory'
import { Alert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import { useResearch } from '@/hooks/research/useResearch'
import { useResearchHistory } from '@/hooks/research/useResearchHistory'
import type { ResearchSummary, ResearchSource } from '@/types/research'

interface LoadedResult {
  id: string
  query: string
  summary: ResearchSummary
  sources: ResearchSource[]
}

export default function ResearchPage() {
  const { isLoading, error, result, runResearch, reset } = useResearch()
  const { history, fetchHistory, remove } = useResearchHistory()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadedResult, setLoadedResult] = useState<LoadedResult | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    fetchHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 新規リサーチ完了後、履歴を更新
  useEffect(() => {
    if (result) {
      fetchHistory()
      setSelectedId(result.id)
      setLoadedResult(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result])

  const handleSelect = useCallback(async (id: string) => {
    if (id === selectedId) return
    setSelectedId(id)
    setLoadingDetail(true)
    reset()
    try {
      const res = await fetch(`/api/research/${id}`)
      if (res.ok) {
        const data = await res.json() as {
          title: string
          processed_content: string
          metadata: { query: string; sources: ResearchSource[] }
        }
        setLoadedResult({
          id,
          query: data.metadata.query,
          summary: JSON.parse(data.processed_content) as ResearchSummary,
          sources: data.metadata.sources,
        })
      }
    } finally {
      setLoadingDetail(false)
    }
  }, [selectedId, reset])

  const handleDelete = useCallback(async (id: string) => {
    await remove(id)
    if (selectedId === id) {
      setSelectedId(null)
      setLoadedResult(null)
      reset()
    }
  }, [selectedId, remove, reset])

  const handleNewResearch = () => {
    setSelectedId(null)
    setLoadedResult(null)
    reset()
  }

  // 表示するリサーチ結果
  const displayResult: LoadedResult | null = result
    ? {
        id: result.id,
        query: history.find(h => h.id === result.id)?.metadata?.query ?? '',
        summary: result.summary,
        sources: result.sources,
      }
    : loadedResult

  const isBusy = isLoading || loadingDetail

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-5 border-b border-border/50 shrink-0">
        <h1 className="text-xl font-semibold text-foreground">リサーチ</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Web検索とAIでテーマを調査・要約</p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* 左パネル: 履歴 */}
        <aside className="w-72 shrink-0 border-r border-border/50 flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between shrink-0">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">リサーチ履歴</span>
            <Button variant="ghost" size="sm" onClick={handleNewResearch}>
              + 新規
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <ResearchHistory
              history={history}
              selectedId={selectedId}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          </div>
        </aside>

        {/* 右パネル */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl mx-auto">
            {error && (
              <Alert variant="error" className="mb-5">
                {error}
              </Alert>
            )}

            {isBusy && (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Spinner size="lg" color="primary" />
                <p className="text-sm text-muted-foreground">
                  {isLoading ? 'Webを検索してAIが要約しています...' : '読み込み中...'}
                </p>
              </div>
            )}

            {!isBusy && displayResult && (
              <>
                <section className="rounded-xl border border-border/50 bg-surface-1 p-5">
                  <ResearchResult
                    query={displayResult.query}
                    summary={displayResult.summary}
                    sources={displayResult.sources}
                    onTopicClick={topic => { handleNewResearch(); runResearch(topic) }}
                  />
                </section>
                <div className="mt-4 flex justify-center">
                  <Button variant="outline" size="sm" onClick={handleNewResearch}>
                    + 新しいリサーチ
                  </Button>
                </div>
              </>
            )}

            {!isBusy && !displayResult && (
              <ResearchInput onSubmit={runResearch} isLoading={isLoading} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
