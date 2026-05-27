'use client'

import { useState, useEffect, useCallback } from 'react'
import type { ProofreadDocument } from '@/types/document'

export function useProofreadHistory() {
  const [history, setHistory]   = useState<ProofreadDocument[]>([])
  const [isLoading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/documents/proofread/history')
      const data = await res.json()
      if (res.ok) setHistory(data.history ?? [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void fetchHistory() }, [fetchHistory])

  return { history, isLoading, refetch: fetchHistory }
}
