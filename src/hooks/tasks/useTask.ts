'use client'

import { useTaskContext } from '@/contexts/TaskContext'

export function useTask(id: string) {
  const { tasks, updateTask, deleteTask, toggleTaskStatus } = useTaskContext()
  const task = tasks.find((t) => t.id === id) ?? null
  return { task, updateTask, deleteTask, toggleTaskStatus }
}
