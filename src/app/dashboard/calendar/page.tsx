'use client'

import { useState, useMemo } from 'react'
import TaskProvider, { useTaskContext } from '@/contexts/TaskContext'
import { useCalendarEvents } from '@/hooks/calendar/useCalendarEvents'
import { CalendarHeader } from '@/components/calendar/CalendarHeader'
import { CalendarSync } from '@/components/calendar/CalendarSync'
import { CalendarView } from '@/components/calendar/CalendarView'
import { EventForm } from '@/components/calendar/EventForm'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import type { CalendarEvent, CalendarView as CalendarViewType, CalendarEventInput } from '@/types/calendar'
import type { EventFormOptions } from '@/components/calendar/EventForm'

// ─── Helper: task due_date → CalendarEvent (display only) ─────────────────────

function taskToCalendarEvent(task: {
  id: string
  title: string
  start_date?: string | null
  due_date: string | null
  description: string | null
  location?: string | null
  is_all_day?: boolean
}): CalendarEvent | null {
  if (!task.due_date) return null
  const startIso = task.start_date ?? task.due_date
  const endIso   = task.due_date
  return {
    id: `task-${task.id}`,
    user_id: '',
    google_event_id: null,
    title: task.title,
    description: task.description,
    location: task.location ?? null,
    start_time: startIso,
    end_time: endIso,
    is_all_day: task.is_all_day ?? false,
    task_id: task.id,
    color: null,
    source: 'local',
    created_at: startIso,
    updated_at: startIso,
  }
}

// ─── Helper: compute range for current view ────────────────────────────────────

function getViewRange(date: Date, view: CalendarViewType): { start: Date; end: Date } {
  if (view === 'month') {
    const start = new Date(date.getFullYear(), date.getMonth(), 1)
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)
    return { start, end }
  }
  if (view === 'week') {
    const start = new Date(date)
    start.setDate(date.getDate() - date.getDay())
    start.setHours(0, 0, 0, 0)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    return { start, end }
  }
  // day
  const start = new Date(date)
  start.setHours(0, 0, 0, 0)
  const end = new Date(date)
  end.setHours(23, 59, 59, 999)
  return { start, end }
}

function navigate(date: Date, view: CalendarViewType, direction: 1 | -1): Date {
  const d = new Date(date)
  if (view === 'month') {
    d.setMonth(d.getMonth() + direction)
  } else if (view === 'week') {
    d.setDate(d.getDate() + direction * 7)
  } else {
    d.setDate(d.getDate() + direction)
  }
  return d
}

// ─── Inner content (needs TaskContext) ────────────────────────────────────────

