'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { CalendarEvent, CalendarEventInput } from '@/types/calendar'

export interface EventFormOptions {
  saveAsTask: boolean
  priority: 'high' | 'medium' | 'low'
}

interface EventFormProps {
  event?: CalendarEvent
  onSubmit: (input: CalendarEventInput, options: EventFormOptions) => Promise<void>
  onCancel: () => void
}

// 10分刻みの時・分オプション
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0') + '時',
}))

const MINUTE_OPTIONS = Array.from({ length: 6 }, (_, i) => ({
  value: String(i * 10).padStart(2, '0'),
  label: String(i * 10).padStart(2, '0') + '分',
}))

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

function toLocalDateString(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function toLocalHH(iso: string): string {
  return String(new Date(iso).getHours()).padStart(2, '0')
}

function toLocalMM(iso: string): string {
  const minutes = new Date(iso).getMinutes()
  // 10分刻みに丸める
  return String(Math.floor(minutes / 10) * 10).padStart(2, '0')
}

function buildISO(dateStr: string, hh: string, mm: string): string {
  return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString()
}

export function EventForm({ event, onSubmit, onCancel }: EventFormProps) {
  const now = new Date()
  const defaultDate = toLocalDateString(event?.start_time ?? now.toISOString())
  const defaultStartHH = event ? toLocalHH(event.start_time) : String(now.getHours()).padStart(2, '0')
  const defaultStartMM = event ? toLocalMM(event.start_time) : '00'
  const defaultEndHH = event
    ? toLocalHH(event.end_time)
    : String((now.getHours() + 1) % 24).padStart(2, '0')
  const defaultEndMM = event ? toLocalMM(event.end_time) : '00'

  const [title, setTitle] = useState(event?.title ?? '')
  const [description, setDescription] = useState(event?.description ?? '')
  const [location, setLocation] = useState(event?.location ?? '')
  const [startDate, setStartDate] = useState(defaultDate)
  const [startHH, setStartHH] = useState(defaultStartHH)
  const [startMM, setStartMM] = useState(defaultStartMM)
  const [endDate, setEndDate] = useState(
    event ? toLocalDateString(event.end_time) : defaultDate,
  )
  const [endHH, setEndHH] = useState(defaultEndHH)
  const [endMM, setEndMM] = useState(defaultEndMM)
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day ?? false)
  const [saveAsTask, setSaveAsTask] = useState(false)
  const [priority, setPriority] = useState<string>('medium')
  const [titleError, setTitleError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('タイトルを入力してください')
      return
    }
    setTitleError(null)
    setIsSubmitting(true)

    try {
      // 終日イベントは正午ローカル時刻をアンカーにする。
      // T00:00:00 を使うと JST (UTC+9) では前日の UTC 日付になり日付がずれる。
      // T12:00:00 なら UTC+9 でも 03:00 UTC となり、slice(0,10) で正しい日付が得られる。
      const startISO = isAllDay
        ? new Date(`${startDate}T12:00:00`).toISOString()
        : buildISO(startDate, startHH, startMM)
      const endISO = isAllDay
        ? new Date(`${endDate}T12:00:00`).toISOString()
        : buildISO(endDate, endHH, endMM)

      const input: CalendarEventInput = {
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        start_time: startISO,
        end_time: endISO,
        is_all_day: isAllDay,
        task_id: null,
        color: null,
      }
      await onSubmit(input, {
        saveAsTask,
        priority: priority as 'high' | 'medium' | 'low',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      {/* タイトル */}
      <Input
        label="タイトル"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        error={titleError ?? undefined}
        placeholder="イベントのタイトル"
        required
      />

      {/* 終日 */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isAllDay}
          onChange={(e) => setIsAllDay(e.target.checked)}
          className="w-4 h-4 rounded accent-primary bg-input border-border"
        />
        <span className="text-sm text-foreground">終日</span>
      </label>

      {/* 開始 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">開始</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={cn(
              'flex-1 bg-input border border-border rounded-[var(--radius)] h-10 px-3 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
              'transition-all duration-150',
            )}
          />
          {!isAllDay && (
            <>
              <Select
                options={HOUR_OPTIONS}
                value={startHH}
                onChange={setStartHH}
                className="w-24"
              />
              <Select
                options={MINUTE_OPTIONS}
                value={startMM}
                onChange={setStartMM}
                className="w-24"
              />
            </>
          )}
        </div>
      </div>

      {/* 終了 */}
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-muted-foreground">終了</span>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={cn(
              'flex-1 bg-input border border-border rounded-[var(--radius)] h-10 px-3 text-sm text-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
              'transition-all duration-150',
            )}
          />
          {!isAllDay && (
            <>
              <Select
                options={HOUR_OPTIONS}
                value={endHH}
                onChange={setEndHH}
                className="w-24"
              />
              <Select
                options={MINUTE_OPTIONS}
                value={endMM}
                onChange={setEndMM}
                className="w-24"
              />
            </>
          )}
        </div>
      </div>

      {/* 説明 */}
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="詳細・メモ"
        autoResize
        rows={2}
      />

      {/* 場所 */}
      <Input
        label="場所"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="場所・会議URL"
      />

      {/* タスクとして保存 */}
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={saveAsTask}
            onChange={(e) => setSaveAsTask(e.target.checked)}
            className="w-4 h-4 rounded accent-primary bg-input border-border"
          />
          <span className="text-sm text-foreground">タスクとして保存</span>
        </label>
        {saveAsTask && (
          <Select
            label="優先度"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        )}
      </div>

      {/* フッター */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
          {event ? '更新' : '保存'}
        </Button>
      </div>
    </form>
  )
}
