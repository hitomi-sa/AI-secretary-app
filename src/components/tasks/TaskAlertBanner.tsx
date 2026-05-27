'use client'

import { useTaskAlerts } from '@/hooks/tasks/useTaskAlerts'
import { useTaskContext } from '@/contexts/TaskContext'
import { formatDistanceToNow } from '@/lib/utils'

export function TaskAlertBanner() {
  const alerts = useTaskAlerts()
  const { setFilters } = useTaskContext()

  if (alerts.length === 0) return null

  const handleClick = () => {
    setFilters({ status: 'pending', priority: 'all', dueDate: 'week' })
    setTimeout(() => {
      document.getElementById('task-list')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30 hover:bg-warning/15 transition-colors duration-150"
      aria-label={`期限間近のタスク ${alerts.length} 件を表示`}
    >
      <span className="shrink-0 text-warning" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2L1.5 15h15L9 2zM9 7v4M9 12.5v.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-warning">
          期限間近のタスクが {alerts.length} 件あります
        </span>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
          {alerts.slice(0, 3).map((task) => (
            <li key={task.id} className="text-xs text-warning/80 truncate max-w-[200px]">
              {task.title}
              {task.due_date && (
                <span className="ml-1 opacity-70">
                  ({formatDistanceToNow(new Date(task.due_date))})
                </span>
              )}
            </li>
          ))}
          {alerts.length > 3 && (
            <li className="text-xs text-warning/60">他 {alerts.length - 3} 件</li>
          )}
        </ul>
      </div>
      <span className="shrink-0 text-warning/60 text-xs">確認する →</span>
    </button>
  )
}
