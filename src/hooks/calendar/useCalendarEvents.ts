'use client'

import { useState, useEffect, useCallback } from 'react'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'
import { CALENDAR_SYNCED_EVENT } from './useCalendarSync'

interface UseCalendarEventsResult {
  events: CalendarEvent[]
  isLoading: boolean
  error: string | null
  createEvent: (input: CalendarEventInput) => Promise<CalendarEvent>
  updateEvent: (id: string, input: Partial<CalendarEventInput>) => Promise<CalendarEvent>
  deleteEvent: (id: string) => Promise<void>
  refetch: () => void
}

export function useCalendarEvents(
  start: Date,
  end: Date,
): UseCalendarEventsResult {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const startISO = start.toISOString()
  const endISO = end.toISOString()

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ start: startISO, end: endISO })
      const res = await fetch(`/api/calendar/events?${params.toString()}`)
      if (!res.ok) throw new Error('イベントの取得に失敗しました')
      const json = await res.json() as { events: CalendarEvent[] }
      setEvents(json.events ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setIsLoading(false)
    }
  }, [startISO, endISO])

  useEffect(() => {
    void fetchEvents()
  }, [fetchEvents])

  // Google同期完了時にイベント一覧を再取得
  useEffect(() => {
    const handler = () => void fetchEvents()
    window.addEventListener(CALENDAR_SYNCED_EVENT, handler)
    return () => window.removeEventListener(CALENDAR_SYNCED_EVENT, handler)
  }, [fetchEvents])

  const createEvent = useCallback(async (input: CalendarEventInput): Promise<CalendarEvent> => {
    // Optimistic: generate temp id
    const tempId = `temp-${Date.now()}`
    const now = new Date().toISOString()
    const optimistic: CalendarEvent = {
      id: tempId,
      user_id: '',
      google_event_id: null,
      title: input.title,
      description: input.description ?? null,
      location: input.location ?? null,
      start_time: input.start_time,
      end_time: input.end_time,
      is_all_day: input.is_all_day ?? false,
      task_id: input.task_id ?? null,
      color: input.color ?? null,
      source: 'local',
      created_at: now,
      updated_at: now,
    }
    setEvents((prev) => [...prev, optimistic])

    try {
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(errJson.error ?? 'イベントの作成に失敗しました')
      }
      const created = await res.json() as CalendarEvent
      setEvents((prev) => prev.map((e) => (e.id === tempId ? created : e)))
      return created
    } catch (e) {
      setEvents((prev) => prev.filter((e) => e.id !== tempId))
      throw e
    }
  }, [])

  const updateEvent = useCallback(
    async (id: string, input: Partial<CalendarEventInput>): Promise<CalendarEvent> => {
      const prev = events.find((e) => e.id === id)
      if (prev) {
        const optimistic: CalendarEvent = {
          ...prev,
          ...input,
          description: input.description !== undefined ? (input.description ?? null) : prev.description,
          location: input.location !== undefined ? (input.location ?? null) : prev.location,
          task_id: input.task_id !== undefined ? (input.task_id ?? null) : prev.task_id,
          color: input.color !== undefined ? (input.color ?? null) : prev.color,
          is_all_day: input.is_all_day !== undefined ? input.is_all_day : prev.is_all_day,
          updated_at: new Date().toISOString(),
        }
        setEvents((evs) => evs.map((e) => (e.id === id ? optimistic : e)))
      }

      try {
        const res = await fetch(`/api/calendar/events/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(input),
        })
        if (!res.ok) {
          const errJson = await res.json().catch(() => ({})) as { error?: string }
          throw new Error(errJson.error ?? 'イベントの更新に失敗しました')
        }
        const updated = await res.json() as CalendarEvent
        setEvents((evs) => evs.map((e) => (e.id === id ? updated : e)))
        return updated
      } catch (e) {
        // Rollback
        if (prev) setEvents((evs) => evs.map((e) => (e.id === id ? prev : e)))
        throw e
      }
    },
    [events],
  )

  const deleteEvent = useCallback(async (id: string): Promise<void> => {
    const prev = events.find((e) => e.id === id)
    setEvents((evs) => evs.filter((e) => e.id !== id))

    try {
      const res = await fetch(`/api/calendar/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('イベントの削除に失敗しました')
    } catch (e) {
      if (prev) setEvents((evs) => [...evs, prev])
      throw e
    }
  }, [events])

  return {
    events,
    isLoading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: fetchEvents,
  }
}
