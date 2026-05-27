'use client'

import { cn } from '@/lib/utils'
import { EventItem } from './EventItem'
import type { CalendarEvent, CalendarView } from '@/types/calendar'

interface CalendarViewProps {
  events: CalendarEvent[]
  currentDate: Date
  view: CalendarView
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}

const DAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

/** 1時間あたりのピクセル高さ */
const HOUR_HEIGHT = 56

const hours = Array.from({ length: 24 }, (_, i) => i)

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

/**
 * timed イベントの終了時刻を調整する。
 * 終了が 00:00:00 ちょうどの場合、前日末（23:59:59.999）として扱う。
 */
function adjustedEnd(e: CalendarEvent): Date {
  const end = new Date(e.end_time)
  if (
    !e.is_all_day &&
    end.getHours() === 0 && end.getMinutes() === 0 &&
    end.getSeconds() === 0 && end.getMilliseconds() === 0
  ) {
    return new Date(end.getTime() - 1)
  }
  return end
}

/** イベントが指定した日付と重なるか */
function overlapsDate(e: CalendarEvent, date: Date): boolean {
  const start    = new Date(e.start_time)
  const end      = adjustedEnd(e)
  const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
  const dayEnd   = new Date(date); dayEnd.setHours(23, 59, 59, 999)
  return start <= dayEnd && end >= dayStart
}

/** 複数日にまたがる時刻指定イベントかどうか */
function isMultiDayTimed(e: CalendarEvent): boolean {
  if (e.is_all_day) return false
  return !isSameDay(new Date(e.start_time), adjustedEnd(e))
}

/** ヘッダー行（終日 + 複数日 timed） */
function headerEventsOnDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((e) => {
    if (e.is_all_day) return overlapsDate(e, date)
    return isMultiDayTimed(e) && overlapsDate(e, date)
  })
}

/** 時間グリッドに表示する単日 timed イベント */
function timedEventsOnDate(events: CalendarEvent[], date: Date): CalendarEvent[] {
  return events.filter((e) => {
    if (e.is_all_day) return false
    if (isMultiDayTimed(e)) return false
    return overlapsDate(e, date)
  })
}

/** イベントブロックの top / height を計算 */
function calcEventPosition(event: CalendarEvent): { top: number; height: number } {
  const start = new Date(event.start_time)
  const end   = adjustedEnd(event)
  const startMins = start.getHours() * 60 + start.getMinutes()
  const endMins   = end.getHours()   * 60 + end.getMinutes()
  const top    = (startMins / 60) * HOUR_HEIGHT
  const height = Math.max(((endMins - startMins) / 60) * HOUR_HEIGHT, 24)
  return { top, height }
}

// ─── Event block (absolute positioned in time grid) ────────────────────────────

function TimedEventBlock({
  event,
  onClick,
}: {
  event: CalendarEvent
  onClick: () => void
}) {
  const { top, height } = calcEventPosition(event)
  const isTask   = event.task_id !== null
  const isGoogle = event.source === 'google'
  const start    = new Date(event.start_time)
  const end      = adjustedEnd(event)

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-left text-xs font-medium z-10',
        'flex flex-col items-start justify-start',
        'overflow-hidden transition-opacity hover:opacity-90 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        isTask
          ? 'bg-warning/75 text-warning-foreground border border-warning/50'
          : 'bg-primary/75 text-primary-foreground border border-primary/50',
      )}
      style={{ top, height }}
    >
      <div className="flex items-center gap-1 min-w-0">
        {isGoogle && (
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
        )}
        <span className="truncate leading-tight">{event.title}</span>
      </div>
      {height >= 32 && (
        <div className="text-[10px] opacity-80 leading-tight mt-0.5">
          {formatTime(start.toISOString())}〜{formatTime(end.toISOString())}
        </div>
      )}
    </button>
  )
}

// ─── Month View ────────────────────────────────────────────────────────────────

