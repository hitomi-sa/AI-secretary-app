'use client'

import { useState, useCallback } from 'react'
import type { DocumentType, ProofreadResult } from '@/types/document'

interface UseProofreadReturn {
  result:    ProofreadResult | null
  isLoading: boolean
  error:     string | null
  proofread: (content: string, documentType: DocumentType) => Promise<void>
  reset:     () => void
}

export function useProofread(): UseProofreadReturn {
  const [result, setResult]     = useState<ProofreadResult | null>(null)
  const [isLoading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const proofread = useCallback(async (content: string, documentType: DocumentType) => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/documents/proofread', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ content, documentType }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? '校正に失敗しました')
        return
      }
      setResult(data as ProofreadResult)
    } catch {
      setError('通信エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError(null)
  }, [])

  return { result, isLoading, error, proofread, reset }
}
