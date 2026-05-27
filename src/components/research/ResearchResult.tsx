'use client'

import React from 'react'
import type { ResearchSummary, ResearchSource } from '@/types/research'

interface ResearchResultProps {
  query: string
  summary: ResearchSummary
  sources: ResearchSource[]
  onTopicClick?: (topic: string) => void
}

export function ResearchResult({ query, summary, sources, onTopicClick }: ResearchResultProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* クエリ */}
      <div className="rounded-lg bg-surface-2 border border-border/50 px-4 py-3">
        <p className="text-xs text-muted-foreground mb-0.5">リサーチクエリ</p>
        <p className="text-sm font-medium text-foreground">{query}</p>
      </div>

      {/* 概要 */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-2">概要</h3>
        <p className="text-sm text-foreground leading-relaxed">{summary.overview}</p>
      </section>

      <div className="border-t border-border/50" />

      {/* 重要ポイント */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-2">重要ポイント</h3>
        {summary.keyPoints.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">なし</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {summary.keyPoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
                <span className="mt-1 w-5 h-5 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="border-t border-border/50" />

      {/* 詳細 */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-2">詳細</h3>
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{summary.details}</p>
      </section>

      {/* 関連トピック */}
      {summary.relatedTopics.length > 0 && (
        <>
          <div className="border-t border-border/50" />
          <section>
            <h3 className="text-sm font-semibold text-foreground mb-2">関連トピック</h3>
            <div className="flex flex-wrap gap-2">
              {summary.relatedTopics.map((topic, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onTopicClick?.(topic)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-smooth ${
                    onTopicClick
                      ? 'bg-surface-2 border-border text-muted-foreground hover:bg-surface-3 hover:text-foreground cursor-pointer'
                      : 'bg-surface-2 border-border text-muted-foreground cursor-default'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="border-t border-border/50" />

      {/* 出典 */}
      <section>
        <h3 className="text-sm font-semibold text-foreground mb-3">出典 ({sources.length}件)</h3>
        <div className="flex flex-col gap-3">
          {sources.map((source, i) => (
            <div key={i} className="rounded-lg border border-border/50 bg-surface-2 p-3">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-medium text-foreground leading-tight line-clamp-2 flex-1">
                  {source.title}
                </p>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-primary hover:underline flex items-center gap-0.5"
                >
                  開く
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M7 1H9v2M9 1L5 5M4 2H2v6h6V6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </a>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                {source.content}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