function MonthView({ events, currentDate, onEventClick, onDateClick }: {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}) {
  const today = new Date()
  const year  = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDay    = new Date(year, month, 1)
  const lastDay     = new Date(year, month + 1, 0)
  const startOffset = firstDay.getDay()

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(year, month, d))
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="grid grid-cols-7 border-b border-border">
        {DAY_LABELS.map((label, i) => (
          <div
            key={label}
            className={cn(
              'py-2 text-center text-xs font-medium',
              i === 0 ? 'text-destructive/70' : i === 6 ? 'text-primary/70' : 'text-muted-foreground',
            )}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 flex-1 divide-x divide-y divide-border">
        {cells.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="bg-surface-1/30" />

          const dayEvents      = events.filter((e) => overlapsDate(e, date))
          const isToday        = isSameDay(date, today)
          const isCurrentMonth = date.getMonth() === month
          const dayOfWeek      = date.getDay()
          const MAX_VISIBLE    = 3
          const visible        = dayEvents.slice(0, MAX_VISIBLE)
          const overflow       = dayEvents.length - MAX_VISIBLE

          return (
            <div
              key={date.toISOString()}
              className={cn(
                'min-h-[80px] p-1 flex flex-col gap-0.5 cursor-pointer',
                'hover:bg-accent/20 transition-colors duration-100',
                !isCurrentMonth && 'opacity-40',
              )}
              onClick={() => onDateClick(date)}
            >
              <div className="flex items-center justify-start mb-0.5">
                <span
                  className={cn(
                    'text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full',
                    isToday
                      ? 'bg-primary text-primary-foreground'
                      : dayOfWeek === 0
                      ? 'text-destructive/80'
                      : dayOfWeek === 6
                      ? 'text-primary/80'
                      : 'text-foreground',
                  )}
                >
                  {date.getDate()}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                {visible.map((event) => (
                  <EventItem
                    key={`${event.id}-${date.toISOString()}`}
                    event={event}
                    onClick={() => onEventClick(event)}
                    compact
                  />
                ))}
                {overflow > 0 && (
                  <span className="text-[10px] text-muted-foreground px-1">+{overflow}件</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Week View ─────────────────────────────────────────────────────────────────

function WeekView({ events, currentDate, onEventClick, onDateClick }: {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}) {
  const today      = new Date()
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  const hasHeaderEvents = weekDays.some((d) => headerEventsOnDate(events, d).length > 0)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 曜日ヘッダー（sticky） */}
      <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border shrink-0 bg-background z-20">
        <div className="py-2" />
        {weekDays.map((date, i) => {
          const isToday = isSameDay(date, today)
          return (
            <div
              key={date.toISOString()}
              className="py-2 text-center cursor-pointer hover:bg-accent/20"
              onClick={() => onDateClick(date)}
            >
              <div className={cn(
                'text-xs font-medium',
                i === 0 ? 'text-destructive/70' : i === 6 ? 'text-primary/70' : 'text-muted-foreground',
              )}>
                {DAY_LABELS[i]}
              </div>
              <div className={cn(
                'text-sm font-semibold w-8 h-8 flex items-center justify-center rounded-full mx-auto',
                isToday && 'bg-primary text-primary-foreground',
              )}>
                {date.getDate()}
              </div>
            </div>
          )
        })}
      </div>

      {/* 終日・複数日イベント行 */}
      {hasHeaderEvents && (
        <div className="grid grid-cols-[48px_repeat(7,1fr)] border-b border-border shrink-0 bg-background">
          <div className="flex items-center justify-end pr-2 py-1">
            <span className="text-[10px] text-muted-foreground">終日</span>
          </div>
          {weekDays.map((date) => {
            const dayHeaderEvents = headerEventsOnDate(events, date)
            return (
              <div
                key={date.toISOString()}
                className="border-l border-border/50 px-0.5 py-0.5 flex flex-col gap-0.5 min-h-[28px]"
              >
                {dayHeaderEvents.map((event) => (
                  <EventItem
                    key={`${event.id}-header-${date.toISOString()}`}
                    event={event}
                    onClick={() => onEventClick(event)}
                    compact
                    showTime={!event.is_all_day}
                  />
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* 時間グリッド（スクロール可能） */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[48px_repeat(7,1fr)]" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* 時刻ラベル列 */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-start justify-end pr-2 pt-1"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* 各日の列 */}
          {weekDays.map((date) => {
            const isToday    = isSameDay(date, today)
            const dayEvents  = timedEventsOnDate(events, date)

            return (
              <div
                key={date.toISOString()}
                className={cn('relative border-l border-border/50', isToday && 'bg-primary/5')}
              >
                {/* 時間線 + クリックターゲット */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute w-full border-b border-border/30 cursor-pointer hover:bg-accent/10 transition-colors"
                    style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                    onClick={() => {
                      const d = new Date(date)
                      d.setHours(hour, 0, 0, 0)
                      onDateClick(d)
                    }}
                  />
                ))}

                {/* イベントブロック */}
                {dayEvents.map((event) => (
                  <TimedEventBlock
                    key={event.id}
                    event={event}
                    onClick={() => onEventClick(event)}
                  />
                ))}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Day View ──────────────────────────────────────────────────────────────────

function DayView({ events, currentDate, onEventClick, onDateClick }: {
  events: CalendarEvent[]
  currentDate: Date
  onEventClick: (event: CalendarEvent) => void
  onDateClick: (date: Date) => void
}) {
  const dayHeaderEvents = headerEventsOnDate(events, currentDate)
  const dayTimedEvents  = timedEventsOnDate(events, currentDate)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* 終日ヘッダー */}
      {dayHeaderEvents.length > 0 && (
        <div className="px-3 py-2 border-b border-border flex flex-col gap-1 shrink-0">
          <span className="text-[10px] text-muted-foreground font-medium mb-0.5">終日</span>
          {dayHeaderEvents.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              onClick={() => onEventClick(event)}
              showTime={!event.is_all_day}
            />
          ))}
        </div>
      )}

      {/* 時間グリッド（スクロール可能） */}
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[48px_1fr]" style={{ height: HOUR_HEIGHT * 24 }}>
          {/* 時刻ラベル */}
          <div className="relative">
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full flex items-start justify-end pr-2 pt-1"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
              >
                <span className="text-[10px] text-muted-foreground">
                  {String(hour).padStart(2, '0')}:00
                </span>
              </div>
            ))}
          </div>

          {/* イベント列 */}
          <div className="relative border-l border-border/50">
            {/* 時間線 + クリックターゲット */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="absolute w-full border-b border-border/30 cursor-pointer hover:bg-accent/10 transition-colors"
                style={{ top: hour * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                onClick={() => {
                  const d = new Date(currentDate)
                  d.setHours(hour, 0, 0, 0)
                  onDateClick(d)
                }}
              />
            ))}

            {/* イベントブロック */}
            {dayTimedEvents.map((event) => (
              <TimedEventBlock
                key={event.id}
                event={event}
                onClick={() => onEventClick(event)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main export ───────────────────────────────────────────────────────────────

export function CalendarView({
  events,
  currentDate,
  view,
  onEventClick,
  onDateClick,
}: CalendarViewProps) {
  if (view === 'month') {
    return (
      <MonthView
        events={events}
        currentDate={currentDate}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
      />
    )
  }

  if (view === 'week') {
    return (
      <WeekView
        events={events}
        currentDate={currentDate}
        onEventClick={onEventClick}
        onDateClick={onDateClick}
      />
    )
  }

  return (
    <DayView
      events={events}
      currentDate={currentDate}
      onEventClick={onEventClick}
      onDateClick={onDateClick}
    />
  )
}
