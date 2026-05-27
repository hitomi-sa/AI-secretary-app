'use client'

import { useState, useCallback } from 'react'
import type { ResearchSummary, ResearchSource } from '@/types/research'

interface ResearchState {
  isLoading: boolean
  error: string | null
  result: {
    id: string
    summary: ResearchSummary
    sources: ResearchSource[]
  } | null
}

export function useResearch() {
  const [state, setState] = useState<ResearchState>({
    isLoading: false,
    error: null,
    result: null,
  })

  const runResearch = useCallback(async (query: string) => {
    setState({ isLoading: true, error: null, result: null })
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json() as { id?: string; summary?: ResearchSummary; sources?: ResearchSource[]; error?: string }
      if (!res.ok) {
        setState({ isLoading: false, error: data.error ?? 'リサーチに失敗しました', result: null })
        return
      }
      setState({
        isLoading: false,
        error: null,
        result: { id: data.id!, summary: data.summary!, sources: data.sources! },
      })
    } catch {
      setState({ isLoading: false, error: '通信エラーが発生しました', result: null })
    }
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, result: null })
  }, [])

  return { ...state, runResearch, reset }
}
