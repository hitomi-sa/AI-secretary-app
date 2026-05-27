import { createClient } from './client'
import type { Task, TaskInsert, TaskUpdate } from '@/types/database'

export async function getTasks(): Promise<Task[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function getAlertTasks(): Promise<Task[]> {
  // 期限が今日から2日以内かつ未完了のタスクを取得
  const supabase = createClient()
  const now = new Date()
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('status', 'pending')
    .lte('due_date', twoDaysLater.toISOString())
    .gte('due_date', now.toISOString())
    .order('due_date', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createTask(task: TaskInsert): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .insert(task)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateTask(id: string, updates: TaskUpdate): Promise<Task> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
