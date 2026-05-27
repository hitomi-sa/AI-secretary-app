'use client'

import { useState, useEffect, useCallback } from 'react'

/** 同期完了を他のフックに伝えるカスタムイベント名 */
export const CALENDAR_SYNCED_EVENT = 'calendar:synced'

interface CalendarSyncState {
  connected: boolean
  isSyncing: boolean
  lastSynced: string | null
  sync: () => Promise<void>
  connect: () => Promise<void>
}

export function useCalendarSync(): CalendarSyncState {
  const [connected, setConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSynced, setLastSynced] = useState<string | null>(null)

  const doSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' })
      if (!res.ok) return
      const data = await res.json() as { last_synced: string }
      setLastSynced(data.last_synced)
      setConnected(true)
      // 同期完了を useCalendarEvents に通知してイベント一覧を再取得させる
      window.dispatchEvent(new CustomEvent(CALENDAR_SYNCED_EVENT))
    } catch {
      // 通信失敗は静かにスキップ
    } finally {
      setIsSyncing(false)
    }
  }, [])

  // 接続状態確認 + ページ表示時に自動同期
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/calendar/status')
        if (!res.ok) return
        const data = await res.json() as { connected: boolean }
        setConnected(data.connected)

        if (data.connected) {
          // 連携済みなら毎ページ表示時にバックグラウンドで同期
          void doSync()
        }
      } catch {
        // サーバー未実装の場合は無視
      }
    })()
  }, [doSync])

  const connect = useCallback(async () => {
    try {
      const res = await fetch('/api/calendar/auth')
      if (!res.ok) throw new Error('認証URLの取得に失敗しました')
      const data = await res.json() as { url: string }
      window.location.href = data.url
    } catch (e) {
      console.error(e)
    }
  }, [])

  return { connected, isSyncing, lastSynced, sync: doSync, connect }
}
