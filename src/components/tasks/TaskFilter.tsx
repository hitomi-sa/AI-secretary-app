'use client'

import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import type { TaskFilters, TaskSort } from '@/types/task'
import { DEFAULT_FILTERS } from '@/types/task'

interface TaskFilterProps {
  filters: TaskFilters
  sort: TaskSort
  onFiltersChange: (filters: TaskFilters) => void
  onSortChange: (sort: TaskSort) => void
}

const statusOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'pending', label: '未完了' },
  { value: 'completed', label: '完了' },
]

const priorityOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高' },
  { value: 'medium', label: '中' },
  { value: 'low', label: '低' },
]

const dueDateOptions = [
  { value: 'all', label: 'すべて' },
  { value: 'today', label: '今日' },
  { value: 'week', label: '今週' },
  { value: 'month', label: '今月' },
  { value: 'overdue', label: '期限切れ' },
]

const sortKeyOptions = [
  { value: 'created_at', label: '作成日' },
  { value: 'due_date', label: '期限日' },
  { value: 'priority', label: '優先度' },
]

const sortOrderOptions = [
  { value: 'desc', label: '降順' },
  { value: 'asc', label: '昇順' },
]

function isDefaultFilters(filters: TaskFilters): boolean {
  return (
    filters.status === DEFAULT_FILTERS.status &&
    filters.priority === DEFAULT_FILTERS.priority &&
    filters.dueDate === DEFAULT_FILTERS.dueDate
  )
}

export function TaskFilter({ filters, sort, onFiltersChange, onSortChange }: TaskFilterProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <Select
        label="ステータス"
        value={filters.status}
        onChange={(v) => onFiltersChange({ ...filters, status: v as TaskFilters['status'] })}
        options={statusOptions}
        className="w-32"
      />
      <Select
        label="優先度"
        value={filters.priority}
        onChange={(v) => onFiltersChange({ ...filters, priority: v as TaskFilters['priority'] })}
        options={priorityOptions}
        className="w-28"
      />
      <Select
        label="期限"
        value={filters.dueDate}
        onChange={(v) => onFiltersChange({ ...filters, dueDate: v as TaskFilters['dueDate'] })}
        options={dueDateOptions}
        className="w-32"
      />
      <div className="w-px h-8 bg-border self-end mb-1" aria-hidden="true" />
      <Select
        label="並び替え"
        value={sort.key}
        onChange={(v) => onSortChange({ ...sort, key: v as TaskSort['key'] })}
        options={sortKeyOptions}
        className="w-32"
      />
      <Select
        label="順序"
        value={sort.order}
        onChange={(v) => onSortChange({ ...sort, order: v as TaskSort['order'] })}
        options={sortOrderOptions}
        className="w-24"
      />
      {!isDefaultFilters(filters) && (
        <Button
          variant="ghost"
          size="sm"
          className="self-end text-muted-foreground"
          onClick={() => onFiltersChange(DEFAULT_FILTERS)}
        >
          クリア
        </Button>
      )}
    </div>
  )
}
