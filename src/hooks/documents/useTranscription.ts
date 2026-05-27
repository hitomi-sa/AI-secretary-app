'use client'

import { useState, useCallback, useRef } from 'react'
import type { MinutesStatus } from '@/types/minutes'

interface TranscriptionState {
  status: MinutesStatus | null
  progress: number
  isPolling: boolean
  error: string | null
}

interface UseTranscriptionReturn extends TranscriptionState {
  startTranscription: (documentId: string) => void
  stop: () => void
  reset: () => void
}

export function useTranscription(): UseTranscriptionReturn {
  const [state, setState] = useState<TranscriptionState>({
    status: null,
    progress: 0,
    isPolling: false,
    error: null,
  })

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setState(prev => ({ ...prev, isPolling: false }))
  }, [])

  const startTranscription = useCallback(async (documentId: string) => {
    setState({ status: 'transcribing', progress: 0, isPolling: true, error: null })

    try {
      const res = await fetch('/api/documents/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      })

      if (!res.ok) {
        const data = await res.json()
        setState({
          status: 'failed',
          progress: 0,
          isPolling: false,
          error: data.error ?? '文字起こしの開始に失敗しました',
        })
        return
      }

      // ポーリング開始
      intervalRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/documents/transcribe/${documentId}`)
          const statusData = await statusRes.json() as { status: MinutesStatus; progress: number }

          if (!statusRes.ok) {
            setState({
              status: 'failed',
              progress: 0,
              isPolling: false,
              error: 'ステータスの取得に失敗しました',
            })
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return
          }

          setState(prev => ({
            ...prev,
            status: statusData.status,
            progress: statusData.progress ?? prev.progress,
          }))

          if (statusData.status === 'completed' || statusData.status === 'failed') {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            setState(prev => ({ ...prev, isPolling: false }))
          }
        } catch {
          setState({
            status: 'failed',
            progress: 0,
            isPolling: false,
            error: '通信エラーが発生しました',
          })
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, 3000)
    } catch {
      setState({
        status: 'failed',
        progress: 0,
        isPolling: false,
        error: '通信エラーが発生しました',
      })
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setState({ status: null, progress: 0, isPolling: false, error: null })
  }, [stop])

  return { ...state, startTranscription, stop, reset }
}
