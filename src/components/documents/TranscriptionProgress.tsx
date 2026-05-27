'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Alert } from '@/components/ui/Alert'
import type { MinutesStatus } from '@/types/minutes'

interface Step {
  id: MinutesStatus
  label: string
  description: string
}

const STEPS: Step[] = [
  { id: 'uploading',    label: 'ファイルアップロード', description: 'ファイルをサーバーに送信中' },
  { id: 'transcribing', label: '音声認識処理',         description: '音声をテキストに変換中' },
  { id: 'generating',   label: '議事録生成',           description: 'AIが議事録を作成中' },
  { id: 'completed',    label: '完了',                description: '議事録の準備ができました' },
]

const STATUS_ORDER: MinutesStatus[] = ['uploading', 'transcribing', 'generating', 'completed']

function getStepIndex(status: MinutesStatus): number {
  const idx = STATUS_ORDER.indexOf(status)
  return idx === -1 ? 0 : idx
}

interface TranscriptionProgressProps {
  status: MinutesStatus
  progress: number
  errorMessage?: string
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M2.5 7l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function TranscriptionProgress({ status, progress, errorMessage }: TranscriptionProgressProps) {
  const isFailed = status === 'failed'
  const currentIdx = isFailed ? -1 : getStepIndex(status)

  return (
    <div className="flex flex-col gap-5">
      {/* ステップ表示 */}
      <div className="flex flex-col gap-3">
        {STEPS.map((step, idx) => {
          const isCompleted = !isFailed && currentIdx > idx
          const isCurrent = !isFailed && currentIdx === idx
          const isPending = isFailed || currentIdx < idx

          return (
            <div key={step.id} className="flex items-start gap-3">
              {/* アイコン */}
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                  'transition-smooth',
                  isCompleted && 'bg-success text-foreground',
                  isCurrent  && 'bg-primary/15 border border-primary text-primary',
                  isPending  && 'bg-surface-3 border border-border text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {isCompleted ? (
                  <CheckIcon />
                ) : isCurrent ? (
                  <Spinner size="xs" color="primary" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current opacity-40" />
                )}
              </div>

              {/* テキスト */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    'text-sm font-medium leading-tight',
                    isCompleted && 'text-success',
                    isCurrent  && 'text-foreground',
                    isPending  && 'text-muted-foreground',
                  )}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                )}
              </div>

              {/* 完了バッジ */}
              {isCompleted && (
                <span className="text-xs text-success shrink-0 mt-1">完了</span>
              )}
            </div>
          )
        })}
      </div>

      {/* プログレスバー */}
      {!isFailed && status !== 'completed' && (
        <div className="flex flex-col gap-1.5">
          <div
            className="h-1.5 rounded-full bg-surface-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="処理の進捗"
          >
            <div
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">{progress}%</p>
        </div>
      )}

      {/* 完了メッセージ */}
      {status === 'completed' && (
        <Alert variant="success">
          議事録の生成が完了しました
        </Alert>
      )}

      {/* エラーメッセージ */}
      {isFailed && (
        <Alert variant="error" title="処理に失敗しました">
          {errorMessage ?? '処理中にエラーが発生しました。再度お試しください。'}
        </Alert>
      )}
    </div>
  )
}
