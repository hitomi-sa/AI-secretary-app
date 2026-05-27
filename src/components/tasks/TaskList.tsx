'use client'

import { Spinner } from '@/components/ui/Spinner'
import { TaskItem } from './TaskItem'
import { useTasks } from '@/hooks/tasks/useTasks'

export function TaskList() {
  const { filteredTasks, isLoading, error } = useTasks()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="md" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-destructive">
        {error}
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <span className="text-3xl" aria-hidden="true">✓</span>
        <p className="text-sm text-muted-foreground">タスクはありません</p>
      </div>
    )
  }

  return (
    <ul id="task-list" className="flex flex-col gap-2" role="list">
      {filteredTasks.map((task) => (
        <li key={task.id}>
          <TaskItem task={task} />
        </li>
      ))}
    </ul>
  )
}
