'use client'

import { useTaskContext } from '@/contexts/TaskContext'

export function useTasks() {
  const { tasks, filteredTasks, isLoading, error, filters, sort, setFilters, setSort } = useTaskContext()
  return { tasks, filteredTasks, isLoading, error, filters, sort, setFilters, setSort }
}
