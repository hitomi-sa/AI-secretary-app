'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database'

interface TaskFormProps {
  task?: Task
  onSubmit: (data: TaskInsert | TaskUpdate) => Promise<void>
  onCancel: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: String(i).padStart(2, '0'),
  label: String(i).padStart(2, '0') + '時',
}))

const MINUTE_OPTIONS = [
  { value: '00', label: '00分' },
  { value: '10', label: '10分' },
  { value: '20', label: '20分' },
  { value: '30', label: '30分' },
  { value: '40', label: '40分' },
  { value: '50', label: '50分' },
]

// ISO 文字列からローカル日付文字列 (YYYY-MM-DD) を取得
function toLocalDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function toLocalHH(iso: string): string {
  return String(new Date(iso).getHours()).padStart(2, '0')
}
function toLocalMM(iso: string): string {
  return String(Math.floor(new Date(iso).getMinutes() / 10) * 10).padStart(2, '0')
}

// ローカル日時 → ISO（タイムゾーン付き）
function buildISO(dateStr: string, hh: string, mm: string): string {
  return new Date(`${dateStr}T${hh}:${mm}:00`).toISOString()
}

// 終日イベント用の ISO（正午アンカーで日付ずれを防ぐ）
function buildAllDayISO(dateStr: string): string {
  return new Date(`${dateStr}T12:00:00`).toISOString()
}

export function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const now = new Date()
  const todayStr = toLocalDate(now.toISOString())

  // 初期値
  const initStartDate = task?.start_date ? toLocalDate(task.start_date) : todayStr
  const initStartHH  = task?.start_date ? toLocalHH(task.start_date) : String(now.getHours()).padStart(2, '0')
  const initStartMM  = task?.start_date ? toLocalMM(task.start_date) : '00'
  const initEndDate  = task?.due_date ? toLocalDate(task.due_date) : todayStr
  const initEndHH    = task?.due_date ? toLocalHH(task.due_date) : String((now.getHours() + 1) % 24).padStart(2, '0')
  const initEndMM    = task?.due_date ? toLocalMM(task.due_date) : '00'

  const [title, setTitle]           = useState(task?.title ?? '')
  const [description, setDescription] = useState(task?.description ?? '')
  const [location, setLocation]     = useState(task?.location ?? '')
  const [priority, setPriority]     = useState<'high' | 'medium' | 'low'>(task?.priority ?? 'medium')
  const [isAllDay, setIsAllDay]     = useState(task?.is_all_day ?? false)
  const [startDate, setStartDate]   = useState(initStartDate)
  const [startHH, setStartHH]       = useState(initStartHH)
  const [startMM, setStartMM]       = useState(initStartMM)
  const [endDate, setEndDate]       = useState(initEndDate)
  const [endHH, setEndHH]           = useState(initEndHH)
  const [endMM, setEndMM]           = useState(initEndMM)
  const [titleError, setTitleError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setTitleError('タイトルは必須です')
      return
    }
    setIsSubmitting(true)
    try {
      const startISO = isAllDay ? buildAllDayISO(startDate) : buildISO(startDate, startHH, startMM)
      const endISO   = isAllDay ? buildAllDayISO(endDate)   : buildISO(endDate, endHH, endMM)
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        priority,
        is_all_day: isAllDay,
        start_date: startISO,
        due_date: endISO,
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
        onChange={(e) => {
          setTitle(e.target.value)
          if (e.target.value.trim()) setTitleError('')
        }}
        error={titleError}
        placeholder="タスクのタイトルを入力"
        autoFocus
        required
      />

      {/* 優先度 */}
      <Select
        label="優先度"
        value={priority}
        onChange={(v) => setPriority(v as typeof priority)}
        options={PRIORITY_OPTIONS}
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
              'transition-all duration-150 [color-scheme:dark]',
            )}
          />
          {!isAllDay && (
            <>
              <Select options={HOUR_OPTIONS} value={startHH} onChange={setStartHH} className="w-24" />
              <Select options={MINUTE_OPTIONS} value={startMM} onChange={setStartMM} className="w-24" />
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
              'transition-all duration-150 [color-scheme:dark]',
            )}
          />
          {!isAllDay && (
            <>
              <Select options={HOUR_OPTIONS} value={endHH} onChange={setEndHH} className="w-24" />
              <Select options={MINUTE_OPTIONS} value={endMM} onChange={setEndMM} className="w-24" />
            </>
          )}
        </div>
      </div>

      {/* 説明 */}
      <Textarea
        label="説明"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="詳細を入力（任意）"
        rows={2}
        autoResize
      />

      {/* 場所 */}
      <Input
        label="場所"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="場所・会議URL"
      />

      {/* フッター */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          キャンセル
        </Button>
        <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
          {task ? '更新' : '保存'}
        </Button>
      </div>
    </form>
  )
}
