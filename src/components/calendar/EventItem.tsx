'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import type { CalendarEvent } from '@/types/calendar'

interface EventItemProps {
  event: CalendarEvent
  onClick: () => void
  compact?: boolean
  /** ヘッダー行に表示する場合 true: compactでも時刻を表示する */
  showTime?: boolean
}

function GoogleDot() {
  return (
    <span
      aria-label="Googleカレンダー"
      className="inline-block w-1.5 h-1.5 rounded-full bg-[#4285F4] shrink-0"
    />
  )
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function EventItem({ event, onClick, compact = false, showTime = false }: EventItemProps) {
  const isTask = event.task_id !== null
  const isGoogle = event.source === 'google'

  const baseColor = isTask
    ? 'bg-warning/15 border-warning/40 text-warning hover:bg-warning/25'
    : 'bg-primary/15 border-primary/40 text-primary hover:bg-primary/25'

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className={cn(
        'w-full text-left px-1.5 py-0.5 rounded text-xs font-medium border',
        'transition-all duration-100 cursor-pointer truncate',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        baseColor,
        compact && 'py-0',
      )}
    >
      <div className="flex items-center gap-1 min-w-0">
        {isGoogle && <GoogleDot />}
        <span className="truncate flex-1">{event.title}</span>
        {isTask && !compact && (
          <Badge variant="warning" size="sm" className="shrink-0 text-[10px] px-1 py-0">
            タスク
          </Badge>
        )}
      </div>
      {!event.is_all_day && (!compact || showTime) && (
        <div className={cn('opacity-70', compact ? 'text-[9px]' : 'text-[10px] mt-0.5')}>
          {formatTime(event.start_time)}〜{formatTime(event.end_time)}
        </div>
      )}
    </button>
  )
}
