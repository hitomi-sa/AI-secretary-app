'use client'

import { useState, useCallback } from 'react'
import type { MinutesDocument, ActionItem } from '@/types/minutes'

interface UpdateMinutesData {
  title?: string
  discussedTopics?: string[]
  decisions?: string[]
  nextActions?: ActionItem[]
}

interface UseMinutesReturn {
  minutes: MinutesDocument[]
  isLoading: boolean
  error: string | null
  fetchList: () => Promise<MinutesDocument[]>
  fetchOne: (id: string) => Promise<MinutesDocument>
  update: (id: string, data: UpdateMinutesData) => Promise<MinutesDocument>
  remove: (id: string) => Promise<void>
}

export function useMinutes(): UseMinutesReturn {
  const [minutes, setMinutes] = useState<MinutesDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchList = useCallback(async (): Promise<MinutesDocument[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/documents/minutes')
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error ?? '議事録一覧の取得に失敗しました'
        setError(msg)
        setIsLoading(false)
        return []
      }
      const list = (data as { minutes: MinutesDocument[] }).minutes
      setMinutes(list)
      setIsLoading(false)
      return list
    } catch {
      setError('通信エラーが発生しました')
      setIsLoading(false)
      return []
    }
  }, [])

  const fetchOne = useCallback(async (id: string): Promise<MinutesDocument> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/minutes/${id}`)
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error ?? '議事録の取得に失敗しました'
        setError(msg)
        setIsLoading(false)
        throw new Error(msg)
      }
      setIsLoading(false)
      return data as MinutesDocument
    } catch (err) {
      if (err instanceof Error && err.message !== '通信エラーが発生しました') {
        throw err
      }
      setError('通信エラーが発生しました')
      setIsLoading(false)
      throw err
    }
  }, [])

  const update = useCallback(async (id: string, data: UpdateMinutesData): Promise<MinutesDocument> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/minutes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const responseData = await res.json()
      if (!res.ok) {
        const msg = responseData.error ?? '議事録の更新に失敗しました'
        setError(msg)
        setIsLoading(false)
        throw new Error(msg)
      }
      const updated = responseData as MinutesDocument
      setMinutes(prev => prev.map(m => m.id === id ? updated : m))
      setIsLoading(false)
      return updated
    } catch (err) {
      if (err instanceof Error) throw err
      setError('通信エラーが発生しました')
      setIsLoading(false)
      throw new Error('通信エラーが発生しました')
    }
  }, [])

  const remove = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/documents/minutes/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        const msg = data.error ?? '削除に失敗しました'
        setError(msg)
        setIsLoading(false)
        throw new Error(msg)
      }
      setMinutes(prev => prev.filter(m => m.id !== id))
      setIsLoading(false)
    } catch (err) {
      if (err instanceof Error) throw err
      setError('通信エラーが発生しました')
      setIsLoading(false)
      throw new Error('通信エラーが発生しました')
    }
  }, [])

  return { minutes, isLoading, error, fetchList, fetchOne, update, remove }
}
