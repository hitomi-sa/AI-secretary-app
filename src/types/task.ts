import type { Priority, TaskStatus, Task } from './database'

export type { Priority, TaskStatus, Task }

export interface TaskFilters {
  status: 'all' | TaskStatus
  priority: 'all' | Priority
  dueDate: 'all' | 'today' | 'week' | 'month' | 'overdue'
}

export type TaskSortKey = 'created_at' | 'due_date' | 'priority'
export type SortOrder = 'asc' | 'desc'

export interface TaskSort {
  key: TaskSortKey
  order: SortOrder
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const DEFAULT_FILTERS: TaskFilters = {
  status: 'all',
  priority: 'all',
  dueDate: 'all',
}

export const DEFAULT_SORT: TaskSort = {
  key: 'created_at',
  order: 'desc',
}
