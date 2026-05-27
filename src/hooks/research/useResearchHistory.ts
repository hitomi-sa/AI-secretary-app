'use client'

import { useState, useCallback } from 'react'
import type { ResearchMetadata } from '@/types/research'

interface HistoryItem {
  id: string
  title: string
  metadata: ResearchMetadata
  created_at: string
}

export function useResearchHistory() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/research')
      if (res.ok) {
        const data = await res.json() as HistoryItem[]
        setHistory(data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const remove = useCallback(async (id: string) => {
    await fetch(`/api/research/${id}`, { method: 'DELETE' })
    setHistory(prev => prev.filter(h => h.id !== id))
  }, [])

  return { history, isLoading, fetchHistory, remove }
}
