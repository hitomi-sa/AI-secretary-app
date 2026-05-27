'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDueDate, isOverdue, isDueSoon } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TaskForm } from './TaskForm'
import { useTaskContext } from '@/contexts/TaskContext'
import type { Task, TaskUpdate } from '@/types/database'

interface TaskItemProps {
  task: Task
}

const priorityLabel: Record<Task['priority'], string> = {
  high: '高',
  medium: '中',
  low: '低',
}

const priorityVariant: Record<Task['priority'], 'destructive' | 'warning' | 'default'> = {
  high: 'destructive',
  medium: 'warning',
  low: 'default',
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleTaskStatus, updateTask, deleteTask } = useTaskContext()
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState(false)

  const overdue = isOverdue(task.due_date) && task.status === 'pending'
  const dueSoon = isDueSoon(task.due_date) && task.status === 'pending'

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      await toggleTaskStatus(task.id)
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`「${task.title}」を削除しますか？`)) return
    setIsDeleting(true)
    try {
      await deleteTask(task.id)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEdit = async (data: TaskUpdate) => {
    await updateTask(task.id, data)
    setIsEditOpen(false)
  }

  return (
    <>
      <div
        className={cn(
          'group flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors duration-150',
          task.status === 'completed'
            ? 'bg-surface-1 border-border/30 opacity-60'
            : overdue
            ? 'bg-destructive/5 border-destructive/20'
            : dueSoon
            ? 'bg-warning/5 border-warning/20'
            : 'bg-card border-border/50 hover:border-border',
        )}
      >
        {/* Checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.status === 'completed'}
          aria-label={`${task.title}を${task.status === 'completed' ? '未完了' : '完了'}にする`}
          disabled={isToggling}
          onClick={handleToggle}
          className={cn(
            'mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150',
            task.status === 'completed'
              ? 'bg-success border-success'
              : 'border-border hover:border-primary',
            isToggling && 'opacity-50',
          )}
        >
          {task.status === 'completed' && (
            <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden="true">
              <path
                d="M1 4l3 3 5-6"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'text-sm font-medium text-foreground',
                task.status === 'completed' && 'line-through text-muted-foreground',
              )}
            >
              {task.title}
            </span>
            <Badge variant={priorityVariant[task.priority]} size="sm">
              {priorityLabel[task.priority]}
            </Badge>
          </div>
          {task.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{task.description}</p>
          )}
          {task.due_date && (
            <p
              className={cn(
                'mt-1 text-xs',
                overdue ? 'text-destructive' : dueSoon ? 'text-warning' : 'text-muted-foreground',
              )}
            >
              期限: {formatDueDate(task.due_date)}
              {overdue && ' (期限切れ)'}
              {dueSoon && !overdue && ' (間もなく)'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <Button
            variant="ghost"
            size="sm"
            aria-label="編集"
            onClick={() => setIsEditOpen(true)}
            className="h-7 w-7 p-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M9.5 2.5l2 2-7 7H2.5v-2l7-7z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            aria-label="削除"
            loading={isDeleting}
            onClick={handleDelete}
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M2 3.5h10M5 3.5V2h4v1.5M5.5 6v4M8.5 6v4M3.5 3.5l.5 8h6l.5-8"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>

      <Modal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="タスクを編集"
        size="md"
      >
        <TaskForm task={task} onSubmit={handleEdit} onCancel={() => setIsEditOpen(false)} />
      </Modal>
    </>
  )
}