function CalendarContent() {
  const { tasks } = useTaskContext()

  const [currentDate, setCurrentDate] = useState<Date>(() => new Date())
  const [view, setView] = useState<CalendarViewType>('month')

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()

  const { start, end } = useMemo(() => getViewRange(currentDate, view), [currentDate, view])

  const { events, isLoading, createEvent, updateEvent, deleteEvent } = useCalendarEvents(start, end)

  // Merge task deadlines into events
  const taskEvents = useMemo<CalendarEvent[]>(() => {
    return tasks
      .map((t) => taskToCalendarEvent(t))
      .filter((e): e is CalendarEvent => e !== null)
  }, [tasks])

  // 現存するタスクのIDセット（削除済みタスクのイベントを除外するため）
  const liveTaskIds = useMemo(() => new Set(tasks.map((t) => t.id)), [tasks])

  // calendar_events のうち task_id があるが対応タスクが存在しないものは除外
  const filteredEvents = useMemo(
    () => events.filter((e) => !e.task_id || liveTaskIds.has(e.task_id)),
    [events, liveTaskIds],
  )

  // タスク期限イベントの重複を除外して結合
  const existingTaskIds = useMemo(
    () => new Set(filteredEvents.filter((e) => e.task_id).map((e) => e.task_id)),
    [filteredEvents],
  )
  const filteredTaskEvents = taskEvents.filter((e) => !existingTaskIds.has(e.task_id))
  const allEvents = [...filteredEvents, ...filteredTaskEvents]

  const handlePrevious = () => setCurrentDate((d) => navigate(d, view, -1))
  const handleNext = () => setCurrentDate((d) => navigate(d, view, 1))
  const handleToday = () => setCurrentDate(new Date())

  const handleEventClick = (event: CalendarEvent) => {
    // Task-derived synthetic events are read-only
    if (event.id.startsWith('task-')) return
    setSelectedEvent(event)
    setSelectedDate(undefined)
    setIsFormOpen(true)
  }

  const handleDateClick = (date: Date) => {
    setSelectedEvent(undefined)
    setSelectedDate(date)
    setIsFormOpen(true)
  }

  const handleAddClick = () => {
    setSelectedEvent(undefined)
    setSelectedDate(new Date())
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (input: CalendarEventInput, options: EventFormOptions) => {
    let savedEventId: string | undefined
    if (selectedEvent) {
      await updateEvent(selectedEvent.id, input)
    } else {
      const created = await createEvent(input)
      savedEventId = created.id
    }
    // 「タスクとして保存」が有効なら Tasks APIにも追加
    // link_calendar_event_id を渡すことで calendar_events の重複作成を防ぐ
    if (options.saveAsTask) {
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: input.title,
          description: input.description ?? null,
          location: input.location ?? null,
          priority: options.priority,
          start_date: input.start_time,
          due_date: input.end_time,
          is_all_day: input.is_all_day ?? false,
          link_calendar_event_id: savedEventId,
        }),
      })
    }
    setIsFormOpen(false)
  }

  const handleFormCancel = () => setIsFormOpen(false)

  const handleDelete = async () => {
    if (!selectedEvent) return
    await deleteEvent(selectedEvent.id)
    setIsFormOpen(false)
  }

  // Inject selectedDate into EventForm as default start
  const formDefaultEvent: CalendarEvent | undefined = selectedEvent
    ?? (selectedDate
      ? {
          id: '',
          user_id: '',
          google_event_id: null,
          title: '',
          description: null,
          location: null,
          start_time: selectedDate.toISOString(),
          end_time: new Date(selectedDate.getTime() + 60 * 60 * 1000).toISOString(),
          is_all_day: false,
          task_id: null,
          color: null,
          source: 'local',
          created_at: '',
          updated_at: '',
        }
      : undefined)

  return (
    <div className="flex flex-col h-full">
      {/* Page title bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold text-foreground">カレンダー</h1>
          <p className="text-xs text-muted-foreground mt-0.5">スケジュール管理</p>
        </div>
        <div className="flex items-center gap-2">
          <CalendarSync />
          <Button
            variant="primary"
            size="sm"
            onClick={handleAddClick}
            icon={
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            }
          >
            <span className="hidden sm:inline">追加</span>
          </Button>
        </div>
      </div>

      {/* Calendar header (navigation + view tabs) */}
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setView}
      />

      {/* Calendar body */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
            <Spinner size="md" />
          </div>
        )}
        <CalendarView
          events={allEvents}
          currentDate={currentDate}
          view={view}
          onEventClick={handleEventClick}
          onDateClick={handleDateClick}
        />
      </div>

      {/* Event form modal */}
      <Modal
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={selectedEvent ? 'イベントを編集' : 'イベントを追加'}
        size="md"
        footer={
          selectedEvent && !selectedEvent.id.startsWith('task-') ? (
            <div className="flex justify-start">
              <Button variant="destructive" size="sm" onClick={() => void handleDelete()}>
                削除
              </Button>
            </div>
          ) : undefined
        }
      >
        <EventForm
          event={formDefaultEvent?.id ? formDefaultEvent : undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </div>
  )
}

// ─── Page (wraps TaskProvider if not already in layout) ───────────────────────

export default function CalendarPage() {
  return (
    <TaskProvider>
      <CalendarContent />
    </TaskProvider>
  )
}
