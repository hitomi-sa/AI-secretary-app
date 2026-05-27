export type Priority = 'high' | 'medium' | 'low'
export type TaskStatus = 'pending' | 'completed'
export type DocumentType = 'proofread' | 'minutes' | 'research'

export interface Task {
  id: string
  user_id: string | null
  title: string
  description: string | null
  priority: Priority
  start_date: string | null  // ISO 8601 – 作業開始日時（任意）
  due_date: string | null    // ISO 8601 – 締め切り・終了日時
  is_all_day: boolean
  location: string | null
  status: TaskStatus
  created_at: string
  updated_at: string
}

export interface TaskInsert {
  title: string
  description?: string | null
  priority?: Priority
  start_date?: string | null
  due_date?: string | null
  is_all_day?: boolean
  location?: string | null
  status?: TaskStatus
  user_id?: string | null
}

export interface TaskUpdate {
  title?: string
  description?: string | null
  priority?: Priority
  start_date?: string | null
  due_date?: string | null
  is_all_day?: boolean
  location?: string | null
  status?: TaskStatus
}

export interface Document {
  id: string
  user_id: string | null
  type: DocumentType
  title: string
  original_content: string | null
  processed_content: string | null
  metadata: Record<string, unknown>
  created_at: string
}

export interface DocumentInsert {
  type: DocumentType
  title: string
  original_content?: string | null
  processed_content?: string | null
  metadata?: Record<string, unknown>
  user_id?: string | null
}

export interface WritingStyle {
  id: string
  user_id: string | null
  style_patterns: Record<string, unknown>
  sample_count: number
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: Task
        Insert: TaskInsert
        Update: TaskUpdate
      }
      documents: {
        Row: Document
        Insert: DocumentInsert
        Update: Partial<DocumentInsert>
      }
      writing_styles: {
        Row: WritingStyle
        Insert: Omit<WritingStyle, 'id' | 'updated_at'>
        Update: Partial<Omit<WritingStyle, 'id'>>
      }
    }
  }
}
