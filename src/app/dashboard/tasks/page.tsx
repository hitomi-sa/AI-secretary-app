'use client'

import { useState } from 'react'
import TaskProvider from '@/contexts/TaskContext'
import { TaskAlertBanner } from '@/components/tasks/TaskAlertBanner'
import { TaskFilter } from '@/components/tasks/TaskFilter'
import { TaskList } from '@/components/tasks/TaskList'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useTasks } from '@/hooks/tasks/useTasks'
import { useTaskContext } from '@/contexts/TaskContext'
import type { TaskInsert, TaskUpdate } from '@/types/database'

function TasksContent() {
  const { filters, sort, setFilters, setSort, tasks } = useTasks()
  const { createTask } = useTaskContext()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')

  const pending = tasks.filter((t) => t.status === 'pending').length
  const completed = tasks.filter((t) => t.status === 'completed').length

  const handleCreate = async (data: TaskInsert | TaskUpdate) => {
    setCreateError('')
    try {
      await createTask(data as TaskInsert)
      setIsCreateOpen(false)
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : '作成に失敗しました')
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">タスク管理</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            未完了 {pending} 件 · 完了 {completed} 件
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          size="md"
          icon={
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          }
        >
          タスクを追加
        </Button>
      </div>

      {/* Alert Banner */}
      <TaskAlertBanner />

      {/* Filter */}
      <TaskFilter
        filters={filters}
        sort={sort}
        onFiltersChange={setFilters}
        onSortChange={setSort}
      />

      {/* Task List */}
      <TaskList />

      {/* Create Modal */}
      <Modal
        open={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); setCreateError('') }}
        title="タスクを追加"
        size="md"
      >
        {createError && (
          <p className="mb-3 text-sm text-destructive">{createError}</p>
        )}
        <TaskForm
          onSubmit={handleCreate}
          onCancel={() => { setIsCreateOpen(false); setCreateError('') }}
        />
      </Modal>
    </div>
  )
}

export default function TasksPage() {
  return (
    <TaskProvider>
      <TasksContent />
    </TaskProvider>
  )
}
