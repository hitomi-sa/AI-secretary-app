'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import type { CalendarView } from '@/types/calendar'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onPrevious: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarView) => void
}

function formatPeriodLabel(date: Date, view: CalendarView): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  const day = date.getDate()

  if (view === 'month') {
    return `${year}年${month + 1}月`
  }

  if (view === 'week') {
    // 週の開始(日曜)と終了(土曜)
    const startOfWeek = new Date(date)
    startOfWeek.setDate(day - date.getDay())
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)

    const sm = startOfWeek.getMonth() + 1
    const sd = startOfWeek.getDate()
    const em = endOfWeek.getMonth() + 1
    const ed = endOfWeek.getDate()

    if (sm === em) {
      return `${year}年${sm}月${sd}日〜${ed}日`
    }
    return `${year}年${sm}月${sd}日〜${em}月${ed}日`
  }

  // day
  return `${year}年${month + 1}月${day}日`
}

const VIEW_LABELS: Record<CalendarView, string> = {
  month: '月',
  week: '週',
  day: '日',
}

export function CalendarHeader({
  currentDate,
  view,
  onPrevious,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  const periodLabel = formatPeriodLabel(currentDate, view)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b border-border">
      {/* Left: navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onPrevious}
          aria-label="前へ"
          className="w-8 h-8 p-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onToday}
          className="text-xs font-medium"
        >
          今日
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onNext}
          aria-label="次へ"
          className="w-8 h-8 p-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Button>

        <span className="text-sm font-semibold text-foreground ml-1 select-none">
          {periodLabel}
        </span>
      </div>

      {/* Right: view switcher */}
      <div
        role="tablist"
        aria-label="表示切り替え"
        className="flex items-center bg-surface-1 rounded-[var(--radius)] p-0.5 self-start sm:self-auto"
      >
        {(Object.keys(VIEW_LABELS) as CalendarView[]).map((v) => (
          <button
            key={v}
            role="tab"
            aria-selected={view === v}
            onClick={() => onViewChange(v)}
            className={cn(
              'px-3 py-1 text-xs font-medium rounded-[calc(var(--radius)-2px)] transition-all duration-150',
              view === v
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {VIEW_LABELS[v]}
          </button>
        ))}
      </div>
    </div>
  )
}
