'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database'
import type { TaskFilters, TaskSort } from '@/types/task'
import { DEFAULT_FILTERS, DEFAULT_SORT, PRIORITY_ORDER } from '@/types/task'

interface TaskContextType {
  tasks: Task[]
  isLoading: boolean
  error: string | null
  filters: TaskFilters
  sort: TaskSort
  setFilters: (filters: TaskFilters) => void
  setSort: (sort: TaskSort) => void
  createTask: (task: TaskInsert) => Promise<void>
  updateTask: (id: string, updates: TaskUpdate) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  toggleTaskStatus: (id: string) => Promise<void>
  filteredTasks: Task[]
}

const TaskContext = createContext<TaskContextType | undefined>(undefined)

export function useTaskContext(): TaskContextType {
  const ctx = useContext(TaskContext)
  if (!ctx) throw new Error('useTaskContext must be used within TaskProvider')
  return ctx
}

function applyFilters(tasks: Task[], filters: TaskFilters): Task[] {
  const now = new Date()
  return tasks.filter((t) => {
    if (filters.status !== 'all' && t.status !== filters.status) return false
    if (filters.priority !== 'all' && t.priority !== filters.priority) return false
    if (filters.dueDate !== 'all') {
      if (!t.due_date) return false
      const due = new Date(t.due_date)
      if (filters.dueDate === 'overdue') return due < now
      if (filters.dueDate === 'today') {
        return (
          due.getFullYear() === now.getFullYear() &&
          due.getMonth() === now.getMonth() &&
          due.getDate() === now.getDate()
        )
      }
      if (filters.dueDate === 'week') {
        const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
        return due >= now && due <= weekLater
      }
      if (filters.dueDate === 'month') {
        const monthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
        return due >= now && due <= monthLater
      }
    }
    return true
  })
}

function applySort(tasks: Task[], sort: TaskSort): Task[] {
  return [...tasks].sort((a, b) => {
    let cmp = 0
    if (sort.key === 'priority') {
      cmp = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
    } else if (sort.key === 'due_date') {
      const da = a.due_date ? new Date(a.due_date).getTime() : Infinity
      const db = b.due_date ? new Date(b.due_date).getTime() : Infinity
      cmp = da - db
    } else {
      cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    return sort.order === 'asc' ? cmp : -cmp
  })
}

export default function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TaskFilters>(DEFAULT_FILTERS)
  const [sort, setSort] = useState<TaskSort>(DEFAULT_SORT)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('タスクの取得に失敗しました')
      const json = await res.json() as { data: Task[] }
      setTasks(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : '不明なエラー')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTasks()

    channelRef.current = supabase
      .channel('tasks-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => { void fetchTasks() },
      )
      .subscribe()

    return () => {
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current)
      }
    }
  }, [fetchTasks]) // eslint-disable-line react-hooks/exhaustive-deps

  const createTask = useCallback(async (task: TaskInsert) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    })
    if (!res.ok) {
      const json = await res.json() as { error: string }
      throw new Error(json.error ?? 'タスクの作成に失敗しました')
    }
    const created = await res.json() as Task
    setTasks((prev) => [created, ...prev])
  }, [])

  const updateTask = useCallback(async (id: string, updates: TaskUpdate) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t)),
    )
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    if (!res.ok) {
      void fetchTasks()
      const json = await res.json() as { error: string }
      throw new Error(json.error ?? 'タスクの更新に失敗しました')
    }
  }, [fetchTasks])

  const deleteTask = useCallback(async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      void fetchTasks()
      throw new Error('タスクの削除に失敗しました')
    }
  }, [fetchTasks])

  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const nextStatus = task.status === 'pending' ? 'completed' : 'pending'
    await updateTask(id, { status: nextStatus })
  }, [tasks, updateTask])

  const filteredTasks = applySort(applyFilters(tasks, filters), sort)

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        error,
        filters,
        sort,
        setFilters,
        setSort,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        filteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}
