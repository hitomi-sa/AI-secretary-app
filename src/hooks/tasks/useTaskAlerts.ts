'use client'

import { useMemo } from 'react'
import { useTaskContext } from '@/contexts/TaskContext'
import type { Task } from '@/types/database'

export function useTaskAlerts(): Task[] {
  const { tasks } = useTaskContext()

  return useMemo(() => {
    const now = new Date()
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    return tasks.filter((t) => {
      if (t.status !== 'pending' || !t.due_date) return false
      const due = new Date(t.due_date)
      return due >= now && due <= twoDaysLater
    }).sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
  }, [tasks])
}
